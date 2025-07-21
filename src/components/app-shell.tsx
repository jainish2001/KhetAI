'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Leaf,
  HandCoins,
  Building2,
  History,
  Settings,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import LanguageSwitcher from './language-switcher';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const menuItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/crop-diagnosis', label: t('crop_health'), icon: Leaf },
    { href: '/mandi-prices', label: t('mandi_prices'), icon: HandCoins },
    { href: '/gov-schemes', label: t('gov_schemes'), icon: Building2 },
    { href: '/history', label: t('history'), icon: History },
  ];

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings" passHref>
                <SidebarMenuButton isActive={pathname === '/settings'} tooltip={t('settings')}>
                  <Settings />
                  <span>{t('settings')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
             {loading ? (
                <SidebarMenuButton disabled>
                  <Loader2 className="animate-spin" />
                  <span>Loading...</span>
                </SidebarMenuButton>
              ) : user ? (
                <SidebarMenuButton onClick={signOut} tooltip={t('logout')}>
                  <LogOut />
                  <span>{t('logout')}</span>
                </SidebarMenuButton>
              ) : (
                <Link href="/login" passHref>
                  <SidebarMenuButton isActive={pathname === '/login'} tooltip={t('login')}>
                    <LogIn />
                    <span>{t('login')}</span>
                  </SidebarMenuButton>
                </Link>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
