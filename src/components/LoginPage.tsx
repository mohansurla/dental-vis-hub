import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Stethoscope, Shield, Upload } from 'lucide-react';
import healthcareHero from '@/assets/healthcare-hero.jpg';

interface LoginPageProps {
  onLogin: (role: 'technician' | 'dentist') => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // Create default profile if doesn't exist
        const role = email.includes('technician') ? 'technician' : 'dentist';
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          role,
          full_name: data.user.email?.split('@')[0] || 'User'
        });
        onLogin(role);
      } else {
        onLogin(profile.role);
      }

      toast({
        title: "Login successful",
        description: "Welcome to OralVis Healthcare",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.1)), url(${healthcareHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/80 to-accent/5"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 backdrop-blur-sm p-4 rounded-full border border-primary/20">
              <Stethoscope className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">OralVis Healthcare</h1>
          <p className="text-muted-foreground mt-2">Secure Dental Scan Management System</p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-background/50"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary-hover" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-center text-muted-foreground mb-4">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/30 backdrop-blur-sm">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-medical-info" />
                  <p className="text-xs font-medium">Technician</p>
                  <p className="text-xs text-muted-foreground">technician@oralvis.com</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30 backdrop-blur-sm">
                  <Stethoscope className="h-5 w-5 mx-auto mb-1 text-medical-success" />
                  <p className="text-xs font-medium">Dentist</p>
                  <p className="text-xs text-muted-foreground">dentist@oralvis.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};