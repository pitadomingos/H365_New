
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { LocaleProvider } from '@/context/locale-context';
import { UserProvider } from '@/context/user-context';
import { AppShell } from '@/components/layout/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ConnectivityIndicator } from '@/components/connectivity-indicator';

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <LocaleProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* SidebarProvider now has defaultOpen={true} */}
              <SidebarProvider defaultOpen={true}> 
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
          </UserProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
