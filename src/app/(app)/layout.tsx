'use client';

import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Assistant } from '@/components/app/assistant';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/');
    }
  }, [currentUser, isLoading, router]);
  
  // While loading or if there's no user, show a loading state
  // to prevent flashing content of protected pages.
  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <div className="hidden md:flex flex-col items-center gap-4 border-r bg-sidebar p-2">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <div className="flex flex-1 flex-col">
            <Skeleton className="h-16 w-full border-b" />
            <div className="flex-1 p-6">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
        <Assistant />
      </div>
    </SidebarProvider>
  );
}
