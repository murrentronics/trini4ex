import { BrowserProvider, JsonRpcProvider, Contract } from 'ethers';

// Configure the provider (using Alchemy as an example)
const ALCHEMY_API_KEY = process.env.VITE_ALCHEMY_API_KEY;
const provider = new JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`);

// Correct usage of BrowserProvider for wallet connection
const web3Provider = new BrowserProvider(window.ethereum);

// Function to fetch user-specific data from the blockchain
export async function fetchUserInvestmentData(walletAddress: string, contractAddress: string, abi: any) {
  try {
    const contract = new Contract(contractAddress, abi, provider);

    // Example calls to the smart contract
    const activeLoans = await contract.getActiveLoans(walletAddress);
    const totalInvested = await contract.getTotalInvested(walletAddress);
    const currentInterestRate = await contract.getCurrentInterestRate(walletAddress);
    const accruedInterest = await contract.getAccruedInterest(walletAddress);
    const totalPayout = await contract.getTotalPayout(walletAddress);

    return {
      activeLoans,
      totalInvested,
      currentInterestRate,
      accruedInterest,
      totalPayout,
    };
  } catch (error) {
    console.error('Error fetching user investment data:', error);
    throw error;
  }
}

// Function to connect to the user's wallet
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();

  return signer;
}