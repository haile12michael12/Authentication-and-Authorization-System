import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SecurityStatus() {
  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium">Security Status</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <span className="font-medium">Password Hashing:</span> bcrypt (10 rounds)
          </div>
          <span className="flex items-center text-green-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
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
            Secure
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <span className="font-medium">Token Storage:</span> PostgreSQL
          </div>
          <span className="flex items-center text-green-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
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
            Secure
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <span className="font-medium">2FA Status:</span> Optional
          </div>
          <span className="flex items-center text-amber-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
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
            Consider enforcing
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">JWT Authentication:</span> Enabled
          </div>
          <span className="flex items-center text-green-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
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
            Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
