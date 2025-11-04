import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';

const PurchaseContract = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [contractCount, setContractCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Fetch user list from the backend
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    // Calculate total price based on contract count
    setTotalPrice(contractCount * 1075); // 1075 TTD per contract
  }, [contractCount]);

  const handlePurchase = () => {
    // Handle contract purchase logic
    console.log(`Purchasing ${contractCount} contracts for user ${selectedUser}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Purchase Smart Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block mb-2">Select User</label>
            <Select value={selectedUser} onValueChange={(value) => setSelectedUser(value)}>
              <SelectItem value="" disabled>Select a user</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Number of Contracts</label>
            <select
              value={contractCount}
              onChange={(e) => setContractCount(Number(e.target.value))}
              className="border rounded p-2 w-full"
            >
              {[1, 2, 3, 4, 5, 10, 15, 30].map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <p>Total Price: {totalPrice} TTD</p>
          </div>

          <Button onClick={handlePurchase}>Purchase</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseContract;