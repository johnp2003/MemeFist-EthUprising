'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Battle, Category } from '@/lib/types';
import { Bitcoin, Gamepad2, Cpu, Laugh, Coins, Users, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getBattlesByCategory } from '@/lib/mockData';
import { ethers } from 'ethers';

// Load ABI and contract address
const abi = require('@/config/abi.json');
const CONTRACT_ADDRESS = "0x50c89cbc4Bde6D08f3f7624B422A9dEff9cCB772"; // Replace with your actual contract address

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    // Initialize contract when the component mounts
    const loadContract = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
          setContract(contractInstance);
        } else {
          console.error("Ethereum provider not found.");
        }
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };
    loadContract();
  }, []);

  useEffect(() => {
    if (category && contract) {
      const fetchData = async () => {
        try {
          const getCategoryName = `${category.name.charAt(0).toUpperCase()}${category.name.slice(1)}`;
          console.log('getCategoryName:', getCategoryName);

          // Fetch battle data from contract
          const battleInfo = await contract.getBattleInfo(getCategoryName);
          console.log('Battle Info:', battleInfo);

          const participantCount = Number(battleInfo[4]); // Retrieve participants count
          console.log("Total participants:", participantCount);
          setParticipantCount(participantCount);

        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [contract, category]);

  const getIcon = () => {
    switch (category.icon) {
      case 'bitcoin':
        return <Bitcoin className="h-5 w-5" />;
      case 'gamepad-2':
        return <Gamepad2 className="h-5 w-5" />;
      case 'cpu':
        return <Cpu className="h-5 w-5" />;
      case 'laugh':
        return <Laugh className="h-5 w-5" />;
      default:
        return <Coins className="h-5 w-5" />;
    }
  };

  return (
    <Link href={`/battle/${category.name.toLowerCase()}`}>
      <Card className="overflow-hidden w-full group border-transparent hover:border-gray-200 transition-colors duration-200 ease-in-out">
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
        <CardContent className="pt-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary mr-2">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {category.description}
          </p>

          <div className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {loading ? 'Loading entries...' : `${participantCount} Entries`}
          </div>

          <div className="text-sm font-medium flex items-center mt-2">
            <Trophy className="h-4 w-4 mr-1" />
            Prize: {battle?.prizePool || 0}x NFTs Value
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
