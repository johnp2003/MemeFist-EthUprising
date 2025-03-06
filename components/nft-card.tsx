'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { Tag, ShoppingCart, DollarSign, Eye, Share2 } from 'lucide-react';
import { NFT } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface NFTCardProps {
  nft: NFT;
  isOwner?: boolean;
}

export default function NFTCard({ nft, isOwner = false }: NFTCardProps) {
  const [isListed, setIsListed] = useState(nft.listed);
  const [price, setPrice] = useState(nft.price);
  const [showListingModal, setShowListingModal] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(nft.createdAt), {
    addSuffix: true,
  });

  const handleListToggle = () => {
    if (isListed) {
      setIsListed(false);
    } else {
      setShowListingModal(true);
    }
  };

  const handleBuy = () => {
    alert(`You would now be purchasing this NFT for ${price} ETH`);
  };

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
        <h3 className="text-lg font-semibold mt-2">{nft.title}</h3>
        <div className="mt-1">
          <Badge variant="secondary" className="text-xs">
            {nft.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={nft.imageUrl}
            alt={nft.title}
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-3 flex flex-col space-y-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
            <span className="font-bold text-lg">{price} ETH</span>
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

        {isOwner ? (
          <Button
            variant={isListed ? 'destructive' : 'default'}
            className="w-full"
            onClick={handleListToggle}
          >
            {isListed ? 'Unlist NFT' : 'List for Sale'}
          </Button>
        ) : (
          isListed && (
            <Button variant="default" className="w-full" onClick={handleBuy}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
