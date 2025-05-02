import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";

interface SidebarProps {
  user: User | null;
  logout: () => void;
}

export default function Sidebar({ user, logout }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <aside className="w-full md:w-64 bg-primary text-white flex-shrink-0">
      <div className="p-4 flex items-center border-b border-primary-dark">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
          />
        </svg>
        <h1 className="text-xl font-medium">Auth System</h1>
      </div>
      
      <nav className="p-2">
        <div className="px-4 py-2 text-sm text-white/70">
          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
        </div>
        
        <ul>
          <li>
            <Link href="/dashboard">
              <a className={cn(
                "flex items-center px-4 py-2 rounded my-1",
                location === "/dashboard" 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-light"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" 
                  />
                </svg>
                Dashboard
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/dashboard/users">
              <a className={cn(
                "flex items-center px-4 py-2 rounded my-1",
                location === "/dashboard/users" 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-light"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
                Users
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/dashboard/roles">
              <a className={cn(
                "flex items-center px-4 py-2 rounded my-1",
                location === "/dashboard/roles" 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-light"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
                Roles &amp; Permissions
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/dashboard/sessions">
              <a className={cn(
                "flex items-center px-4 py-2 rounded my-1",
                location === "/dashboard/sessions" 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-light"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                Active Sessions
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/dashboard/settings">
              <a className={cn(
                "flex items-center px-4 py-2 rounded my-1",
                location === "/dashboard/settings" 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-light"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                Settings
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/dashboard/auth-logs">
              <a className={cn(
                "flex items-center px-4 py-2 rounded my-1",
                location === "/dashboard/auth-logs" 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-light"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                Auth Logs
              </a>
            </Link>
          </li>
        </ul>
        
        <div className="border-t border-primary-dark mt-4 pt-4">
          <Link href="/profile">
            <a className="flex items-center px-4 py-2 hover:bg-primary-light rounded">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              Profile
            </a>
          </Link>
          
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-2 hover:bg-primary-light rounded text-red-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
