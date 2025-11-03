import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Trini4ex</div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth?mode=signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Smart Investment Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Grow your wealth with predictable monthly payouts. Start with as little as 1075 TTD per contract.
        </p>
        <Button size="lg" className="text-lg px-8" onClick={() => navigate('/auth?mode=signup')}>
          Start Investing Today
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Trini4ex?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2 text-primary">Predictable Returns</h3>
            <p className="text-muted-foreground">
              Each contract provides 580 USDT total payout over 12 months with transparent calculations.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2 text-primary">Auto-Renew Option</h3>
            <p className="text-muted-foreground">
              Set it and forget it with automatic contract renewal, or manage it manually as you prefer.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2 text-primary">Full Transparency</h3>
            <p className="text-muted-foreground">
              Track all your investments, payouts, and contract statuses in one simple dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-muted/20 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-bold mb-2">Sign Up</h3>
            <p className="text-sm text-muted-foreground">Create your account in minutes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-bold mb-2">Choose Contracts</h3>
            <p className="text-sm text-muted-foreground">Select 1-15 contracts to invest</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-bold mb-2">Receive Payouts</h3>
            <p className="text-sm text-muted-foreground">Get monthly payments automatically</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h3 className="font-bold mb-2">Renew or Cash Out</h3>
            <p className="text-sm text-muted-foreground">Choose to reinvest or receive full payout</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Your Investment Journey?</h2>
        <p className="text-muted-foreground mb-8">Join Trini4ex today and start building your wealth.</p>
        <Button size="lg" onClick={() => navigate('/auth?mode=signup')}>
          Create Your Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Trini4ex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
