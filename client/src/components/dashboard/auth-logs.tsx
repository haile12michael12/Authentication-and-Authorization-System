import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AuthLog } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AuthLogs() {
  const { data: logs, isLoading } = useQuery<AuthLog[]>({
    queryKey: ["/api/auth-logs", { limit: 5 }],
  });

  function getActionIcon(action: string, status: string) {
    if (status === "failure") {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-red-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      );
    }

    switch (action) {
      case "login":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        );
      case "token_refresh":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        );
      case "register":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
            />
          </svg>
        );
      case "logout":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-blue-500" 
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
        );
      case "account_locked":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-amber-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        );
      default:
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-neutral-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        );
    }
  }

  function getBorderColor(action: string, status: string) {
    if (status === "failure") return "border-red-500";
    if (action === "login" || action === "token_refresh") return "border-green-500";
    if (action === "register") return "border-primary";
    if (action === "account_locked") return "border-amber-500";
    if (action === "logout") return "border-blue-500";
    return "border-neutral-300";
  }

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  function formatActionTitle(action: string) {
    switch (action) {
      case "login": return "Successful login";
      case "login_failed": return "Failed login attempt";
      case "register": return "New registration";
      case "token_refresh": return "Token refreshed";
      case "logout": return "Logout";
      case "account_locked": return "Account locked";
      default: return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-3 border-b flex justify-between items-center">
        <CardTitle className="text-base font-medium">Recent Authentication Activity</CardTitle>
        <Link href="/dashboard/auth-logs">
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
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg 
              className="animate-spin h-8 w-8 text-primary" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={cn(
                  "flex items-start p-3 border-l-4", 
                  getBorderColor(log.action, log.status)
                )}
              >
                <span className="mr-3">{getActionIcon(log.action, log.status)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{formatActionTitle(log.action)}</span>
                      {log.userId && (
                        <>
                          {" - "}
                          <span className="text-neutral-500">{log.userId}</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">
                      {formatTimestamp(log.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">
                    IP: {log.ipAddress} • {log.userAgent?.split(' ')[0] || 'Unknown'} 
                    {log.details && ` • ${log.details}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            No authentication logs available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
