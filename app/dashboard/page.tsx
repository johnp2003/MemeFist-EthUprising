import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const dashboard = () => {
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-5xl font-bold">Dashboard</h1>
      <div className="flex gap-4">
        <Button variant="outline">Create a new meme</Button>
        <Button variant="outline">View all memes</Button>
      </div>
      <Avatar className="w-24 h-24">
        <AvatarImage
          src="https://github.com/shadcn.png"
          className="rounded-full"
        />
        <AvatarFallback className="bg-slate-300 rounded-full">
          CN
        </AvatarFallback>
      </Avatar>
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers. Haha just kidding.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default dashboard;
