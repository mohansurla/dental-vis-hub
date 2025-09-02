import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LoginPage } from "@/components/LoginPage";
import { TechnicianDashboard } from "@/components/TechnicianDashboard";
import { DentistDashboard } from "@/components/DentistDashboard";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'technician' | 'dentist' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create one based on email
        const { data: userData } = await supabase.auth.getUser();
        const email = userData.user?.email || '';
        const role = email.includes('technician') ? 'technician' : 'dentist';
        
        await supabase.from('user_profiles').insert({
          id: userId,
          email,
          role,
          full_name: email.split('@')[0] || 'User'
        });
        
        setUserRole(role);
      } else {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (role: 'technician' | 'dentist') => {
    setUserRole(role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <div className="relative">
            {/* Logout Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-background/80 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Role-based Dashboard */}
            {userRole === 'technician' ? (
              <TechnicianDashboard />
            ) : userRole === 'dentist' ? (
              <DentistDashboard />
            ) : (
              <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                  <p className="text-muted-foreground">Unable to determine user role.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
