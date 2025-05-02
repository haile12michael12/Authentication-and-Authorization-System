import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TokenSettings as TokenSettingsType } from "@shared/schema";

export default function TokenSettings() {
  const { toast } = useToast();
  
  // Fetch existing token settings
  const { data: settings, isLoading } = useQuery<TokenSettingsType>({
    queryKey: ["/api/token-settings"],
  });
  
  const [accessTokenExpiration, setAccessTokenExpiration] = useState<string>("1800"); // 30 minutes
  const [refreshTokenExpiration, setRefreshTokenExpiration] = useState<string>("604800"); // 7 days
  const [rotateOnUse, setRotateOnUse] = useState<boolean>(true);
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setAccessTokenExpiration(settings.accessTokenExpiration.toString());
      setRefreshTokenExpiration(settings.refreshTokenExpiration.toString());
      setRotateOnUse(settings.rotateOnUse);
    }
  }, [settings]);
  
  // Update token settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: TokenSettingsType) => {
      const response = await fetch("/api/token-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update token settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/token-settings"] });
      toast({
        title: "Settings updated",
        description: "Token settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      accessTokenExpiration: parseInt(accessTokenExpiration),
      refreshTokenExpiration: parseInt(refreshTokenExpiration),
      rotateOnUse,
    });
  };
  
  const handleRevokeAllTokens = async () => {
    if (confirm("Are you sure you want to revoke all active tokens? This will log out all users.")) {
      try {
        const response = await fetch("/api/revoke-all-sessions", {
          method: "POST",
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error("Failed to revoke tokens");
        }
        
        toast({
          title: "All tokens revoked",
          description: "All active sessions have been terminated.",
        });
      } catch (error) {
        toast({
          title: "Failed to revoke tokens",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-base font-medium">Token Settings</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <svg 
              className="animate-spin h-6 w-6 text-primary" 
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
        ) : (
          <>
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-500 mb-1">
                Access Token Expiration
              </Label>
              <Select
                value={accessTokenExpiration}
                onValueChange={setAccessTokenExpiration}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="900">15 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="7200">2 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-400 mt-1">
                How long access tokens remain valid.
              </p>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-500 mb-1">
                Refresh Token Expiration
              </Label>
              <Select
                value={refreshTokenExpiration}
                onValueChange={setRefreshTokenExpiration}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="86400">24 hours</SelectItem>
                  <SelectItem value="259200">3 days</SelectItem>
                  <SelectItem value="604800">7 days</SelectItem>
                  <SelectItem value="2592000">30 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-400 mt-1">
                How long refresh tokens remain valid.
              </p>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-500 mb-1">
                Token Rotation Policy
              </Label>
              <RadioGroup 
                value={rotateOnUse ? "rotate" : "static"}
                onValueChange={(value) => setRotateOnUse(value === "rotate")}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rotate" id="rotate-token" />
                  <Label htmlFor="rotate-token" className="font-medium text-neutral-500">Rotate on use</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="static" id="static-token" />
                  <Label htmlFor="static-token" className="font-medium text-neutral-500">Static until expiration</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <Button 
                variant="destructive" 
                size="sm"
                className="flex items-center"
                onClick={handleRevokeAllTokens}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
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
                Revoke all tokens
              </Button>
              
              <Button 
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <svg 
                      className="animate-spin h-4 w-4 mr-2" 
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
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
