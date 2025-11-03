import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const CONTRACT_PRICE_TTD = 1075;
const USDT_TO_TTD_RATE = 6.78;
const PAYOUT_PER_CONTRACT_USDT = 580;
const CONTRACT_MONTHS = 12;

const AVAILABLE_CONTRACTS = [1, 2, 3, 4, 5, 10, 15];

export default function CreateInvestment() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedContracts, setSelectedContracts] = useState(1);
  const [autoRenew, setAutoRenew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const monthlyPayoutPerContract = (PAYOUT_PER_CONTRACT_USDT / CONTRACT_MONTHS) * USDT_TO_TTD_RATE;
  const monthlyFeePerContract = CONTRACT_PRICE_TTD / CONTRACT_MONTHS;

  const totalInvestment = selectedContracts * CONTRACT_PRICE_TTD;
  const monthlyGrossPayoutTotal = selectedContracts * monthlyPayoutPerContract;
  const monthlyFeeTotal = autoRenew ? selectedContracts * monthlyFeePerContract : 0;
  const monthlyNetPayout = monthlyGrossPayoutTotal - monthlyFeeTotal;

  const handleCreateInvestment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + CONTRACT_MONTHS);

      const { error } = await supabase.from('investments').insert([{
        user_id: user.id,
        contract_quantity: selectedContracts,
        total_investment_ttd: totalInvestment,
        monthly_payout_ttd: monthlyGrossPayoutTotal,
        monthly_fee_ttd: monthlyFeeTotal,
        auto_renew_enabled: autoRenew,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active' as const,
      }]);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Investment created successfully.',
      });

      navigate('/dashboard');
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

  if (authLoading) {
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
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Investment</CardTitle>
            <CardDescription>Select the number of contracts and configure your investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contract Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Number of Contracts</Label>
              <RadioGroup
                value={selectedContracts.toString()}
                onValueChange={(value) => setSelectedContracts(parseInt(value))}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AVAILABLE_CONTRACTS.map((count) => (
                    <div key={count} className="relative">
                      <RadioGroupItem
                        value={count.toString()}
                        id={`contract-${count}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`contract-${count}`}
                        className="flex flex-col items-center justify-center rounded-md border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                      >
                        <span className="text-2xl font-bold">{count}</span>
                        <span className="text-sm text-muted-foreground">
                          {count === 1 ? 'Contract' : 'Contracts'}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Investment Summary */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment:</span>
                  <span className="font-bold text-lg">{totalInvestment.toFixed(2)} TTD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Duration:</span>
                  <span className="font-semibold">{CONTRACT_MONTHS} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Gross Payout:</span>
                  <span className="font-semibold text-accent">{monthlyGrossPayoutTotal.toFixed(2)} TTD</span>
                </div>
                {autoRenew && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Fee (Auto-Renew):</span>
                    <span className="font-semibold">-{monthlyFeeTotal.toFixed(2)} TTD</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Monthly Net Payout:</span>
                    <span className="font-bold text-xl text-primary">{monthlyNetPayout.toFixed(2)} TTD</span>
                  </div>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Return (12 months):</span>
                    <span className="font-bold text-accent">{(selectedContracts * PAYOUT_PER_CONTRACT_USDT * USDT_TO_TTD_RATE).toFixed(2)} TTD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Renew Option */}
            <Card className="border-primary/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="auto-renew" className="text-base font-semibold">
                      Enable Auto-Renew
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically reinvest monthly fees to purchase new contracts. You can disable this feature
                      during the last week before your contract expires.
                    </p>
                  </div>
                  <Switch id="auto-renew" checked={autoRenew} onCheckedChange={setAutoRenew} />
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Each contract costs {CONTRACT_PRICE_TTD} TTD and pays out {PAYOUT_PER_CONTRACT_USDT} USDT over {CONTRACT_MONTHS} months</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Monthly payouts are calculated at {USDT_TO_TTD_RATE} USDT/TTD exchange rate</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Auto-renew can only be disabled during the last week before contract expiry
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  If auto-renew is disabled before expiry, your final payout will be the full amount without deductions
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1" disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvestment} className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Investment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
