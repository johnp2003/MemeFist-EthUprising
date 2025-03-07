'use client';

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardTable from "@/components/leaderboard-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchUsersFromSubgraph } from "@/lib/mockData"; // Updated import
import { User } from "@/lib/types"; // Ensure this is defined
import { Trophy, TrendingUp, Award } from "lucide-react";

export default function LeaderboardPage() {
  const [usersByUpvotes, setUsersByUpvotes] = useState<User[]>([]);
  const [usersByWins, setUsersByWins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const users = await fetchUsersFromSubgraph();
      // Sort by upvotes
      const sortedByUpvotes = [...users].sort(
        (a, b) => b.totalUpvotes - a.totalUpvotes
      );
      // Sort by wins
      const sortedByWins = [...users].sort((a, b) => b.totalWins - a.totalWins);
      setUsersByUpvotes(sortedByUpvotes);
      setUsersByWins(sortedByWins);
      setLoading(false);
    };
    loadUsers();
    // Optional: Set up polling or subscription for real-time updates
    const interval = setInterval(loadUsers, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const totalUpvotes = usersByUpvotes.reduce((sum, user) => sum + user.totalUpvotes, 0);
  const totalMemes = usersByUpvotes.length; // Approximate total memes

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Meme Battle Leaderboard</h1>
        <p className="text-muted-foreground">
          The top meme creators ranked by upvotes and wins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemes}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUpvotes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Battles</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 new battles this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upvotes">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="upvotes">By Upvotes</TabsTrigger>
          <TabsTrigger value="wins">By Wins</TabsTrigger>
        </TabsList>
        <TabsContent value="upvotes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Creators by Upvotes</CardTitle>
              <CardDescription>
                Users ranked by the total number of upvotes received on their
                memes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable users={usersByUpvotes} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wins" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Creators by Wins</CardTitle>
              <CardDescription>
                Users ranked by the total number of battle wins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable users={usersByWins} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}