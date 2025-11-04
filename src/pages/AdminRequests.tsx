import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminRequests = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  useEffect(() => {
    // Fetch withdrawal requests from the backend
    async function fetchRequests() {
      try {
        const response = await fetch('/api/admin/withdrawal-requests');
        const data = await response.json();
        setWithdrawalRequests(data);
      } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
      }
    }

    fetchRequests();
  }, []);

  const handleApprove = (requestId) => {
    // Approve the withdrawal request
    console.log(`Approved request ID: ${requestId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalRequests.length === 0 ? (
            <p>No withdrawal requests.</p>
          ) : (
            <ul>
              {withdrawalRequests.map((request) => (
                <li key={request.id} className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p>User: {request.user}</p>
                      <p>Amount: {request.amount} USDT</p>
                      <p>Wallet Address: {request.walletAddress}</p>
                    </div>
                    <Button onClick={() => handleApprove(request.id)}>Approve</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRequests;