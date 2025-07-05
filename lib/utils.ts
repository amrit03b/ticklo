import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Uploads an image file to Pinata and returns the IPFS gateway URL.
 * @param file File object (from input[type=file])
 * @returns Promise<string> - The Pinata IPFS gateway URL
 */
export async function uploadImageToPinata(file: File): Promise<string> {
  const apiKey = '8dffc7aa61290e292493';
  const apiSecret = '180b603ff6b3ce3482d1ccd06afe0ea141fcf051f1886cde36dcae3a2bb3b6f1';
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
    body: formData,
  });
  const data = await res.json();
  if (!data.IpfsHash) throw new Error('Pinata upload failed');
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
}
