'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import {
  Trophy,
  Upload,
  Home,
  Menu,
  X,
  Wallet,
  Swords,
  ShoppingBag,
  Image,
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen((prev) => !prev);
  };

  // Get account details from Wagmi
  const { address, isConnected } = useAccount();

  // Get the user's ETH balance
  const { data: balance } = useBalance({
    address: address,
  });

  // Change the value to retrieve from smart contract
  const userEarnings = '0.00';

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Swords className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold">MemeFist</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            <Link
              href="/categories"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <Swords className="h-4 w-4 mr-2" />
              Memes
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Marketplace
            </Link>
            {isConnected && (
              <Link
                href="/my-nfts"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              >
                <Image className="h-4 w-4 mr-2" />
                My NFTs
              </Link>
            )}
            <ModeToggle />
            {isConnected ? (
              <div className="flex items-center space-x-2">
                {/* <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {userEarnings} ETH
                </div> */}
                <Button variant="outline" asChild>
                  <ConnectButton.Custom>
                    {({ account, chain, openAccountModal }) => (
                      <div
                        onClick={openAccountModal}
                        className="flex items-center cursor-pointer"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        {account?.displayName}
                        {chain?.name && ` (${chain.name})`}
                      </div>
                    )}
                  </ConnectButton.Custom>
                </Button>
              </div>
            ) : (
              <ConnectButton label="Connect Wallet" />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <ModeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link
              href="/battle/all"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <Swords className="h-5 w-5 mr-2" />
              Memes
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <Trophy className="h-5 w-5 mr-2" />
              Leaderboard
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Marketplace
            </Link>
            {isConnected && (
              <Link
                href="/my-nfts"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                <Image className="h-5 w-5 mr-2" />
                My NFTs
              </Link>
            )}
            {isConnected ? (
              <div className="px-3 py-2 space-y-2">
                {/* <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium inline-block">
                  {userEarnings} ETH
                </div> */}
                <Button variant="outline" className="w-full" asChild>
                  <ConnectButton.Custom>
                    {({ account, chain, openAccountModal }) => (
                      <div
                        onClick={openAccountModal}
                        className="flex items-center cursor-pointer"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        {account?.displayName}
                        {chain?.name && ` (${chain.name})`}
                      </div>
                    )}
                  </ConnectButton.Custom>
                </Button>
              </div>
            ) : (
              <div className="px-3 py-2">
                <ConnectButton label="Connect Wallet" />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
