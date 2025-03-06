import PinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
dotenv.config();

const pinata = new PinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

export async function uploadToIPFS(file) {
  const result = await pinata.pinFileToIPFS(file);
  return `ipfs://${result.IpfsHash}`;
}
