'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import MarketplaceNFTCard from '@/components/marketplace-nft-card';
import { NFT, User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Contract addresses
const nftContractAddress = '0xc210FE7B7034388AE0Da00948C69194690F8242D';
const marketplaceContractAddress = '0xa781C12d9cCA3622AC96dA4acDe6C410dBD95811';

// NFT Contract ABI (only the functions we need)
const nftContractABI = [
  'function getUserOwnedAndListedTokens(address user) external view returns (uint256[] memory)',
  'function getTokenDetails(uint256 tokenId) external view returns (string memory category, string memory metadataURI, string memory title, uint256 timestamp, bool listed, uint256 price)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function updateNFTListing(uint256 tokenId, bool listed, uint256 price) external',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'function approve(address to, uint256 tokenId) external',
  'function getApproved(uint256 tokenId) external view returns (address)',
];

// Marketplace Contract ABI (only the functions we need)
const marketplaceContractABI = [
  'function createListing(uint256 tokenId, uint256 price) external',
  'function cancelListing(uint256 listingId) external',
  'function updateListing(uint256 listingId, uint256 newPrice) external',
  'function tokenIdToListingId(uint256 tokenId) external view returns (uint256)',
  'function getAllActiveListings() external view returns (uint256[] memory)',
  'function getListingDetails(uint256 listingId) external view returns (uint256 tokenId, address seller, uint256 price, bool active, string memory category, string memory title, string memory imageUrl, uint256 createdAt)',
];

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [myNFTs, setMyNFTs] = useState<(NFT & { metadataURI: string, listingId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT & { listingId?: string } | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(true);
  const [cancellingNftId, setCancellingNftId] = useState<string | null>(null);

  // Fetch user's NFTs
  useEffect(() => {
    if (isConnected && address && walletClient) {
      fetchMyNFTs();
      checkMarketplaceApproval();
    } else {
      setLoading(false);
    }
  }, [isConnected, address, walletClient]);

  const checkMarketplaceApproval = async () => {
    try {
      setIsCheckingApproval(true);
      if (!walletClient || !walletClient.transport) {
        console.log('No wallet client available for approval check');
        setIsCheckingApproval(false);
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(
        nftContractAddress,
        nftContractABI,
        signer
      );

      console.log(
        'Checking approval for address:',
        address,
        'marketplace:',
        marketplaceContractAddress
      );
      const isApproved = await nftContract.isApprovedForAll(
        address,
        marketplaceContractAddress
      );
      console.log('Approval status:', isApproved);
      setIsApproved(isApproved);
    } catch (error) {
      console.error('Error checking marketplace approval:', error);
      // Set to true by default if there's an error checking, to not block the UI
      setIsApproved(true);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const approveMarketplace = async () => {
    try {
      setIsSubmitting(true);
      if (!walletClient || !walletClient.transport) return;

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(
        nftContractAddress,
        nftContractABI,
        signer
      );

      const tx = await nftContract.setApprovalForAll(
        marketplaceContractAddress,
        true
      );
      await tx.wait();

      setIsApproved(true);
    } catch (error) {
      console.error('Error approving marketplace:', error);
      alert('Failed to approve marketplace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMyNFTs = async () => {
    try {
      setLoading(true);
      if (!walletClient || !walletClient.transport) {
        console.log('No wallet client available');
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(
        nftContractAddress,
        nftContractABI,
        signer
      );

      const marketplaceContract = new ethers.Contract(
        marketplaceContractAddress,
        marketplaceContractABI,
        signer
      );

      // Get user's tokens (both owned and listed)
      console.log('Fetching tokens for address:', address);
      const tokenIds = await nftContract.getUserOwnedAndListedTokens(address);
      console.log('Token IDs (owned and listed):', tokenIds);

      if (tokenIds.length === 0) {
        console.log('No tokens found for user');
        setMyNFTs([]);
        setLoading(false);
        return;
      }

      // Fetch details for each token
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          console.log('Fetching details for token:', tokenId.toString());
          const details = await nftContract.getTokenDetails(tokenId);
          console.log('Token details:', details);

          // Get listing details if the token is listed
          let listingId = null;
          let listingDetails = null;
          if (details.listed) {
            try {
              listingId = await marketplaceContract.tokenIdToListingId(tokenId);
              if (listingId > 0) {
                listingDetails = await marketplaceContract.getListingDetails(listingId);
                console.log('Listing details:', listingDetails);
              }
            } catch (error) {
              console.error('Error fetching listing details:', error);
            }
          }

          // Format metadata URI if it's an IPFS URI
          const metadataURI = details.metadataURI.startsWith('ipfs://')
            ? details.metadataURI.replace(
                'ipfs://',
                'https://gateway.pinata.cloud/ipfs/'
              )
            : details.metadataURI;

          // Fetch metadata content
          try {
            console.log('Fetching metadata from:', metadataURI);
            const metadataResponse = await fetch(metadataURI);
            const metadata = await metadataResponse.json();
            console.log('Metadata fetched:', metadata);

            // Create NFT object
            const nft = {
              id: tokenId.toString(),
              tokenId: tokenId.toString(),
              title: details.title || metadata.name,
              imageUrl: metadata.image || '', // Use image from metadata
              category: details.category,
              price: listingDetails ? Number(ethers.formatEther(listingDetails.price)) : Number(ethers.formatEther(details.price || '0')),
              listed: details.listed,
              listingId: listingId?.toString(),
              createdAt: new Date(Number(details.timestamp) * 1000).toISOString(),
              metadataURI: metadataURI,
              creator: {
                id: '1',
                username: 'You',
                address: address || '',
                totalUpvotes: 0,
                totalWins: 0,
                avatar: '/placeholder-avatar.jpg',
              },
              owner: {
                id: '1',
                username: 'You',
                address: address || '',
                totalUpvotes: 0,
                totalWins: 0,
                avatar: '/placeholder-avatar.jpg',
              },
            };

            return nft;
          } catch (metadataError) {
            console.error('Error fetching metadata:', metadataError);
            // Return basic NFT object if metadata fetch fails
            return {
              id: tokenId.toString(),
              tokenId: tokenId.toString(),
              title: details.title || 'Unknown Title',
              imageUrl: '', // Placeholder or default image
              category: details.category,
              price: listingDetails ? Number(ethers.formatEther(listingDetails.price)) : Number(ethers.formatEther(details.price || '0')),
              listed: details.listed,
              listingId: listingId?.toString(),
              createdAt: new Date(Number(details.timestamp) * 1000).toISOString(),
              metadataURI: metadataURI,
              creator: {
                id: '1',
                username: 'You',
                address: address || '',
                totalUpvotes: 0,
                totalWins: 0,
                avatar: '/placeholder-avatar.jpg',
              },
              owner: {
                id: '1',
                username: 'You',
                address: address || '',
                totalUpvotes: 0,
                totalWins: 0,
                avatar: '/placeholder-avatar.jpg',
              },
            };
          }
        })
      );

      console.log('Final NFTs array:', nfts);
      setMyNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setMyNFTs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setListingPrice(nft.listed ? nft.price.toString() : '');
    setShowListingModal(true);
  };

  const handleCancelListing = async (nft: NFT & { listingId?: string }) => {
    if (!nft.listed || !nft.listingId) return;

    try {
      setIsSubmitting(true);
      setCancellingNftId(nft.id);
      if (!walletClient || !walletClient.transport) return;

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const marketplaceContract = new ethers.Contract(
        marketplaceContractAddress,
        marketplaceContractABI,
        signer
      );

      // Use the listingId directly instead of looking it up
      const tx = await marketplaceContract.cancelListing(nft.listingId);
      await tx.wait();

      // Refresh NFTs
      fetchMyNFTs();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      alert('Failed to cancel listing. Please try again.');
    } finally {
      setIsSubmitting(false);
      setCancellingNftId(null);
    }
  };

  const handleSubmitListing = async () => {
    if (!selectedNFT || !listingPrice) return;

    try {
      setIsSubmitting(true);
      if (!walletClient || !walletClient.transport) return;

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const marketplaceContract = new ethers.Contract(
        marketplaceContractAddress,
        marketplaceContractABI,
        signer
      );

      const priceInWei = ethers.parseEther(listingPrice);

      if (selectedNFT.listed) {
        // Get the listing ID from the token ID
        const listingId = await marketplaceContract.tokenIdToListingId(
          selectedNFT.tokenId
        );

        // Update the listing
        const tx = await marketplaceContract.updateListing(
          listingId,
          priceInWei
        );
        await tx.wait();
      } else {
        // Create a new listing
        const tx = await marketplaceContract.createListing(
          selectedNFT.tokenId,
          priceInWei
        );
        await tx.wait();
      }

      // Close modal and refresh NFTs
      setShowListingModal(false);
      fetchMyNFTs();
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert('Failed to list NFT. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">My NFT Collection</h1>
        <p className="text-muted-foreground">
          View and manage your NFTs from Meme Battles
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
          <p className="mb-6">
            Please connect your wallet to view your NFT collection
          </p>
          <ConnectButton />
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your NFTs...</span>
        </div>
      ) : (
        <>
          {isCheckingApproval ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Checking marketplace approval...</span>
                </div>
              </CardContent>
            </Card>
          ) : !isApproved ? (
            <Card className="mb-8 bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Marketplace Approval Required
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      To list your NFTs on the marketplace, you need to approve
                      the marketplace contract first.
                    </p>
                  </div>
                  <Button onClick={approveMarketplace} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      'Approve Marketplace'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {myNFTs.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-4">No NFTs Found</h2>
              <p className="mb-6">
                You do not have any NFTs in your collection yet.
              </p>
              <Button asChild>
                <a href="/categories">Participate in Battles</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNFTs.map((nft) => (
                <div key={nft.id}>
                  <MarketplaceNFTCard
                    nft={nft}
                    metadataURI={nft.metadataURI}
                    isOwner={true}
                    onListClick={handleListNFT}
                    onCancelClick={nft.listed ? handleCancelListing : undefined}
                    isMarketplaceApproved={isApproved}
                    isCancelling={cancellingNftId === nft.id}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Listing Modal */}
      <Dialog open={showListingModal} onOpenChange={setShowListingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNFT?.listed
                ? 'Update Listing Price'
                : 'List NFT for Sale'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price (ETH)
              </label>
              <Input
                id="price"
                type="number"
                step="0.001"
                min="0"
                placeholder="Enter price in ETH"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowListingModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitListing}
              disabled={!listingPrice || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedNFT?.listed ? 'Updating...' : 'Listing...'}
                </>
              ) : selectedNFT?.listed ? (
                'Update Listing'
              ) : (
                'List NFT'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
