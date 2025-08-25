import React from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Auth SDK Demo</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Welcome!</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                You have successfully authenticated using the Auth SDK.
              </p>
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-2">User Information:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Email:</strong> {user?.email}</li>
                  <li><strong>ID:</strong> {user?.id}</li>
                  {user?.full_name && <li><strong>Name:</strong> {user.full_name}</li>}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Auth SDK Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Email Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Support for email/password login and verification codes
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Account Creation</h4>
                <p className="text-sm text-muted-foreground">
                  Multi-step account creation flow with validation
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Password Reset</h4>
                <p className="text-sm text-muted-foreground">
                  Secure password reset with OTP verification
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">OAuth Support</h4>
                <p className="text-sm text-muted-foreground">
                  Ready for OAuth integration with callback handling
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;