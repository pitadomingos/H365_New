
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { LocaleProvider } from '@/context/locale-context';
import { UserProvider } from '@/context/user-context';
import { OfflineProvider } from '@/context/offline-context';
import { AppShell } from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ConnectivityIndicator } from '@/components/connectivity-indicator';
import { SwCleanup } from '@/components/sw-cleanup';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'H365',
  description: 'Comprehensive Hospital Management System',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "H365",
  },
  formatDetection: {
    telephone: false,
  },
};

const SIDEBAR_WIDTH = "16rem"; 
const SIDEBAR_WIDTH_ICON = "3.5rem"; // Standard icon-only width (e.g., 56px)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ── SW Killer ─────────────────────────────────────────────────────────
          Runs synchronously BEFORE any _next/static chunk is requested.
          If a stale Serwist SW is registered it is unregistered + all caches
          cleared + page reloaded — breaking the 404-chunk deadlock in dev.
          The `if (localStorage.getItem('sw_cleaned'))` guard prevents an
          infinite reload loop once the SW has already been cleared.
      ────────────────────────────────────────────────────────────────────── */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (typeof window === 'undefined') return;
            if (!('serviceWorker' in navigator)) return;
            if (location.hostname !== 'localhost') return;
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              if (!regs.length) return;
              var cleared = sessionStorage.getItem('h365_sw_cleared');
              if (cleared) return; // already cleared this session — don't loop
              sessionStorage.setItem('h365_sw_cleared', '1');
              Promise.all(
                regs.map(function(r) { return r.unregister(); }).concat(
                  [caches.keys().then(function(keys) {
                    return Promise.all(keys.map(function(k) { return caches.delete(k); }));
                  })]
                )
              ).then(function() {
                console.info('[H365] Stale SW cleared — reloading…');
                location.reload();
              });
            });
          })();
        `}} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LocaleProvider>
          <UserProvider>
            <OfflineProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
              {/* SidebarProvider now has defaultOpen={true} */}
              <SidebarProvider defaultOpen={true}> 
                <SwCleanup />
                <ConnectivityIndicator />
                <div
                  style={
                    {
                      "--sidebar-width": SIDEBAR_WIDTH,
                      "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, 
                    } as React.CSSProperties
                  }
                  className={cn(
                    "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
                  )}
                >
                  <AppShell>{children}</AppShell>
                </div>
              </SidebarProvider>
              <Toaster />
            </ThemeProvider>
          </OfflineProvider>
        </UserProvider>
      </LocaleProvider>
    </body>
  </html>
);
}
