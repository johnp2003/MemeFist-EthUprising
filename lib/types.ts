export interface User {
  id: string;
  username: string;
  address: string;
  totalUpvotes: number;
  totalWins: number;
  avatar: string;
}

export interface Meme {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  metadataURI: string;
  creator: User;
  upvotes: number;
  downvotes: number;
  timestamp: string;
  category: string;
  isNft?: boolean;
  nftPrice?: number;
  listed?: boolean;
}

export interface Battle {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  maxEntries: number;
  memes: Meme[];
  status?: 'ongoing' | 'upcoming' | 'closed';
  prizePool?: number;
  imageUrl: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  activeBattles: number;
  prizePool?: number;
  endTime?: string;
  imageUrl: string;
  status?: 'ongoing' | 'upcoming' | 'closed';
}

export interface NFT {
  id: string;
  title: string;
  imageUrl: string;
  creator: User;
  owner: User;
  price: number;
  listed: boolean;
  category: string;
  createdAt: string;
  tokenId: string;
}
