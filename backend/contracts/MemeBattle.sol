// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IMemeNFT {
    function mintNFT(address winner, string memory metadataURI, string memory category) external returns (uint256);
}

contract MemeBattle is Ownable, AutomationCompatibleInterface {
    using Strings for uint256;
    
    struct Meme {
        uint256 id;
        address creator;
        string title;
        string description;
        string imageURI;
        string metadataURI;
        uint256 upvotes;
        string timestamp;
        bool exists;
    }
    
    struct Battle {
        uint256 startTime;
        uint256 endTime;
        uint256 nextStartTime;
        uint256[] memeIds;
        bool completed;
        address winner;
        uint256 winningMemeId;
    }
    
    struct BattleInfo {
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 nextStartTime;
        uint256 memeCount;
        bool completed;
        address winner;
        uint256 winningMemeId;
    }
    
    // Constants
    uint256 public constant BATTLE_DURATION = 10 minutes; // Short duration for testing
    uint256 public constant BUFFER_DURATION = 2 minutes; // Short buffer for testing
    
    // Mappings
    mapping(string => Battle) public battles;
    mapping(uint256 => Meme) public memes;
    mapping(address => mapping(uint256 => bool)) public hasUpvoted;
    mapping(address => mapping(string => bool)) public hasParticipated;
    
    // Variables
    uint256 private memeIdCounter = 1;
    address public nftContractAddress;
    string[] public categories;
    
    // Events
    event BattleStarted(string category, uint256 startTime, uint256 endTime);
    event MemeSubmitted(uint256 memeId, address creator, string category);
    event MemeUpvoted(uint256 memeId, address voter);
    event BattleCompleted(string category, address winner, uint256 winningMemeId);
    // Change the event name (line 68)
    event MemeInfoRequested(uint256 memeId);    

    constructor() Ownable(msg.sender) {
        categories = ["Crypto", "Gaming", "Tech", "Funny", "NFT"];
        for (uint i = 0; i < categories.length; i++) {
            _initializeBattle(categories[i]);
        }
    }

    // Set NFT contract address
    function setNFTContractAddress(address _nftContractAddress) external onlyOwner {
        nftContractAddress = _nftContractAddress;
    }

    // Add a new category
    function addCategory(string memory category) external onlyOwner {
        require(!_categoryExists(category), "Category already exists");
        categories.push(category);
        _initializeBattle(category);
        emit BattleStarted(category, battles[category].startTime, battles[category].endTime);
    }

    // Check if a category exists
    function _categoryExists(string memory category) internal view returns (bool) {
        for (uint i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(category))) {
                return true;
            }
        }
        return false;
    }

    // Initialize a new battle for a category
    function _initializeBattle(string memory category) internal {
        uint256 startTime = block.timestamp;
        battles[category] = Battle({
            startTime: startTime,
            endTime: startTime + BATTLE_DURATION,
            nextStartTime: startTime + BATTLE_DURATION,
            memeIds: new uint256[](0),
            completed: false,
            winner: address(0),
            winningMemeId: 0
        });
    }

    // Submit a meme to a battle
    function submitMeme(
        string memory category,
        string memory title,
        string memory description,
        string memory imageURI,
        string memory metadataURI
    ) external {
        require(_categoryExists(category), "Invalid category");
        require(isBattleActive(category), "Battle not active");
        require(!hasParticipated[msg.sender][category], "Already participated");

        uint256 memeId = memeIdCounter++;
        memes[memeId] = Meme({
            id: memeId,
            creator: msg.sender,
            title: title,
            description: description,
            imageURI: imageURI,
            metadataURI: metadataURI,
            upvotes: 0,
            timestamp: _timestampToString(block.timestamp),
            exists: true
        });

        battles[category].memeIds.push(memeId);
        hasParticipated[msg.sender][category] = true;
        emit MemeSubmitted(memeId, msg.sender, category);
    }

    // Upvote a meme
    function upvoteMeme(uint256 memeId) external {
        require(memes[memeId].exists, "Invalid meme");
        require(!hasUpvoted[msg.sender][memeId], "Already upvoted");
        
        string memory category = _findMemeCategory(memeId);
        require(isBattleActive(category), "Battle not active");

        memes[memeId].upvotes++;
        hasUpvoted[msg.sender][memeId] = true;
        emit MemeUpvoted(memeId, msg.sender);
    }

    // Find the category of a meme
    function _findMemeCategory(uint256 memeId) internal view returns (string memory) {
        for (uint i = 0; i < categories.length; i++) {
            uint256[] memory ids = battles[categories[i]].memeIds;
            for (uint j = 0; j < ids.length; j++) {
                if (ids[j] == memeId) {
                    return categories[i];
                }
            }
        }
        revert("Meme not in any battle");
    }

    // Check if a battle is active
    function isBattleActive(string memory category) public view returns (bool) {
        Battle storage battle = battles[category];
        return block.timestamp >= battle.startTime && block.timestamp < battle.endTime;
    }

    // Chainlink Automation: Check if upkeep is needed
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        string[] memory pendingCategories = new string[](categories.length);
        uint256 count = 0;
        
        for (uint i = 0; i < categories.length; i++) {
            string memory category = categories[i];
            Battle storage battle = battles[category];
            
            if (!battle.completed && block.timestamp >= battle.endTime) {
                pendingCategories[count] = category;
                count++;
            }
        }
        
        if (count > 0) {
            string[] memory filtered = new string[](count);
            for (uint i = 0; i < count; i++) {
                filtered[i] = pendingCategories[i];
            }
            return (true, abi.encode(filtered));
        }
        return (false, "");
    }

    // Chainlink Automation: Perform upkeep
    function performUpkeep(bytes calldata performData) external override {
        string[] memory categoriesToComplete = abi.decode(performData, (string[]));
        
        for (uint i = 0; i < categoriesToComplete.length; i++) {
            string memory category = categoriesToComplete[i];
            Battle storage battle = battles[category];
            
            if (!battle.completed && block.timestamp >= battle.endTime) {
                _completeBattle(category);
            }
        }
    }

    // Complete a battle and reset it
    function _completeBattle(string memory category) internal {
        Battle storage battle = battles[category];
        require(!battle.completed, "Battle already completed");
        require(block.timestamp >= battle.endTime, "Battle not ended yet");

        uint256[] memory memeIds = battle.memeIds;
        address winner = address(0);
        uint256 winningMemeId = 0;
        uint256 maxUpvotes = 0;

        if (memeIds.length > 0) {
            for (uint i = 0; i < memeIds.length; i++) {
                Meme storage meme = memes[memeIds[i]];
                if (meme.upvotes > maxUpvotes) {
                    maxUpvotes = meme.upvotes;
                    winningMemeId = meme.id;
                    winner = meme.creator;
                }
            }

            if (winner != address(0) && nftContractAddress != address(0)) {
                IMemeNFT(nftContractAddress).mintNFT(
                    winner,
                    memes[winningMemeId].metadataURI,
                    category
                );
            }
        }

        // Update battle state
        battle.completed = true;
        battle.winner = winner;
        battle.winningMemeId = winningMemeId;
        
        emit BattleCompleted(category, winner, winningMemeId);
        _resetBattle(category);
    }

    // Reset a battle for the next round
    function _resetBattle(string memory category) internal {
        Battle storage battle = battles[category];
        
        // Clear existing participations
        for (uint i = 0; i < battle.memeIds.length; i++) {
            address creator = memes[battle.memeIds[i]].creator;
            hasParticipated[creator][category] = false;
        }

        // Calculate next battle times
        uint256 newStartTime = battle.nextStartTime;
        if (block.timestamp > newStartTime) {
            newStartTime = block.timestamp;
        }

        // Create new battle
        battles[category] = Battle({
            startTime: newStartTime,
            endTime: newStartTime + BATTLE_DURATION,
            nextStartTime: newStartTime + BATTLE_DURATION,
            memeIds: new uint256[](0),
            completed: false,
            winner: address(0),
            winningMemeId: 0
        });

        emit BattleStarted(category, newStartTime, newStartTime + BATTLE_DURATION);
    }

    // Helper function to convert timestamp to string
    function _timestampToString(uint256 timestamp) internal pure returns (string memory) {
        if (timestamp == 0) {
            return "0";
        }
        uint256 temp = timestamp;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (timestamp != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + timestamp % 10));
            timestamp /= 10;
        }
        return string(buffer);
    }

    // View functions
    function getBattleInfo(string memory category) external view returns (BattleInfo memory) {
        Battle storage battle = battles[category];
        return BattleInfo({
            startTime: battle.startTime,
            endTime: battle.endTime,
            active: isBattleActive(category),
            nextStartTime: battle.nextStartTime,
            memeCount: battle.memeIds.length,
            completed: battle.completed,
            winner: battle.winner,
            winningMemeId: battle.winningMemeId
        });
    }

    function getMemesByCategory(string memory category) external view returns (uint256[] memory) {
        return battles[category].memeIds;
    }

    function getMemeInfo(uint256 memeId) external view returns (
        address creator,
        string memory title,
        string memory description,
        string memory imageURI,
        string memory metadataURI,
        uint256 upvotes,
        string memory timestamp
    ) {
        Meme storage meme = memes[memeId];
        require(meme.exists, "Meme does not exist");
        
        // Note: You can't emit events in view functions, so you'll need to remove this
        // emit MemeInfoRequested(memeId);
        
        return (
            meme.creator,
            meme.title,
            meme.description,
            meme.imageURI,
            meme.metadataURI,
            meme.upvotes,
            meme.timestamp
        );
    }

    // Add a separate non-view function for emitting the event
    function requestMemeInfo(uint256 memeId) external {
        require(memes[memeId].exists, "Meme does not exist");
        emit MemeInfoRequested(memeId);
    }

    function getCategoryCount() external view returns (uint256) {
        return categories.length;
    }

    function getAllCategories() external view returns (string[] memory) {
        return categories;
    }
}