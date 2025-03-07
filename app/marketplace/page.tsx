'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MarketplaceNFTCard from '@/components/marketplace-nft-card';
import { NFT, User } from '@/lib/types';
import { Loader2, Filter } from 'lucide-react';

// Contract addresses
const nftContractAddress = '0xc210FE7B7034388AE0Da00948C69194690F8242D';
const marketplaceContractAddress = '0xa781C12d9cCA3622AC96dA4acDe6C410dBD95811';

// NFT Contract ABI (only the functions we need)
const nftContractABI = [
  'function getTokenDetails(uint256 tokenId) external view returns (string memory category, string memory metadataURI, string memory title, uint256 timestamp, bool listed, uint256 price)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
];

// Marketplace Contract ABI (only the functions we need)
const marketplaceContractABI = [
  'function getAllActiveListings() external view returns (uint256[] memory)',
  'function getListingsByCategory(string memory category) external view returns (uint256[] memory)',
  'function getListingDetails(uint256 listingId) external view returns (uint256 tokenId, address seller, uint256 price, bool active, string memory category, string memory title, string memory imageUrl, uint256 createdAt)',
  'function purchaseNFT(uint256 listingId) external payable',
];

// Mock categories (replace with actual categories from your app)
const categories = [
  'All',
  'Funny',
  'Crypto',
  'Politics',
  'Sports',
  'Gaming',
  'Animals',
];

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [listedNFTs, setListedNFTs] = useState<
    (NFT & { metadataURI: string, listingId?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Fetch listed NFTs
  useEffect(() => {
    if (walletClient) {
      fetchListedNFTs();
    } else {
      setLoading(false);
    }
  }, [walletClient, selectedCategory]);

  const fetchListedNFTs = async () => {
    try {
      setLoading(true);
      if (!walletClient || !walletClient.transport) return;

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const marketplaceContract = new ethers.Contract(
        marketplaceContractAddress,
        marketplaceContractABI,
        provider
      );

      // Get listing IDs based on selected category
      let listingIds;
      if (selectedCategory === 'All') {
        listingIds = await marketplaceContract.getAllActiveListings();
      } else {
        listingIds = await marketplaceContract.getListingsByCategory(
          selectedCategory
        );
      }

      // Fetch details for each listing
      const nfts = await Promise.all(
        listingIds.map(async (listingId: bigint) => {
          const details = await marketplaceContract.getListingDetails(
            listingId
          );

          // Skip inactive listings
          if (!details.active) return null;

          // Get NFT details to get the metadataURI
          const nftContract = new ethers.Contract(
            nftContractAddress,
            nftContractABI,
            provider
          );
          const nftDetails = await nftContract.getTokenDetails(details.tokenId);

          // Format metadata URI if it's an IPFS URI
          const metadataURI = nftDetails.metadataURI.startsWith('ipfs://')
            ? nftDetails.metadataURI.replace(
                'ipfs://',
                'https://gateway.pinata.cloud/ipfs/'
              )
            : nftDetails.metadataURI;

          console.log('Listing metadata URI:', metadataURI);

          // Get owner address
          const ownerAddress = await nftContract.ownerOf(details.tokenId);

          // Create NFT object
          const nft = {
            id: listingId.toString(),
            tokenId: details.tokenId.toString(),
            title: details.title,
            imageUrl: details.imageUrl, // This will be overridden by metadata
            category: details.category,
            price: Number(ethers.formatEther(details.price)),
            listed: true,
            listingId: listingId.toString(),
            createdAt: new Date(Number(details.createdAt) * 1000).toISOString(),
            metadataURI: metadataURI,
            creator: {
              id: '1',
              username: 'Creator',
              address: details.seller,
              totalUpvotes: 0,
              totalWins: 0,
              avatar: '/placeholder-avatar.jpg',
            },
            owner: {
              id: '1',
              username: 'Owner',
              address: ownerAddress,
              totalUpvotes: 0,
              totalWins: 0,
              avatar: '/placeholder-avatar.jpg',
            },
          };

          return nft;
        })
      );

      // Filter out null values (inactive listings)
      setListedNFTs(nfts.filter(Boolean) as (NFT & { metadataURI: string, listingId?: string })[]);
    } catch (error) {
      console.error('Error fetching listed NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseNFT = async (nft: NFT) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase NFTs');
      return;
    }

    try {
      setIsPurchasing(true);
      setPurchasingId(nft.id);

      if (!walletClient || !walletClient.transport) return;

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const marketplaceContract = new ethers.Contract(
        marketplaceContractAddress,
        marketplaceContractABI,
        signer
      );

      // Purchase the NFT
      const tx = await marketplaceContract.purchaseNFT(nft.id, {
        value: ethers.parseEther(nft.price.toString()),
      });

      await tx.wait();

      // Refresh the listings
      fetchListedNFTs();

      alert(`Successfully purchased ${nft.title}!`);
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Failed to purchase NFT. Please try again.');
    } finally {
      setIsPurchasing(false);
      setPurchasingId(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Banner */}
      <div className="w-full h-[330px] mb-12 relative">
        <img
          src="/marketplace-banner.jpg"
          alt="NFT Marketplace"
          className="w-full h-full object-cover"
        />
        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center ml-10">
          <div className="p-6 rounded-lg">
            <h1
              className="text-5xl font-extrabold mb-2 mt-4"
              style={{
                color: '#00ffff', // Neon cyan
                textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff',
              }}
            >
              NFT Marketplace
            </h1>
            <p
              className="text-lg max-w-md mt-8"
              style={{
                color: '#ffffff', // White with glow
                textShadow: '0 0 5px #ffffff, 0 0 10px #ffffff',
              }}
            >
              Buy and sell unique meme NFTs from the community
            </p>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-14"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Browse NFTs</h2>
            <p className="text-muted-foreground">
              Discover and collect unique meme NFTs
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading marketplace...</span>
          </div>
        ) : listedNFTs.length === 0 ? (
          <div className="text-center p-8 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">No NFTs Listed</h2>
            <p className="mb-6">
              There are no NFTs listed in the marketplace yet.
            </p>
            <Button asChild>
              <a href="/my-nfts">List Your NFTs</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listedNFTs.map((nft) => {
              const isOwner = nft.creator.address.toLowerCase() === address?.toLowerCase();
              return (
                <div key={nft.id}>
                  <MarketplaceNFTCard
                    nft={nft}
                    metadataURI={nft.metadataURI}
                    isOwner={isOwner}
                    onBuyClick={
                      !isOwner ? handlePurchaseNFT : undefined
                    }
                    isPurchasing={isPurchasing && purchasingId === nft.id}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
