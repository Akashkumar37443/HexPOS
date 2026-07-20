import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';

export const PortalSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">HexPOS System</h1>
          <p className="text-xl text-gray-400">Select your login portal to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Staff Portal */}
          <div 
            onClick={() => navigate('/login/staff')}
            className="group cursor-pointer"
          >
            <Card className="h-full bg-gray-900 border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-blue-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-white">Staff Portal</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  PIN login for Servers, Cashiers, and Kitchen Staff
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-4">
                <span className="inline-flex items-center text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
                  Enter Staff Portal →
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Management Portal */}
          <div 
            onClick={() => navigate('/login/management')}
            className="group cursor-pointer"
          >
            <Card className="h-full bg-gray-900 border-gray-800 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-purple-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShieldAlert className="w-10 h-10 text-purple-400" />
                </div>
                <CardTitle className="text-2xl text-white">Management Portal</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Email login for Super Admins and Restaurant Admins
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-4">
                <span className="inline-flex items-center text-purple-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
                  Enter Management Portal →
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
