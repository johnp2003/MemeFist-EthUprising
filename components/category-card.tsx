'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Battle, Category } from '@/lib/types';
import {
  Bitcoin,
  Gamepad2,
  Cpu,
  Laugh,
  Clock,
  Coins,
  Users,
  Trophy,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getBattlesByCategory } from '@/lib/mockData';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const fetchedBattles = getBattlesByCategory(category.name);
      setBattle(fetchedBattles[0] || null);
      setLoading(false);
    }, 500);
  }, [category.name]);

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
      // case 'image':
      //   return <Image className="h-8 w-8" />;
      default:
        return <Coins className="h-5 w-5" />;
    }
  };

  // Calculate time remaining (mock data - assuming 72 hours from now)
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 72);
  const timeRemaining = formatDistanceToNow(endTime, { addSuffix: false });

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

          {/* <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{timeRemaining} remaining</span>
          </div> */}

          <div className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {loading
              ? 'Loading entries...'
              : `${battle?.memes.length || 0} Entries`}
          </div>

          <div className="text-sm font-medium flex items-center mt-2">
            <Trophy className="h-4 w-4 mr-1" />
            Prize: {battle?.prizePool || 0}x NFTs Value
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex justify-center items-center">
          {/* <div className="text-sm font-medium">
            {category.activeBattles === 1 ? '1 Active Battle' : `${category.activeBattles} Active Battles`}
          </div> */}
          <button className="relative group border-none bg-transparent p-0 outline-none cursor-pointer font-mono font-light uppercase text-base">
            <span className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-25 rounded-lg transform translate-y-0.5 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-[250ms] group-active:translate-y-px"></span>
            <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-[hsl(217,33%,16%)] via-[hsl(217,33%,32%)] to-[hsl(217,33%,16%)]"></span>
            <div className="relative flex items-center justify-between py-2 px-4 text-lg text-white rounded-lg transform -translate-y-1 bg-gradient-to-r from-[#f27121] via-[#e94057] to-[#8a2387] gap-3 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-[250ms] group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110">
              <span className="select-none">Show Details</span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 ml-2 -mr-1 transition duration-250 group-hover:translate-x-1"
              >
                <path
                  clip-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </div>
          </button>
        </CardFooter>
      </Card>
    </Link>
  );
}
