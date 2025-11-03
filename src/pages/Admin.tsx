import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Profile = any;
type Investment = any;
type Payout = any;

interface UserWithInvestment extends Profile {
  investments: Investment[];
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithInvestment[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const [profilesResult, investmentsResult, payoutsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('investments').select('*').order('created_at', { ascending: false }),
        supabase.from('payouts').select('*').order('payout_date', { ascending: false }),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (investmentsResult.error) throw investmentsResult.error;
      if (payoutsResult.error) throw payoutsResult.error;

      const investmentsData = investmentsResult.data || [];
      const usersWithInvestments: UserWithInvestment[] = (profilesResult.data || []).map((profile) => ({
        ...profile,
        investments: investmentsData.filter((inv) => inv.user_id === profile.id),
      }));

      setUsers(usersWithInvestments);
      setInvestments(investmentsData);
      setPayouts(payoutsResult.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.total_investment_ttd), 0);
  const totalPayouts = payouts.reduce((sum, payout) => sum + Number(payout.net_amount_ttd), 0);
  const activeContracts = investments.filter((inv) => inv.status === 'active').length;

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Trini4ex Admin</div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{activeContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalInvested.toFixed(2)} TTD</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{totalPayouts.toFixed(2)} TTD</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
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
                {users.map((user) => {
                  const userTotalInvested = user.investments.reduce(
                    (sum, inv) => sum + Number(inv.total_investment_ttd),
                    0
                  );
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.investments.length}</TableCell>
                      <TableCell className="font-semibold">{userTotalInvested.toFixed(2)} TTD</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* All Investments */}
        <Card>
          <CardHeader>
            <CardTitle>All Investments</CardTitle>
            <CardDescription>Complete list of all investment contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.map((investment) => {
                const userProfile = users.find((u) => u.id === investment.user_id);
                return (
                  <div
                    key={investment.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">
                          {userProfile?.full_name || userProfile?.email || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {investment.contract_quantity} {investment.contract_quantity === 1 ? 'Contract' : 'Contracts'}
                        </p>
                      </div>
                      <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Investment</p>
                        <p className="font-semibold">{Number(investment.total_investment_ttd).toFixed(2)} TTD</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Payout</p>
                        <p className="font-semibold text-accent">
                          {Number(investment.monthly_payout_ttd).toFixed(2)} TTD
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-semibold">{new Date(investment.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-semibold">{new Date(investment.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
