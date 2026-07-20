import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { PinPad } from '../../components/ui/PinPad.js';
import { ArrowLeft, KeyRound } from 'lucide-react';

export const StaffLogin = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePinSubmit = (pin: string) => {
    setError('');
    
    // Mock PIN Authentication
    if (pin === '1111') {
      // Server
      login({ id: '3', name: 'Alex (Server)', role: 'server', tenantId: 't-123' });
      navigate('/pos');
    } else if (pin === '2222') {
      // Cashier
      login({ id: '4', name: 'Jordan (Cashier)', role: 'cashier', tenantId: 't-123' });
      navigate('/pos');
    } else {
      setError('Invalid PIN. Use 1111 for Server or 2222 for Cashier.');
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
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto bg-blue-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <KeyRound className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Staff Login</h1>
            <p className="text-gray-400">Enter your 4-digit PIN to access the terminal</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <PinPad onPinSubmit={handlePinSubmit} pinLength={4} />
            
            {error && (
              <div className="mt-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
