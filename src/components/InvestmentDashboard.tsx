import React, { useEffect, useState } from 'react';
import { fetchUserInvestmentData, connectWallet } from '@/integrations/blockchain';
import { useInterval } from '@/hooks/use-interval';
import { Button } from '@/components/ui/button';

const calculateProjectedPayout = (totalInvested, daysElapsed) => {
  const dailyIncreaseRate = 0.001; // 0.10% daily increase
  const interestRate = dailyIncreaseRate * daysElapsed;
  const projectedPayout = totalInvested * (1 + interestRate);
  return projectedPayout;
};

const InvestmentDashboard = () => {
  const [investmentData, setInvestmentData] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchInvestmentData();
    }
  }, [walletAddress]);

  const fetchInvestmentData = async () => {
    setLoading(true);
    try {
      const contractAddress = '0xYourContractAddress'; // Replace with your contract address
      const abi = []; // Replace with your contract ABI
      const data = await fetchUserInvestmentData(walletAddress, contractAddress, abi);
      setInvestmentData(data);
    } catch (error) {
      console.error('Error fetching investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const signer = await connectWallet();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useInterval(() => {
    if (walletAddress) {
      fetchInvestmentData();
    }
  }, 60000); // Fetch data every 60 seconds

  const projectedPayout = investmentData
    ? calculateProjectedPayout(investmentData.totalInvested, investmentData.daysElapsed)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Investment Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Active Loans</p>
            <p className="text-lg font-semibold">{investmentData.activeLoans}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Total Invested</p>
            <p className="text-lg font-semibold">{investmentData.totalInvested} ETH</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Current Interest Rate</p>
            <p className="text-lg font-semibold">{investmentData.currentInterestRate}%</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Accrued Interest</p>
            <p className="text-lg font-semibold">{investmentData.accruedInterest} ETH</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Total Payout</p>
            <p className="text-lg font-semibold">{investmentData.totalPayout} ETH</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Projected Total Payout</p>
            <p className="text-lg font-semibold">{projectedPayout.toFixed(2)} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;