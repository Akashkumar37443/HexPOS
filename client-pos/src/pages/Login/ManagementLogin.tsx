import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { ArrowLeft, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';

export const ManagementLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Authentication Logic
    if (email === 'super@hexpos.com' && password === 'password') {
      login({ id: '1', name: 'Super Admin', role: 'super_admin' });
      navigate('/super-admin');
    } else if (email === 'admin@restaurant.com' && password === 'password') {
      login({ id: '2', name: 'Restaurant Admin', role: 'admin', tenantId: 't-123' });
      navigate('/admin');
    } else {
      setError('Invalid email or password. Use super@hexpos.com or admin@restaurant.com with password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 p-6">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portal Selection
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto bg-purple-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-white">Management Login</CardTitle>
            <p className="text-sm text-gray-400">Sign in to your management dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="admin@example.com" 
                  className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-purple-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-purple-500"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6 h-12 text-lg">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
