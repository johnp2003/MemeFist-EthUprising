'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, DollarSign, Eye, Share2, Loader2 } from 'lucide-react';
import { NFT } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface MarketplaceNFTCardProps {
  nft: NFT & { listingId?: string };
  metadataURI: string;
  isOwner?: boolean;
  onListClick?: (nft: NFT & { listingId?: string }) => void;
  onCancelClick?: (nft: NFT & { listingId?: string }) => void;
  onBuyClick?: (nft: NFT & { listingId?: string }) => void;
  isPurchasing?: boolean;
  isCancelling?: boolean;
  isMarketplaceApproved?: boolean;
}

export default function MarketplaceNFTCard({
  nft,
  metadataURI,
  isOwner = false,
  onListClick,
  onCancelClick,
  onBuyClick,
  isPurchasing = false,
  isCancelling = false,
  isMarketplaceApproved = true,
}: MarketplaceNFTCardProps) {
  const [metadata, setMetadata] = useState<{
    name: string;
    description: string;
    image: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        // Format the URI if it's an IPFS URI
        const formattedURI = metadataURI.startsWith('ipfs://')
          ? metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
          : metadataURI;

        console.log('Fetching metadata from:', formattedURI);
        const response = await fetch(formattedURI);
        const data = await response.json();

        // Format image URL if it's an IPFS URL
        let imageUrl = data.image;
        if (imageUrl && imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace(
            'ipfs://',
            'https://gateway.pinata.cloud/ipfs/'
          );
        }

        setMetadata({
          name: data.name || 'Unnamed NFT',
          description: data.description || 'No description available',
          image: imageUrl || '/placeholder-nft.jpg',
        });

        console.log('Metadata loaded:', data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        setMetadata({
          name: 'Error Loading NFT',
          description: 'Could not load NFT metadata',
          image: '/placeholder-nft.jpg',
        });
      } finally {
        setLoading(false);
      }
    };

    if (metadataURI) {
      fetchMetadata();
    }
  }, [metadataURI]);

  const timeAgo = formatDistanceToNow(new Date(nft.createdAt), {
    addSuffix: true,
  });

  if (loading) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading NFT data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={nft.creator.avatar}
                alt={nft.creator.username}
              />
              <AvatarFallback>
                {nft.creator.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {nft.creator.username}
              </span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Tag className="h-3 w-3 mr-1" />
            NFT
          </Badge>
        </div>
        <h3 className="text-lg font-semibold mt-2">{metadata?.name}</h3>
        <div className="mt-1">
          <Badge variant="secondary" className="text-xs">
            {nft.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={metadata?.image}
            alt={metadata?.name || 'NFT'}
            className="w-full h-full object-cover"
          />
        </div>
        {metadata?.description && (
          <div className="p-4 pt-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {metadata.description}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col space-y-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
            <span className="font-bold text-lg">{nft.price} ETH</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Link href={`/nft/${nft.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {isOwner && nft.listed && !onListClick ? (
          <div className="w-full">
            <Badge variant="outline" className="w-full py-2 flex justify-center">
              Your Listed NFT
            </Badge>
          </div>
        ) : isOwner ? (
          <div className="flex space-x-2 w-full">
            <Button
              variant={nft.listed ? 'outline' : 'default'}
              className="flex-1"
              onClick={() => onListClick && onListClick(nft)}
              disabled={!isMarketplaceApproved || (nft.listed && isCancelling)}
            >
              {!isMarketplaceApproved && !nft.listed ? (
                'Approve Marketplace First'
              ) : nft.listed ? (
                'Update Price'
              ) : (
                'List for Sale'
              )}
            </Button>

            {nft.listed && onCancelClick && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onCancelClick(nft)}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Listing'
                )}
              </Button>
            )}
          </div>
        ) : (
          nft.listed &&
          onBuyClick && (
            <Button
              variant="default"
              className="w-full"
              onClick={() => onBuyClick(nft)}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Purchasing...
                </>
              ) : (
                'Buy Now'
              )}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
