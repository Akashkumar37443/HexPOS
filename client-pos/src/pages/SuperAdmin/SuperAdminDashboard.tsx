import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.js';
import { Store, Users, Activity, TrendingUp } from 'lucide-react';

// Dummy Data
const tenants = [
  { id: 't-1', name: 'Downtown Bistro', status: 'Active', servers: 12, revenue: '$4,200' },
  { id: 't-2', name: 'Sushi Express', status: 'Active', servers: 8, revenue: '$3,100' },
  { id: 't-3', name: 'Cafe Mocha', status: 'Inactive', servers: 4, revenue: '$0' },
];

export const SuperAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h2>
        <p className="text-gray-400 mt-2">Manage all restaurant tenants across the HexPOS network.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Tenants</CardTitle>
            <Store className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">128</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +4 this month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,492</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.99%</div>
            <p className="text-xs text-gray-500 mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant List */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Recent Tenants</CardTitle>
          <CardDescription className="text-gray-400">Overview of restaurant instances and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-500 uppercase bg-gray-950/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Tenant Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Active Staff</th>
                  <th className="px-4 py-3 rounded-tr-lg">Today's Volume</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-white">{tenant.name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{tenant.servers}</td>
                    <td className="px-4 py-4">{tenant.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
