import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { LogOut, LayoutDashboard, Settings, Users, Store, Activity } from 'lucide-react';
import { Button } from '../ui/Button.js';

export const ManagementLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const navItems = user?.role === 'super_admin' ? [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/super-admin' },
    { icon: <Store size={20} />, label: 'Tenants', path: '/super-admin/tenants' },
    { icon: <Activity size={20} />, label: 'System Health', path: '/super-admin/health' },
    { icon: <Settings size={20} />, label: 'Global Settings', path: '/super-admin/settings' },
  ] : [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20} />, label: 'Staff Management', path: '/admin/staff' },
    { icon: <Settings size={20} />, label: 'Restaurant Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className={user?.role === 'super_admin' ? 'text-purple-500' : 'text-blue-500'}>
              HexPOS
            </span>
            {user?.role === 'super_admin' ? 'HQ' : 'Admin'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
