"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Home, LogIn } from "lucide-react";
import { motion } from "motion/react";

export default function LogoutPage() {
  const { setUser } = useUser();
  const router = useRouter();
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    // Simulate cleanup
    const timer = setTimeout(() => {
      setUser(null);
      setIsLoggedOut(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setUser]);

  if (!isLoggedOut) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Logging you out...</h2>
          <p className="text-muted-foreground">Securing your session and clinical data.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="max-w-md w-full border-primary/20 shadow-xl overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-8">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Successfully Logged Out</CardTitle>
            <CardDescription>
              Your session has been terminated safely. Thank you for your service to public health.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <div className="grid grid-cols-1 gap-2">
               <Button onClick={() => window.location.href = '/'} className="gap-2">
                 <Home className="h-4 w-4" /> Return to Homepage
               </Button>
               <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                 <LogIn className="h-4 w-4" /> Login as Another User
               </Button>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-[10px] text-muted-foreground text-center">
              Prototype H365 Hospital Management System v0.1.0
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
