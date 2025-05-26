// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemeNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    address public memeBattleContract;
    address public marketplaceContract;
    
    struct TokenMetadata {
        string category;
        string metadataURI;
        string title;
        uint256 timestamp;
        bool listed;
        uint256 price;
    }
    
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    mapping(address => uint256[]) public userTokens;
    mapping(string => uint256) private categoryMintCount;

    
    event MemeNFTMinted(uint256 tokenId, address to, string metadataURI, string category, string title);
    event NFTListed(uint256 tokenId, bool listed, uint256 price);
    event DebugUpdate(address indexed from, address indexed to, uint256 indexed tokenId);
    
    constructor() ERC721("MemeBattle NFT", "MEME") Ownable(msg.sender) {}
    
    function setMemeBattleContract(address _memeBattleContract) external onlyOwner {
        memeBattleContract = _memeBattleContract;
    }
    
    function setMarketplaceContract(address _marketplaceContract) external onlyOwner {
        marketplaceContract = _marketplaceContract;
    }
    
    function mintNFT(address winner, string memory metadataURI, string memory category) external returns (uint256) {
        require(msg.sender == memeBattleContract, "Only battle contract can mint");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(winner, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        // Increment category-specific counter
        categoryMintCount[category]++;
        
        // Format title with category and incrementing number
        string memory formattedTitle = string.concat("Winning Meme: ", category, " #", Strings.toString(categoryMintCount[category]));

        tokenMetadata[newTokenId] = TokenMetadata({
            category: category,
            metadataURI: metadataURI,
            title: formattedTitle,
            timestamp: block.timestamp,
            listed: false,
            price: 0
        });
        
        // Store token for user
        userTokens[winner].push(newTokenId);
        
        // Emit event
        emit MemeNFTMinted(newTokenId, winner, metadataURI, category, formattedTitle);
        
        return newTokenId;
    }

    
    function mintNFTWithTitle(address winner, string memory metadataURI, string memory category, string memory title) external returns (uint256) {
        require(msg.sender == memeBattleContract, "Only battle contract can mint");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(winner, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        // Store additional metadata
        tokenMetadata[newTokenId] = TokenMetadata({
            category: category,
            metadataURI: metadataURI,
            title: title,
            timestamp: block.timestamp,
            listed: false,
            price: 0
        });
        
        // Store token for user
        userTokens[winner].push(newTokenId);
        
        // Emit event
        emit MemeNFTMinted(newTokenId, winner, metadataURI, category, title);
        
        return newTokenId;
    }
    
    function updateNFTListing(uint256 tokenId, bool listed, uint256 price) external {
        require(msg.sender == marketplaceContract || msg.sender == ownerOf(tokenId), "Only marketplace or owner can update listing");
        
        tokenMetadata[tokenId].listed = listed;
        tokenMetadata[tokenId].price = price;
        
        emit NFTListed(tokenId, listed, price);
    }
    
    function getUserTokens(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    // Add this function to get tokens that are owned by a user OR listed by them
    function getUserOwnedAndListedTokens(address user) external view returns (uint256[] memory) {
        // Get total tokens to correctly size our array
        uint256 totalTokens = _tokenIds.current();
        uint256 userTokenCount = 0;
        
        // Count tokens owned or listed by this user
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i)) {
                // Check if user is the owner or if user has listed the token
                if (ownerOf(i) == user || 
                    (tokenMetadata[i].listed && _isUserSeller(i, user))) {
                    userTokenCount++;
                }
            }
        }
        
        // Create array of the right size
        uint256[] memory result = new uint256[](userTokenCount);
        uint256 index = 0;
        
        // Fill array with tokens owned or listed by this user
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i)) {
                if (ownerOf(i) == user || 
                    (tokenMetadata[i].listed && _isUserSeller(i, user))) {
                    result[index] = i;
                    index++;
                }
            }
        }
        
        return result;
    }
    
    // Helper function to check if a user is the seller of a listed token
    function _isUserSeller(uint256 tokenId, address user) internal view returns (bool) {
        // You would need to implement this based on your marketplace logic
        // This could check with the marketplace contract
        if (marketplaceContract != address(0)) {
            // Call a function on marketplace to check if the user is the seller
            // Example implementation (pseudo code):
            // return IMarketplace(marketplaceContract).isTokenSellerByUser(tokenId, user);
            
            // Simplified version for demonstration:
            return tokenMetadata[tokenId].listed && ownerOf(tokenId) == user;
        }
        return false;
    }
    
    function getTokenCategory(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId].category;
    }
    
    function getTokenDetails(uint256 tokenId) external view returns (
        string memory category,
        string memory metadataURI,
        string memory title,
        uint256 timestamp,
        bool listed,
        uint256 price
    ) {
        require(_exists(tokenId), "Token does not exist");
        TokenMetadata storage metadata = tokenMetadata[tokenId];
        
        return (
            metadata.category,
            metadata.metadataURI,
            metadata.title,
            metadata.timestamp,
            metadata.listed,
            metadata.price
        );
    }
    
    function getAllTokensByCategory(string memory category) external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256 categoryTokenCount = 0;
        
        // First, count tokens in this category
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && keccak256(bytes(tokenMetadata[i].category)) == keccak256(bytes(category))) {
                categoryTokenCount++;
            }
        }
        
        // Create array of the right size
        uint256[] memory result = new uint256[](categoryTokenCount);
        uint256 index = 0;
        
        // Fill array with matching token IDs
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && keccak256(bytes(tokenMetadata[i].category)) == keccak256(bytes(category))) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    function getAllListedTokens() external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256 listedTokenCount = 0;
        
        // First, count listed tokens
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && tokenMetadata[i].listed) {
                listedTokenCount++;
            }
        }
        
        // Create array of the right size
        uint256[] memory result = new uint256[](listedTokenCount);
        uint256 index = 0;
        
        // Fill array with listed token IDs
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && tokenMetadata[i].listed) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds.current() && ownerOf(tokenId) != address(0);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Override _update to handle userTokens mapping during transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId); // Use _ownerOf for internal consistency

        // Call the parent _update function first to get the new owner
        address updatedFrom = super._update(to, tokenId, auth);
        
        // Handle userTokens mapping updates only when the NFT isn't being listed (transferring ownership)
        // When listing on marketplace, keep track of both the original owner and the marketplace
        if (to != marketplaceContract && from != marketplaceContract) {
            // Remove tokenId from the previous owner's userTokens array
            if (from != address(0)) {
                uint256[] storage fromTokens = userTokens[from];
                uint256 length = fromTokens.length;

                // Find and remove the tokenId from the array
                for (uint256 i = 0; i < length; i++) {
                    if (fromTokens[i] == tokenId) {
                        // Swap with the last element and pop
                        if (i < length - 1) {
                            fromTokens[i] = fromTokens[length - 1];
                        }
                        fromTokens.pop();
                        break; // Exit the loop once the tokenId is found and removed
                    }
                }
            }

            // Add tokenId to the new owner's userTokens array
            if (to != address(0)) {
                // Ensure the tokenId is not already in the array
                uint256[] storage toTokens = userTokens[to];
                bool alreadyExists = false;
                for (uint256 i = 0; i < toTokens.length; i++) {
                    if (toTokens[i] == tokenId) {
                        alreadyExists = true;
                        break;
                    }
                }
                if (!alreadyExists) {
                    toTokens.push(tokenId);
                }
            }
        }

        return updatedFrom;
    }
}