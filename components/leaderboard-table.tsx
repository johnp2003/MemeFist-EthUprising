import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { User } from '@/lib/types';

interface LeaderboardTableProps {
  users: User[];
}

export default function LeaderboardTable({ users }: LeaderboardTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Upvotes</TableHead>
            <TableHead className="text-right">Wins</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {index === 0 ? (
                  <div className="flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                ) : index === 1 ? (
                  <div className="flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-gray-400" />
                  </div>
                ) : index === 2 ? (
                  <div className="flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-amber-700" />
                  </div>
                ) : (
                  <div className="text-center">{index + 1}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{user.username}</div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {user.totalUpvotes.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">{user.totalWins}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
