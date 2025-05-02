import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const limit = 4; // Show 4 users per page
  
  const { data, isLoading } = useQuery<{ users: User[], meta: any }>({
    queryKey: ["/api/users", { limit, offset: (page - 1) * limit }],
  });
  
  function getRoleColorClass(role: string) {
    switch (role) {
      case "admin":
        return "bg-primary-light bg-opacity-10 text-primary";
      case "moderator":
        return "bg-secondary-light bg-opacity-10 text-secondary";
      default:
        return "bg-neutral-200 text-neutral-500";
    }
  }
  
  function getStatusColorClass(status: string) {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-500";
      case "pending":
        return "bg-amber-50 text-amber-500";
      case "locked":
        return "bg-red-50 text-red-500";
      default:
        return "bg-neutral-200 text-neutral-500";
    }
  }
  
  function formatLastLogin(date: string | null) {
    if (!date) return "Never";
    
    const lastLogin = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return lastLogin.toLocaleDateString();
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-medium">Recent Users</h3>
        <Link href="/dashboard/users">
          <a className="text-primary text-sm flex items-center">
            View all
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </a>
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">User</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Role</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Last Login</TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody className="divide-y divide-neutral-200">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-4 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : data?.users && data.users.length > 0 ? (
              data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-500">{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-500">{user.email}</div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColorClass(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatLastLogin(user.lastLogin)}
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" className="text-primary hover:text-primary-dark mr-3">
                      Edit
                    </Button>
                    {user.status === "locked" ? (
                      <Button variant="ghost" className="text-green-500 hover:text-green-800">
                        Unlock
                      </Button>
                    ) : (
                      <Button variant="ghost" className="text-red-500 hover:text-red-800">
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-4 text-center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          Showing {data?.users.length || 0} of {data?.meta.total || 0} users
        </div>
        <div className="flex">
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.meta.hasMore}
            onClick={() => setPage(page + 1)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
