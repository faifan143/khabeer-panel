"use client";

import { useCheckMe } from "@/lib/api/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

/**
 * Example component demonstrating how to use the checkMe endpoint
 * This shows how to manually trigger the check and display the results
 */
export function CheckMeExample() {
  const { isSuperAdmin, permissions, user } = useAuthStore();
  const checkMeMutation = useCheckMe();

  const handleCheckMe = () => {
    checkMeMutation.mutate();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Check Me Endpoint Example
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Current user: <strong>{user?.email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Admin status:{" "}
            <strong>{isSuperAdmin ? "Super Admin" : "Sub Admin"}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Permissions: <strong>{permissions.length}</strong>
          </p>
        </div>

        <Button
          onClick={handleCheckMe}
          disabled={checkMeMutation.isPending}
          className="w-full"
        >
          {checkMeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check My Status
            </>
          )}
        </Button>

        {checkMeMutation.isError && (
          <div className="text-sm text-red-600">
            Error: {checkMeMutation.error?.message || "Failed to check status"}
          </div>
        )}

        {checkMeMutation.isSuccess && (
          <div className="space-y-2">
            <div className="text-sm text-green-600">
              ✓ Status updated successfully!
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">Super Admin:</span>
                <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                  {isSuperAdmin ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Permissions:</span>
                <Badge variant="outline">{permissions.length} total</Badge>
              </div>
              {permissions.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {permissions.join(", ")}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
