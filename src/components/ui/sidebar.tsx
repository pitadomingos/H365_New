
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Context Setup ---
interface SidebarContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isMobile: boolean; // Kept for potential future use, but logic simplified
  // collapsible: "icon" | "none"; // Simplified to always "icon" for desktop
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  // collapsible?: "icon" | "none"; // No longer needed as prop, fixed to "icon"
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true, // Start expanded by default
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cookie logic removed for now to ensure core toggle works first
  // React.useEffect(() => {
  //   if (isMounted) {
  //     const storedState = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("sidebar-open="))
  //       ?.split("=")[1];
  //     if (storedState) {
  //       setOpen(storedState === "true");
  //     }
  //   }
  // }, [isMounted, defaultOpen]);

  // React.useEffect(() => {
  //   if (isMounted) {
  //     document.cookie = `sidebar-open=${open}; path=/; max-age=31536000`; // Expires in 1 year
  //   }
  // }, [open, isMounted]);


  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar,
      isMobile: false, // Simplified: always treat as desktop for this iteration
      // collapsible: "icon", // Fixed for desktop
    }),
    [open, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};
SidebarProvider.displayName = "SidebarProvider";

// --- Sidebar Component ---
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "default" | "inset" | "floating"; // Keep variant if used for styling elsewhere
  }
>(({ side = "left", className, children, variant = "default", ...props }, ref) => {
  const { open } = useSidebar();

  const currentWidthClass = open ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]";

  return (
    <div
      ref={ref}
      className={cn(
        "group peer hidden md:block text-sidebar-foreground",
        variant === "inset" && "md:has-[[data-sidebar=inset]]:bg-sidebar",
        variant === "floating" && "md:border-r-0 md:shadow-lg",
        className
      )}
      data-state={open ? "expanded" : "collapsed"}
      data-collapsible="icon" // Always icon collapsible for desktop
      data-variant={variant}
      {...props}
    >
      {/* Sizer div - for layout pushing */}
      <div
        className={cn(
          "duration-200 relative h-svh bg-transparent transition-[width] ease-linear",
          currentWidthClass
        )}
      />
      {/* Actual sidebar content container */}
      <div
        className={cn(
          "duration-200 fixed inset-y-0 z-10 hidden h-svh transition-[left,right,width] ease-linear md:flex",
          side === "left" ? "left-0 border-r border-sidebar-border" : "right-0 border-l border-sidebar-border",
          currentWidthClass,
          variant === "floating" && (side === "left" ? "md:left-4" : "md:right-4"),
          variant === "floating" && "md:my-4 md:h-[calc(100svh_-_theme(spacing.8))] md:rounded-xl"
        )}
      >
        <div
          data-sidebar="sidebar-inner-content"
          className={cn("flex h-full w-full flex-col bg-sidebar", variant === "floating" && "md:rounded-xl")}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        // Padding is now managed by the parent div in RootLayout based on AppShell's structure
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex flex-col", // AppShell will handle specific padding based on state
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";


const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2", // AppShell will handle specific padding based on state
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarFooter.displayName = "SidebarFooter";


const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden", // AppShell will handle specific padding
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarContent.displayName = "SidebarContent";


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";


const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm", // Adjusted height for potentially icon-only
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { // No more asChild for NAV_ITEMS
    isActive?: boolean;
    tooltip?: string;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({
  isActive = false,
  variant = "default",
  size = "default",
  className,
  children,
  tooltip,
  ...props
}, ref) => {
  const { open } = useSidebar();
  const isIconOnlyCollapsed = !open;

  const buttonContent = (
    <button
      ref={ref}
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        isIconOnlyCollapsed && "!size-8 !p-2 justify-center", // Icon-only sizing
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'span') {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(child.props.className, isIconOnlyCollapsed && "hidden"),
          });
        }
        return child;
      })}
    </button>
  );

  if (isIconOnlyCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
});
SidebarMenuButton.displayName = "SidebarMenuButton";


export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
  // SidebarTrigger, // No longer exported if not used
};
