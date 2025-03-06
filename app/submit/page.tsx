'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCategories } from '@/lib/mockData';
import { Upload, Image as ImageIcon, Check } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import axios from 'axios';

const contractAddress = '0x50c89cbc4Bde6D08f3f7624B422A9dEff9cCB772';
const contractABI = [
  {
    inputs: [
      { internalType: 'string', name: 'category', type: 'string' },
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'imageURI', type: 'string' },
      { internalType: 'string', name: 'metadataURI', type: 'string' },
    ],
    name: 'submitMeme',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
// import { usePinataUpload } from "@/hooks/usePinataUpload";
// import { useSubmitMeme } from "@/hooks/use-submit-meme";

export default function SubmitPage() {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadToPinata = async (file: File): Promise<string> => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
          'Content-Type': 'multipart/form-data',
        },
      });
      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload image to Pinata');
    }
  };

  const uploadJSONToPinata = async (jsonData: any): Promise<string> => {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

    try {
      const response = await axios.post(url, jsonData, {
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
          'Content-Type': 'application/json',
        },
      });
      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('Pinata JSON upload error:', error);
      throw new Error('Failed to upload metadata to Pinata');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !walletClient || !file) {
      console.error('Wallet not connected or no file selected');
      return;
    }

    try {
      setIsUploading(true);

      console.log('Uploading image to IPFS...');
      const imageURI = await uploadToPinata(file);
      const formattedImageURI = imageURI.replace(
        'ipfs://',
        'https://gateway.pinata.cloud/ipfs/'
      );
      console.log('Formatted Image URI:', formattedImageURI);

      console.log('Creating and uploading metadata...');
      const nftJSON = {
        name: title,
        description: description,
        image: formattedImageURI,
      };

      const metadataURI = await uploadJSONToPinata(nftJSON);
      const formattedMetadataURI = metadataURI.replace(
        'ipfs://',
        'https://gateway.pinata.cloud/ipfs/'
      );
      console.log('Formatted Metadata URI:', formattedMetadataURI);

      setIsUploading(false);

      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log('Submitting to blockchain with params:', {
        category,
        title,
        description,
        imageURI: formattedImageURI,
        metadataURI: formattedMetadataURI,
      });

      const tx = await contract.submitMeme(
        category,
        title,
        description,
        formattedImageURI,
        formattedMetadataURI
      );

      const receipt = await tx.wait();
      console.log('Transaction successful:', receipt.transactionHash);

      setIsSubmitted(true);

      setTimeout(() => {
        setTitle('');
        setCategory('');
        setDescription('');
        setFile(null);
        setPreviewUrl(null);
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting meme:', error);
      alert('Failed to submit meme. Check console for details.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Your Meme</h1>
        <p className="text-muted-foreground">
          Share your best memes with the community and compete for upvotes
        </p>
      </div>

      <Card className="w-full">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Meme Submission</CardTitle>
            <CardDescription>
              Fill out the form below to submit your meme to a battle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Meme Title</Label>
              <Input
                id="title"
                placeholder="Enter a catchy title for your meme"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting || isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                required
                disabled={isSubmitting || isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add some context to your meme"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isSubmitting || isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meme-upload">Upload Meme</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="space-y-4 w-full">
                    <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md">
                      <img
                        src={previewUrl}
                        alt="Meme preview"
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                        }}
                        disabled={isSubmitting || isUploading}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium">
                        Drag and drop your image here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports JPG, PNG, GIF (Max 5MB)
                      </p>
                    </div>
                    <Input
                      id="meme-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                      disabled={isSubmitting || isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        document.getElementById('meme-upload')?.click()
                      }
                      disabled={isSubmitting || isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isConnected ? (
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  isSubmitted ||
                  isUploading ||
                  !title ||
                  !category ||
                  !file
                }
              >
                {isUploading ? (
                  <>Uploading Image...</>
                ) : isSubmitting ? (
                  <>Submitting...</>
                ) : isSubmitted ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submitted Successfully
                  </>
                ) : (
                  <>Submit Meme</>
                )}
              </Button>
            ) : (
              <div className="w-full text-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
                <p className="font-medium">Wallet Not Connected</p>
                <p className="text-sm">
                  Please connect your wallet to submit a meme.
                </p>
                <div className="mt-2 flex justify-center">
                  <ConnectButton
                    label="Connect Wallet to Submit"
                    showBalance={false}
                    chainStatus="none"
                  />
                </div>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
