interface StatsProps {
  stats?: {
    userCount: number;
    sessionCount: number;
    successfulLoginCount: number;
    failedLoginCount: number;
  };
}

export default function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-primary-light bg-opacity-20 p-3 mr-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-primary" 
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
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Registered Users</div>
          <div className="text-2xl font-medium">{stats?.userCount || 0}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-secondary-light bg-opacity-20 p-3 mr-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-secondary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
            />
          </svg>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Active Sessions</div>
          <div className="text-2xl font-medium">{stats?.sessionCount || 0}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-green-50 p-3 mr-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-green-500" 
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
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Successful Logins</div>
          <div className="text-2xl font-medium">{stats?.successfulLoginCount || 0}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-red-50 p-3 mr-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" 
            />
          </svg>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Failed Attempts</div>
          <div className="text-2xl font-medium">{stats?.failedLoginCount || 0}</div>
        </div>
      </div>
    </div>
  );
}
