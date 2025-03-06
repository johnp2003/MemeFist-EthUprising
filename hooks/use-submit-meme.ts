// hooks/useSubmitMeme.ts
'use client';

import { useWriteContract } from 'wagmi';
import {
  MEME_BATTLE_CONTRACT_ADDRESS,
  MEME_BATTLE_ABI,
} from '@/config/contract';

export function useSubmitMeme() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const submitMeme = async (
    category: string,
    title: string,
    description: string,
    imageURI: string
  ) => {
    writeContract({
      address: MEME_BATTLE_CONTRACT_ADDRESS,
      abi: MEME_BATTLE_ABI,
      functionName: 'submitMeme',
      args: [category, title, description, imageURI],
    });
  };

  return { submitMeme, isPending, isSuccess, error };
}
