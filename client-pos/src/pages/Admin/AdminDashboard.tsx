import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { UserPlus, KeyRound, MoreVertical } from 'lucide-react';

// Dummy Staff Data
const initialStaff = [
  { id: 's-1', name: 'Alex', role: 'Server', pin: '1111', status: 'Active' },
  { id: 's-2', name: 'Jordan', role: 'Cashier', pin: '2222', status: 'Active' },
  { id: 's-3', name: 'Taylor', role: 'Server', pin: '3333', status: 'Offline' },
];

export const AdminDashboard = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [isAdding, setIsAdding] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Server');
  const [newStaffPin, setNewStaffPin] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPin) return;

    setStaff([
      ...staff,
      {
        id: `s-${Date.now()}`,
        name: newStaffName,
        role: newStaffRole,
        pin: newStaffPin,
        status: 'Offline'
      }
    ]);
    
    setIsAdding(false);
    setNewStaffName('');
    setNewStaffPin('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Staff Management</h2>
          <p className="text-gray-400 mt-1">Manage servers, cashiers, and their PIN access.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-gray-900 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-white">New Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <Input 
                  value={newStaffName} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffName(e.target.value)} 
                  placeholder="e.g. Sam" 
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <select 
                  value={newStaffRole}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStaffRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Server">Server</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-300">4-Digit PIN</label>
                <Input 
                  value={newStaffPin} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffPin(e.target.value)} 
                  placeholder="e.g. 4444" 
                  maxLength={4}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>
              <Button type="submit" className="h-10 bg-blue-600 hover:bg-blue-700">Save</Button>
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="h-10 text-gray-400">Cancel</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Access PIN</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {member.name.charAt(0)}
                    </div>
                    {member.name}
                  </td>
                  <td className="px-6 py-4">{member.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <KeyRound className="w-4 h-4" />
                      <span className="font-mono tracking-widest text-white">{member.pin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
