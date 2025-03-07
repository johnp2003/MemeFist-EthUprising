import { User, Meme, Battle, Category, NFT } from './types';
import { request, gql } from 'graphql-request';

// Define the response type for the GraphQL query
interface MemeUpvoteCountResponse {
  memeUpvoteCounts: {
    id: string;
    memeId: string;
    upvoteAmount: string;
    winner: string;
    category: string;
    username: string;
    battleCompleted: {
      winner: string;
    } | null;
  }[];
}

// Subgraph endpoint
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/105100/memefist_subgraph/version/latest";

export const fetchUsersFromSubgraph = async (): Promise<User[]> => {
  const query = gql`
    query GetMemeUpvoteCounts {
      memeUpvoteCounts(first: 1000, orderBy: upvoteAmount, orderDirection: desc) {
        id
        memeId
        upvoteAmount
        winner
        category
        username
        battleCompleted {
          winner
        }
      }
    }
  `;

  try {
    // Type the request response
    const data: MemeUpvoteCountResponse = await request(SUBGRAPH_URL, query);
    console.log("Fetched memeUpvoteCounts from subgraph:", data.memeUpvoteCounts);

    // Map MemeUpvoteCount data to User interface
    const users: User[] = data.memeUpvoteCounts.map((upvote: any) => ({
      id: upvote.id,
      username: upvote.username,
      address: upvote.winner,
      totalUpvotes: parseInt(upvote.upvoteAmount),
      totalWins: upvote.battleCompleted ? 1 : 0, // Simplified win count
      avatar: "/sol-col.png",
      category: upvote.category || "N/A",
      winner: upvote.winner || "N/A",
    }));

    return users;
  } catch (error) {
    console.error("Error fetching users from subgraph:", error);
    return [];
  }
};

export const mockUsers: User[] = [];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Crypto',
    description: 'Create a funny meme about SO-COL, $SIMP or IreneDAO',
    icon: 'bitcoin',
    activeBattles: 15,
    prizePool: 1.5,
    endTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    imageUrl: '/sol-col.png',
    status: 'ongoing',
  },
  {
    id: '2',
    name: 'Gaming',
    description: 'Create a funny memes about video games and gaming culture',
    icon: 'gamepad-2',
    activeBattles: 3,
    prizePool: 0.8,
    endTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    imageUrl: '/gaming.jpeg',
    status: 'ongoing',
  },
  {
    id: '3',
    name: 'Tech',
    description: 'Create a funny memes about technology and gadgets',
    icon: 'cpu',
    activeBattles: 8,
    prizePool: 1.2,
    endTime: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
    imageUrl: '/tech.png',
    status: 'upcoming',
  },
  {
    id: '4',
    name: 'Funny',
    description: 'Create a general funny memes that will make you laugh',
    icon: 'laugh',
    activeBattles: 11,
    prizePool: 2.0,
    endTime: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    imageUrl: '/funny.jpeg',
    status: 'ongoing',
  },
  {
    id: '5',
    name: 'NFT',
    description: 'Create a funny memes about NFTs and digital collectibles',
    icon: 'image',
    activeBattles: 7,
    prizePool: 1.75,
    endTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    imageUrl: '/nft.jpeg',
    status: 'closed',
  },
];

export const mockMemes: Meme[] = [
  {
    id: '1',
    title: 'When your crypto finally moons',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[0],
    upvotes: 342,
    downvotes: 21,
    timestamp: '2025-04-01T12:00:00Z',
    category: 'Crypto',
    isNft: true,
    nftPrice: 0.75,
    listed: true,
  },
  {
    id: '2',
    title: 'Gamers when the servers go down',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[1],
    upvotes: 256,
    downvotes: 15,
    timestamp: '2025-04-01T14:30:00Z',
    category: 'Gaming',
    isNft: true,
    nftPrice: 0.5,
    listed: true,
  },
  {
    id: '3',
    title: 'When you try to explain blockchain to your parents',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[2],
    upvotes: 198,
    downvotes: 12,
    timestamp: '2025-04-02T09:15:00Z',
    category: 'Crypto',
    isNft: true,
    nftPrice: 0.3,
    listed: false,
  },
  {
    id: '4',
    title: 'Tech support be like',
    description: '',
    imageUrl:
      'https://www.mojohelpdesk.com/blog/wp-content/uploads/beans/images/541dbcb9e685b9bba689e5adeebccc0a-6786bd4.jpg',
    metadataURI: '',
    creator: mockUsers[3],
    upvotes: 175,
    downvotes: 8,
    timestamp: '2025-04-02T16:45:00Z',
    category: 'Tech',
  },
  {
    id: '5',
    title: 'NFT collectors when the floor price drops',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[4],
    upvotes: 132,
    downvotes: 19,
    timestamp: '2025-04-03T11:20:00Z',
    category: 'NFT',
  },
  {
    id: '6',
    title: 'When you finally understand smart contracts',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[0],
    upvotes: 210,
    downvotes: 14,
    timestamp: '2025-04-03T13:10:00Z',
    category: 'Crypto',
  },
  {
    id: '7',
    title: 'Gamers at 4am',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[1],
    upvotes: 187,
    downvotes: 9,
    timestamp: '2025-04-04T02:30:00Z',
    category: 'Gaming',
  },
  {
    id: '8',
    title: 'When your code finally works',
    description: '',
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500&auto=format&fit=crop',
    metadataURI: '',
    creator: mockUsers[2],
    upvotes: 165,
    downvotes: 7,
    timestamp: '2025-04-04T10:45:00Z',
    category: 'Tech',
  },
];

export const mockBattles: Battle[] = [
  {
    id: '1',
    title: 'Crypto Meme Battle',
    category: 'Crypto',
    startDate: '2025-04-01T00:00:00Z',
    endDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    maxEntries: 20,
    memes: [],
    status: 'ongoing',
    prizePool: 1.5,
    imageUrl: '/crypto-battle.png',
    description:
      'Calling all crypto enthusiasts! Create a funny meme about SO-COL, $SIMP or IreneDAO. Show off your creativity, humor and crypto knowledge. The more creative and funnier the meme, the higher the chance of winning. The top 3 memes with the most upvotes will win a prize from the prize pool. The meme with the most upvotes will win 0.5, the second 0.3 and the third 0.2. The prize pool is 1.5. The battle will end after 72 hours. Good luck and have fun!',
  },
  {
    id: '2',
    title: 'Gaming Meme Battle',
    category: 'Gaming',
    startDate: '2025-04-02T00:00:00Z',
    endDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    maxEntries: 10,
    memes: [
      mockMemes[1],
      mockMemes[6],
      mockMemes[7],
      mockMemes[8],
      mockMemes[9],
      mockMemes[10],
      mockMemes[1],
      mockMemes[6],
      mockMemes[7],
    ],
    status: 'ongoing',
    prizePool: 0.8,
    imageUrl: '/gaming-battle.png',
    description:
      'Show off your creativity, humor and gaming knowledge. The more creative and funnier the meme, the higher the chance of winning. The top 3 memes with the most upvotes will win a prize from the prize pool. The meme with the most upvotes will win 0.4, the second 0.3 and the third 0.1. The prize pool is 0.8. The battle will end after 48 hours. Good luck and have fun! Do submit your meme before it reaches the maximum participant!',
  },
  {
    id: '3',
    title: 'Tech Meme Battle',
    category: 'Tech',
    startDate: '2025-04-03T00:00:00Z',
    endDate: new Date(Date.now() + 0 * 0 * 1000).toISOString(),
    maxEntries: 20,
    memes: [
      mockMemes[3],
      mockMemes[7],
      mockMemes[2],
      mockMemes[4],
      mockMemes[5],
    ],
    status: 'ongoing',
    prizePool: 1.2,
    imageUrl: '/technology-battle.png',
    description:
      'Create a funny memes about your favorite tech. The more creative and funnier the meme, the higher the chance of winning. The top 3 memes with the most upvotes will win a prize from the prize pool. The meme with the most upvotes will win 0.5, the second 0.3 and the third 0.2. The prize pool is 1.2. The battle will end after 60 hours. Good luck and have fun!',
  },
  {
    id: '4',
    title: 'NFT Meme Battle',
    category: 'NFT',
    startDate: '2025-04-04T00:00:00Z',
    endDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    maxEntries: 30,
    memes: [mockMemes[4]],
    status: 'ongoing',
    prizePool: 1.75,
    imageUrl: '/sol-col.png',
    description:
      'Create a funny memes about your favorite NFT. The more creative and funnier the meme, the higher the chance of winning. The top 3 memes with the most upvotes will win a prize from the prize pool. The meme with the most upvotes will win 0.5, the second 0.3 and the third 0.2. The prize pool is 1.75. The battle will end after 24 hours. Good luck and have fun!',
  },
  {
    id: '5',
    title: 'Funny Meme Battle',
    category: 'Funny',
    startDate: '2025-04-05T00:00:00Z',
    endDate: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    maxEntries: 50,
    memes: [],
    status: 'ongoing',
    prizePool: 2.0,
    imageUrl: '/funny.jpeg',
    description:
      'Create a funny memes about anything. The more creative and funnier the meme, the higher the chance of winning. The top 3 memes with the most upvotes will win a prize from the prize pool. The meme with the most upvotes will win 0.5, the second 0.3 and the third 0.2. The prize pool is 2.0. The battle will end after 36 hours. Good luck and have fun!',
  },
];

export const mockNFTs: NFT[] = [
  {
    id: '1',
    title: 'When your crypto finally moons',
    imageUrl:
      'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=500&auto=format&fit=crop',
    creator: mockUsers[0],
    owner: mockUsers[0],
    price: 0.75,
    listed: true,
    category: 'Crypto',
    createdAt: '2025-04-01T12:00:00Z',
    tokenId: '0x123456789',
  },
  {
    id: '2',
    title: 'Gamers when the servers go down',
    imageUrl:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=500&auto=format&fit=crop',
    creator: mockUsers[1],
    owner: mockUsers[1],
    price: 0.5,
    listed: true,
    category: 'Gaming',
    createdAt: '2025-04-01T14:30:00Z',
    tokenId: '0x234567890',
  },
  {
    id: '3',
    title: 'When you try to explain blockchain to your parents',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop',
    creator: mockUsers[2],
    owner: mockUsers[2],
    price: 0.3,
    listed: false,
    category: 'Crypto',
    createdAt: '2025-04-02T09:15:00Z',
    tokenId: '0x345678901',
  },
  {
    id: '4',
    title: 'Crypto to the Moon',
    imageUrl:
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=500&auto=format&fit=crop',
    creator: mockUsers[0],
    owner: mockUsers[3],
    price: 1.2,
    listed: true,
    category: 'Crypto',
    createdAt: '2025-03-15T09:15:00Z',
    tokenId: '0x456789012',
  },
  {
    id: '5',
    title: 'NFT Market Crash',
    imageUrl:
      'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=500&auto=format&fit=crop',
    creator: mockUsers[4],
    owner: mockUsers[4],
    price: 0.8,
    listed: true,
    category: 'NFT',
    createdAt: '2025-03-20T14:30:00Z',
    tokenId: '0x567890123',
  },
];

export const getTopUsers = (limit: number = 5): User[] => {
  return [...mockUsers]
    .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
    .slice(0, limit);
};

export const getBattlesByCategory = (category: string): Battle[] => {
  if (category === 'all') {
    return mockBattles;
  }
  return mockBattles.filter(
    (battle) => battle.category.toLowerCase() === category.toLowerCase()
  );
};

export const getAllBattles = (): Battle[] => {
  return mockBattles;
};

export const getMemesByCategory = (category: string): Meme[] => {
  if (category === 'all') {
    return mockMemes;
  }
  return mockMemes.filter(
    (meme) => meme.category.toLowerCase() === category.toLowerCase()
  );
};

export const getUserNFTs = (userId: string): NFT[] => {
  return mockNFTs.filter((nft) => nft.owner.id === userId);
};

export const getListedNFTs = (): NFT[] => {
  return mockNFTs.filter((nft) => nft.listed);
};

export const getNFTById = (id: string): NFT | undefined => {
  return mockNFTs.find((nft) => nft.id === id);
};

export const getWeeklyTopUsers = (limit: number = 5): User[] => {
  // Mock implementation - in a real app, this would filter by date
  return [...mockUsers]
    .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
    .slice(0, limit);
};

export const getMonthlyTopUsers = (limit: number = 5): User[] => {
  // Mock implementation - in a real app, this would filter by date
  return [...mockUsers]
    .sort(
      (a, b) =>
        b.totalUpvotes * 0.7 +
        b.totalWins * 10 -
        (a.totalUpvotes * 0.7 + a.totalWins * 10)
    )
    .slice(0, limit);
};

export const getAllTimeTopUsers = (limit: number = 5): User[] => {
  // Mock implementation - in a real app, this would use all-time stats
  return [...mockUsers]
    .sort(
      (a, b) =>
        b.totalUpvotes * 0.5 +
        b.totalWins * 20 -
        (a.totalUpvotes * 0.5 + a.totalWins * 20)
    )
    .slice(0, limit);
};
