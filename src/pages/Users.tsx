import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Profile = any;

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select('*');

        if (investmentsError) throw investmentsError;

        const usersWithInvestments = profiles.map((profile) => {
          const userInvestments = investments.filter((inv) => inv.user_id === profile.id);
          return { ...profile, investments: userInvestments };
        });

        setUsers(usersWithInvestments);
      } catch (error: any) {
        console.error('Error fetching users:', error.message);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all registered users and their investments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Investments</TableHead>
                <TableHead>Total Invested</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => {
                  const userTotalInvested = user.investments
                    ? user.investments.reduce(
                        (sum, inv) => sum + Number(inv.total_investment_ttd),
                        0
                      )
                    : 0;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.investments ? user.investments.length : 0}</TableCell>
                      <TableCell className="font-semibold">{userTotalInvested.toFixed(2)} TTD</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}