'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MemeCard from '@/components/meme-card';
import { getBattlesByCategory } from '@/lib/mockData';
import { Battle, Meme } from '@/lib/types';
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Swords,
  LockKeyhole,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ethers } from 'ethers';

// Load ABI from config
const abi = require('@/config/abi.json');

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const [battle, setBattle] = useState<Battle | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);

  // Initialize the smart contract
  useEffect(() => {
    window.scrollTo(0, 0);
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractAddress = '0x50c89cbc4Bde6D08f3f7624B422A9dEff9cCB772';
          const contractInstance = new ethers.Contract(
            contractAddress,
            abi,
            signer
          );
          setContract(contractInstance);
          console.log('Contract initialized successfully');
        } catch (error) {
          console.error('Error initializing contract:', error);
          setLoading(false);
        }
      } else {
        console.error('Please install MetaMask!');
        setLoading(false);
      }
    };
    initContract();
  }, []);

  // Fetch battle and meme data
  useEffect(() => {
    if (category && contract) {
      const fetchData = async () => {
        try {
          // Fetch battle data from mockdata.ts
          const fetchedBattles = getBattlesByCategory(category);
          console.log('Fetched battles:', fetchedBattles);
          setBattle(fetchedBattles[0] || null);

          // Fetch meme IDs from the smart contract
          const getCategoryName = `${category
            .charAt(0)
            .toUpperCase()}${category.slice(1)}`; //This is to uppercase the category name
          console.log('getCategoryName: ', getCategoryName);
          const memeIds = await contract.getMemesByCategory(getCategoryName);
          console.log('Meme IDs fetched:', memeIds);

          // Fetch detailed info for each meme ID
          if (memeIds.length > 0) {
            const memePromises = memeIds.map(
              async (id: ethers.BigNumberish) => {
                const memeInfo = await contract.getMemeInfo(id);
                return {
                  id: id.toString(),
                  creator: memeInfo.creator,
                  title: memeInfo.title,
                  description: memeInfo.description,
                  imageUrl: memeInfo.imageURI,
                  upvotes: memeInfo.upvotes.toString(),
                  timestamp: new Date(
                    Number(memeInfo.timestamp) * 1000
                  ).toISOString(),
                };
              }
            );

            const fetchedMemes = await Promise.all(memePromises);
            console.log('Fetched memes:', fetchedMemes);
            setMemes(fetchedMemes);
          } else {
            console.log('No memes found for category:', category);
            setMemes([]);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [contract, category]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    return now >= end
      ? 'Time Ended'
      : formatDistanceToNow(end, { addSuffix: false });
  };

  const handleJoinBattle = () => {
    router.push(`/submit`);
  };

  const getStatusBadge = () => {
    const now = new Date();
    const end = new Date(battle?.endDate || '');
    const hasEnded = now >= end;
    const currentStatus = hasEnded ? 'closed' : battle?.status || 'ongoing';

    const statusClass = {
      ongoing: 'bg-green-500 text-white shadow-lg',
      upcoming: 'bg-blue-500 text-white shadow-lg',
      closed: 'bg-red-500 text-white shadow-lg',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${statusClass[currentStatus]}`}
      >
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </span>
    );
  };

  const handleBackRouter = () => {
    router.push('/categories');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-lg">Loading battle data...</p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 capitalize">
            {category} Battle
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            No active battle found in this category
          </p>
          <Button onClick={() => router.push('/categories')}>
            Browse Other Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-start mb-6">
        <Button onClick={handleBackRouter} className="flex items-center">
          <span className="mr-2">←</span> Back
        </Button>
      </div>

      {/* Two-Column Layout: Image and Battle Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-12">
        {/* Left Section: Enlarged Image */}
        <div className="flex-1">
          <img
            src={battle.imageUrl}
            alt={`${battle.title} Image`}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Right Section: Sidebar Style */}
        <div className="max-w-sm">
          <Card className="border border-gray-80 rounded-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center capitalize">
                {battle.title}
              </CardTitle>
              <p className="text-muted-foreground text-center text-sm">
                Join the battle and showcase your best memes
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Event Status */}
              <div className="text-sm text-muted-foreground">
                <p>START: {formatDate(battle.startDate)}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-1" />
                  {getTimeRemaining(battle.endDate) === 'Time Ended' ? (
                    <span className="text-red-500 font-semibold">
                      Time Ended
                    </span>
                  ) : (
                    <span>{getTimeRemaining(battle.endDate)} remaining</span>
                  )}
                </div>
              </div>
              {/* Rewards */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {battle.memes.length} entries
                </div>
                <Progress
                  value={(battle.memes.length / battle.maxEntries) * 100}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground text-center">
                  {battle.maxEntries} maximum participants
                </p>
                <div className="flex items-center font-semibold">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span className="mr-2">Prize: </span>
                  <span>{battle?.prizePool || 0}x NFTs Value</span>
                </div>
              </div>
              <div>{getStatusBadge()}</div>
              {/* Play Button */}
              <div className="flex justify-center">
                {battle?.status === 'closed' ||
                getTimeRemaining(battle.endDate) === 'Time Ended' ? (
                  <Button
                    size="lg"
                    className="w-3/4 mt-4 rounded-full bg-red-600 hover:bg-red-700 hover:cursor-not-allowed"
                  >
                    <LockKeyhole className="h-5 w-5 mr-2 text-white" />
                    <span className="text-white font-bold">
                      Battle Has Closed
                    </span>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-1/2 mt-4 rounded-full"
                    onClick={handleJoinBattle}
                  >
                    <Swords className="h-5 w-5 mr-2" />
                    Join Battle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold">Description</h2>
        <p className="text-muted-foreground mt-2">{battle.description}</p>
      </div>

      {/* MemeCard Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Battle Entries</h2>
        {memes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map((meme) => (
              <MemeCard key={meme.id} meme={meme} showCategory={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <span className="block text-lg text-muted-foreground mb-4">
              No entries yet. Be the first to join!
            </span>
            <Button onClick={handleJoinBattle}>Be the first!</Button>
          </div>
        )}
      </div>
    </div>
  );
}
