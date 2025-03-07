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
              <Link href="/categories">Pick Your Battle</Link>
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

      {/* About / Contact Us Section */}
      <section className="py-12 mt-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">About MemeFist</h2>
          <p className="text-muted-foreground mt-2">Learn more about our platform and get in touch</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Card */}
          <div className="col-span-1 lg:col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
              <div className="p-6 pb-3">
                <h3 className="text-2xl font-semibold tracking-tight">Our Mission</h3>
                <p className="text-muted-foreground mt-2">
                  MemeFist is a decentralized platform for crypto and Web3 enthusiasts to create, share, and battle with memes.
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Compete in Meme Battles</p>
                      <p className="text-sm text-muted-foreground">
                        Submit your best memes to themed battles and win prizes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Monetize Your Creativity</p>
                      <p className="text-sm text-muted-foreground">
                        Turn your best memes into NFTs and earn from your creativity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" x2="22" y1="12" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Join a Global Community</p>
                      <p className="text-sm text-muted-foreground">
                        Connect with meme creators and enthusiasts from around the world
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/about" className="flex items-center">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Card */}
          <div className="col-span-1">
            <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
              <div className="p-6">
                <h3 className="text-2xl font-semibold tracking-tight mb-4">Get In Touch</h3>
                
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                      </svg>
                      Community
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <a href="https://discord.gg/memefist" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        Discord
                      </a>
                      <a href="https://twitter.com/memefist" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        Twitter
                      </a>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.8a2 2 0 0 0 1.4-.6L12 4.8a2 2 0 0 1 1.4-.6h3.8a2 2 0 0 1 2 2v2.2Z" />
                        <path d="M12 10v6" />
                        <path d="m15 13-3 3-3-3" />
                      </svg>
                      Support
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <a href="mailto:support@memefist.xyz" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        Email
                      </a>
                      <a href="https://t.me/memefist" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        Telegram
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full" asChild>
                    <Link href="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
