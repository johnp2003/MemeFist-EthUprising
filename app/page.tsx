import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight } from 'lucide-react';
import CategoryCard from '@/components/category-card';
import MemeCard from '@/components/meme-card';
import LeaderboardTable from '@/components/leaderboard-table';
import { mockCategories, getTopUsers, mockMemes } from '@/lib/mockData';

export default function Home() {
  const topUsers = getTopUsers(3);
  const featuredMemes = mockMemes.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Welcome to Meme Battle Royale
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create, share, and vote for the best memes in the Web3 space. Join
            the battle and become the ultimate meme champion!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/submit">Submit Your Meme</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Battle Categories</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/categories" className="flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.slice(0, 4).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Memes Section */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Memes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/memes" className="flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMemes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} showCategory={true} />
          ))}
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Top Meme Creators</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leaderboard" className="flex items-center">
              Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="bg-card rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-8 w-8 text-primary mr-2" />
              <h3 className="text-2xl font-bold">Leaderboard</h3>
            </div>
            <LeaderboardTable users={topUsers} />
          </div>
        </div>
      </section>
    </div>
  );
}
