"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <div className="text-muted-foreground">
            Manage your account settings and preferences
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings configuration will be available soon.
          </p>
          
          {session?.user && (
            <div className="mt-4">
              <p><strong>Email:</strong> {session.user.email}</p>
              {session.user.name && <p><strong>Name:</strong> {session.user.name}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
