export interface User {
  id: string;
  username: string;
  address: string; // Placeholder or derived if possible
  totalUpvotes: number;
  totalWins: number; // Derived from battleCompleted (if winner matches)
  avatar: string; // Placeholder URL
  category?: string; // Optional, from MemeUpvoteCount
  winner?: string; // Optional, from MemeUpvoteCount
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
