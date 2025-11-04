import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, DollarSign, LogOut, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Profile = any;
type Investment = any;
type Payout = any;

interface UserWithInvestment extends Profile {
  investments: Investment[];
}

export default function Admin() {
  const { user, signOut, loading: authLoading } = useAuth();
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

  const pendingInvestments = investments.filter((inv) => inv.status === 'pending');
  const activeInvestments = investments.filter((inv) => inv.status === 'active');
  const expiredInvestments = investments.filter((inv) => inv.status === 'completed');
  const rejectedInvestments = investments.filter((inv) => inv.status === 'rejected');
  
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + Number(inv.total_investment_ttd), 0);
  const totalPayouts = payouts.reduce((sum, payout) => sum + Number(payout.net_amount_ttd), 0);
  const activeContracts = activeInvestments.length;
  const activeInvestors = users.filter((user) => user.investments.some((inv) => inv.status === 'active')).length;

  const handleApproveInvestment = async (investmentId: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({ status: 'active' })
        .eq('id', investmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Investment approved successfully',
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectInvestment = async (investmentId: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({ status: 'rejected' })
        .eq('id', investmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Investment rejected',
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderInvestmentCard = (investment: Investment, showActions = false) => {
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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
        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveInvestment(investment.id)}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectInvestment(investment.id)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    );
  };

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{activeInvestors}</div>
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

        {/* Investment Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Management</CardTitle>
            <CardDescription>Review and manage all investment applications and contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">
                  Pending ({pendingInvestments.length})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({activeInvestments.length})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired ({expiredInvestments.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedInvestments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingInvestments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending investments</p>
                ) : (
                  pendingInvestments.map((investment) => renderInvestmentCard(investment, true))
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4 mt-4">
                {activeInvestments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active investments</p>
                ) : (
                  activeInvestments.map((investment) => renderInvestmentCard(investment))
                )}
              </TabsContent>

              <TabsContent value="expired" className="space-y-4 mt-4">
                {expiredInvestments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expired investments</p>
                ) : (
                  expiredInvestments.map((investment) => renderInvestmentCard(investment))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedInvestments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No rejected investments</p>
                ) : (
                  rejectedInvestments.map((investment) => renderInvestmentCard(investment))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
