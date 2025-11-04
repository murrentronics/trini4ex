import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Fetch wallet balance and transaction history from the backend
    async function fetchWalletData() {
      try {
        const response = await fetch('/api/wallet');
        const data = await response.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    }

    fetchWalletData();
  }, []);

  const handleWithdraw = () => {
    // Navigate to withdrawal form
    window.location.href = '/withdraw';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balance} USDT</div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <ul>
              {transactions.map((transaction, index) => (
                <li key={index} className="mb-2">
                  {transaction.date}: {transaction.amount} USDT ({transaction.type})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleWithdraw}>Request Withdrawal</Button>
    </div>
  );
};

export default Wallet;