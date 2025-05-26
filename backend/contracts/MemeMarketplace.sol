// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IMemeNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getTokenCategory(uint256 tokenId) external view returns (string memory);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function updateNFTListing(uint256 tokenId, bool listed, uint256 price) external;
    function getTokenDetails(uint256 tokenId) external view returns (
        string memory category,
        string memory metadataURI,
        string memory title,
        uint256 timestamp,
        bool listed,
        uint256 price
    );
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
}

contract MemeMarketplace is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        string category;
        string title;
        string imageUrl;
        uint256 createdAt;
    }
    
    // State variables
    address public nftContractAddress;
    uint256 public feePercentage = 250; // 2.5% (in basis points)
    Counters.Counter private _listingIds;
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256) public tokenIdToListingId;
    
    // Events
    event ListingCreated(uint256 listingId, uint256 tokenId, address seller, uint256 price, string category, string title);
    event ListingUpdated(uint256 listingId, uint256 newPrice);
    event ListingCancelled(uint256 listingId);
    event NFTPurchased(uint256 listingId, uint256 tokenId, address seller, address buyer, uint256 price);
    event FeePercentageUpdated(uint256 newFeePercentage);
    
    constructor(address _nftContractAddress) Ownable(msg.sender) {
        nftContractAddress = _nftContractAddress;
    }
    
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(_feePercentage);
    }
    
    function createListing(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(IMemeNFT(nftContractAddress).ownerOf(tokenId) == msg.sender, "Only owner can list NFT");
        require(tokenIdToListingId[tokenId] == 0, "NFT already listed");
        
        // Get token details from NFT contract
        (
            string memory category,
            string memory metadataURI,
            string memory title,
            ,
            ,
            
        ) = IMemeNFT(nftContractAddress).getTokenDetails(tokenId);
        
        // Ensure the marketplace has approval to transfer the NFT
        if (IMemeNFT(nftContractAddress).getApproved(tokenId) != address(this) && 
            !IMemeNFT(nftContractAddress).isApprovedForAll(msg.sender, address(this))) {
            IMemeNFT(nftContractAddress).approve(address(this), tokenId);
        }
        
        _listingIds.increment();
        uint256 listingId = _listingIds.current();
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            category: category,
            title: title,
            imageUrl: metadataURI,
            createdAt: block.timestamp
        });
        
        tokenIdToListingId[tokenId] = listingId;
        
        // Update NFT listing status in the NFT contract
        IMemeNFT(nftContractAddress).updateNFTListing(tokenId, true, price);
        
        emit ListingCreated(listingId, tokenId, msg.sender, price, category, title);
    }
    
    function updateListing(uint256 listingId, uint256 newPrice) external nonReentrant {
        require(newPrice > 0, "Price must be greater than zero");
        require(listings[listingId].active, "Listing is not active");
        require(listings[listingId].seller == msg.sender, "Only seller can update listing");
        
        listings[listingId].price = newPrice;
        
        // Update NFT price in the NFT contract
        IMemeNFT(nftContractAddress).updateNFTListing(listings[listingId].tokenId, true, newPrice);
        
        emit ListingUpdated(listingId, newPrice);
    }
    
    function cancelListing(uint256 listingId) external nonReentrant {
        require(listings[listingId].active, "Listing is not active");
        require(
            listings[listingId].seller == msg.sender || msg.sender == owner(),
            "Only seller or owner can cancel listing"
        );
        
        Listing storage listing = listings[listingId];
        listing.active = false;
        
        // Update NFT listing status in the NFT contract
        IMemeNFT(nftContractAddress).updateNFTListing(listing.tokenId, false, 0);
        
        // Clear the mapping
        tokenIdToListingId[listing.tokenId] = 0;
        
        emit ListingCancelled(listingId);
    }
    
    function purchaseNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Seller cannot buy their own NFT");
        
        // Ensure the seller still owns the NFT and we have approval
        address currentOwner = IMemeNFT(nftContractAddress).ownerOf(listing.tokenId);
        require(currentOwner == listing.seller, "Seller no longer owns this NFT");
        
        // Mark listing as inactive
        listing.active = false;
        
        // Calculate fee and payment amount
        uint256 fee = (listing.price * feePercentage) / 10000;
        uint256 sellerPayment = listing.price - fee;
        
        // Transfer NFT to buyer
        IMemeNFT(nftContractAddress).transferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: sellerPayment}("");
        require(success, "Failed to send payment to seller");
        
        // Update NFT listing status in the NFT contract
        IMemeNFT(nftContractAddress).updateNFTListing(listing.tokenId, false, 0);
        
        // Clear the mapping
        tokenIdToListingId[listing.tokenId] = 0;
        
        // Refund excess payment if any
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Failed to refund excess payment");
        }
        
        emit NFTPurchased(listingId, listing.tokenId, listing.seller, msg.sender, listing.price);
    }
    
    // Rest of the contract remains the same...
    
    function getListingsByCategory(string memory category) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256 total = _listingIds.current();
        
        // First, count how many active listings match the category
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active && 
                keccak256(bytes(listings[i].category)) == keccak256(bytes(category))) {
                count++;
            }
        }
        
        // Create array of the right size
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        // Fill array with matching listing IDs
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active && 
                keccak256(bytes(listings[i].category)) == keccak256(bytes(category))) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    function getAllActiveListings() external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256 total = _listingIds.current();
        
        // First, count active listings
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active) {
                count++;
            }
        }
        
        // Create array of the right size
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        // Fill array with active listing IDs
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].active) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    function getListingDetails(uint256 listingId) external view returns (
        uint256 tokenId,
        address seller,
        uint256 price,
        bool active,
        string memory category,
        string memory title,
        string memory imageUrl,
        uint256 createdAt
    ) {
        Listing storage listing = listings[listingId];
        return (
            listing.tokenId,
            listing.seller,
            listing.price,
            listing.active,
            listing.category,
            listing.title,
            listing.imageUrl,
            listing.createdAt
        );
    }
    
    // Withdraw accumulated fees (onlyOwner)
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Failed to withdraw fees");
    }
}