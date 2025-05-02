import { useState } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import Stats from "@/components/dashboard/stats";
import UsersTable from "@/components/dashboard/users-table";
import AuthLogs from "@/components/dashboard/auth-logs";
import QuickActions from "@/components/dashboard/quick-actions";
import TokenSettings from "@/components/dashboard/token-settings";
import SecurityStatus from "@/components/dashboard/security-status";
import AddUserModal from "@/components/modals/add-user-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const logout = useLogout();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  // Get dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const openAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };
  
  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar user={user} logout={logout} />
      
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <Header user={user} />
        
        <div className="p-4 md:p-6">
          {/* Stats */}
          <Stats stats={stats} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              {/* Users Table */}
              <UsersTable />
              
              {/* Auth Logs */}
              <AuthLogs />
            </div>
            
            <div className="xl:col-span-1">
              {/* Quick Actions */}
              <QuickActions onAddUser={openAddUserModal} />
              
              {/* Token Settings */}
              <TokenSettings />
              
              {/* Security Status */}
              <SecurityStatus />
            </div>
          </div>
        </div>
      </main>
      
      {/* Add User Modal */}
      <AddUserModal isOpen={isAddUserModalOpen} onClose={closeAddUserModal} />
    </div>
  );
}
