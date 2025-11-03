import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {LogOut, Plus, TrendingUp, Wallet, Calendar } from 'lucide-react';

type Investment = any;
type Payout = any;

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [investmentsResult, payoutsResult] = await Promise.all([
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payouts')
          .select('*')
          .eq('user_id', user.id)
          .order('payout_date', { ascending: false }),
      ]);

      if (investmentsResult.error) throw investmentsResult.error;
      if (payoutsResult.error) throw payoutsResult.error;

      setInvestments(investmentsResult.data || []);
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
  const activeContracts = investments.filter(inv => inv.status === 'active').length;

  if (authLoading || loading) {
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
          <div className="text-2xl font-bold text-primary">Trini4ex</div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalInvested.toFixed(2)} TTD</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{totalPayouts.toFixed(2)} TTD</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Investment Button */}
        <div className="mb-8">
          <Button size="lg" onClick={() => navigate('/invest')} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create New Investment
          </Button>
        </div>

        {/* Investments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Investments</CardTitle>
            <CardDescription>Track your active and completed contracts</CardDescription>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No investments yet. Create your first investment to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {investment.contract_quantity} {investment.contract_quantity === 1 ? 'Contract' : 'Contracts'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(investment.start_date).toLocaleDateString()} - {new Date(investment.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Investment</p>
                        <p className="font-semibold">{Number(investment.total_investment_ttd).toFixed(2)} TTD</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Payout</p>
                        <p className="font-semibold text-accent">{Number(investment.monthly_payout_ttd).toFixed(2)} TTD</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Fee</p>
                        <p className="font-semibold">{Number(investment.monthly_fee_ttd).toFixed(2)} TTD</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Auto-Renew</p>
                        <p className="font-semibold">{investment.auto_renew_enabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payouts yet</p>
            ) : (
              <div className="space-y-2">
                {payouts.slice(0, 5).map((payout) => (
                  <div
                    key={payout.id}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{new Date(payout.payout_date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Fee: {Number(payout.fee_deducted_ttd).toFixed(2)} TTD
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{Number(payout.net_amount_ttd).toFixed(2)} TTD</p>
                      <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
