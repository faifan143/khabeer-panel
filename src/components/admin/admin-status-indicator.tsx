"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { useCheckMe } from "@/lib/api/hooks/useAuth";
import { Crown, Shield, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function AdminStatusIndicator() {
  const { isSuperAdmin, permissions, user, isAuthenticated } = useAuthStore();
  const checkMeMutation = useCheckMe();

  // Automatically check admin status when component mounts if authenticated
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin && permissions.length === 0) {
      checkMeMutation.mutate();
    }
  }, [isAuthenticated, isSuperAdmin, permissions.length, checkMeMutation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {checkMeMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            ) : isSuperAdmin ? (
              <Crown className="h-6 w-6 text-yellow-500" />
            ) : (
              <Shield className="h-6 w-6 text-blue-500" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {checkMeMutation.isPending
                  ? "Checking Status..."
                  : isSuperAdmin
                  ? "Super Admin"
                  : "Sub Admin"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user?.email} •{" "}
                {isSuperAdmin
                  ? "Full Access"
                  : `${permissions.length} Permissions`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-600">
              {isSuperAdmin ? "All Permissions" : "Limited Access"}
            </div>
            {!isSuperAdmin && permissions.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {permissions.slice(0, 3).join(", ")}
                {permissions.length > 3 && ` +${permissions.length - 3} more`}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => checkMeMutation.mutate()}
              disabled={checkMeMutation.isPending}
            >
              {checkMeMutation.isPending ? "Checking..." : "Refresh Status"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
