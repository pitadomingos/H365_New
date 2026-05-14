"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Microscope, Pill, AlertTriangle, Info, Biohazard, Baby } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: 'clinical' | 'inventory' | 'system' | 'emergency';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  icon: any;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'clinical',
    title: 'Lab Results Ready',
    message: 'Hematology results for patient Alice Mwamba (P001) are now available.',
    time: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    read: false,
    icon: Microscope
  },
  {
    id: 'n2',
    type: 'inventory',
    title: 'Critical Stock Alert',
    message: 'Amoxicillin 500mg stock is below 10% threshold. Requisition required.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    icon: Pill
  },
  {
    id: 'n3',
    type: 'emergency',
    title: 'Emergency OT Request',
    message: 'OT Room 2 requested for urgent C-Section. Surgeon: Dr. Santos.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    icon: AlertTriangle
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Sync Successful',
    message: '245 clinical records synchronized with national database.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    read: true,
    icon: Check
  },
  {
    id: 'n5',
    type: 'clinical',
    title: 'New Referral',
    message: 'Patient Emmanuel Phiri referred to Cardiology by OPD.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 25), // Yesterday
    read: true,
    icon: Baby
  }
];

export default function NotificationsPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage your clinical alerts, inventory updates, and system messages.
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setNotifications([])} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card key={notification.id} className={cn(
                "transition-all duration-200 border-l-4",
                !notification.read ? "border-l-primary bg-primary/5" : "border-l-transparent opacity-80"
              )}>
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    notification.type === 'clinical' && "bg-blue-100 text-blue-600",
                    notification.type === 'inventory' && "bg-amber-100 text-amber-600",
                    notification.type === 'emergency' && "bg-red-100 text-red-600",
                    notification.type === 'system' && "bg-green-100 text-green-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm">{notification.title}</h4>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        {format(notification.time, "HH:mm · MMM d")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => markAsRead(notification.id)}>
                          Mark as read
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-destructive" onClick={() => deleteNotification(notification.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
              <Bell className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">No notifications</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                You're all caught up! New alerts and clinical updates will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
