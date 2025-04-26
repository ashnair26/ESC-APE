'use client';

import React, { useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Navbar from '@/components/ui/Navbar';
import './navbar-styles.css';

// Define the navbar items and their paths
const navItems = [
  { name: 'Landing', path: '/creatorhub/landing' },
  { name: 'Project', path: '/creatorhub/project' },
  { name: 'Town', path: '/creatorhub/town' },
  { name: 'Analytics', path: '/creatorhub/analytics' },
  { name: 'Content', path: '/creatorhub/content' },
  { name: 'Mint', path: '/creatorhub/mint' },
];

export default function CreatorHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (ready && !authenticated) {
      console.log('User not authenticated, redirecting to login');
      router.replace('/login');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top navbar with logo, navbar and user profile */}
      <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-gray-800 border-opacity-10 bg-black px-4 shadow-sm sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/images/ESCAPE3.svg"
            alt="ESCAPE Logo"
            width={120}
            height={40}
            className="w-auto h-auto"
            priority
          />
        </div>

        {/* UI Components Navbar with custom styling */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="w-full max-w-3xl creatorhub-navbar">
            <Navbar
              items={navItems.map(item => item.name)}
              initialActive={
                pathname === '/creatorhub' || pathname === '/creatorhub/landing'
                  ? 0 // First tab for main page or landing page
                  : (navItems.findIndex(item => pathname?.startsWith(item.path)) !== -1
                    ? navItems.findIndex(item => pathname?.startsWith(item.path))
                    : 0)
              }
              onChange={(index) => {
                router.push(navItems[index].path);
              }}
            />
          </div>
        </div>

        {/* User profile dropdown */}
        <div className="flex items-center">
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-sm text-white">
                    {user?.email?.address ? user.email.address.charAt(0).toUpperCase() :
                     user?.wallet?.address ? user.wallet.address.charAt(2).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <span className="flex items-center">
                <span
                  className="ml-2 text-sm font-semibold leading-6 text-white"
                  aria-hidden="true"
                >
                  {user ? (
                    user.email?.address ? user.email.address.split('@')[0] :
                    user.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'User'
                  ) : 'Guest'}
                </span>
                <ChevronDownIcon
                  className="ml-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-gray-900 py-2 shadow-lg ring-1 ring-gray-800 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={clsx(
                        active ? 'bg-gray-800' : '',
                        'block w-full px-3 py-1 text-left text-sm leading-6 text-white'
                      )}
                      onClick={() => {
                        setIsLoggingOut(true);
                        try {
                          if (logout) {
                            logout().catch(console.error);
                          }
                          // Redirect to login page
                          router.push('/login');
                        } catch (error) {
                          console.error('Error during logout:', error);
                        } finally {
                          setIsLoggingOut(false);
                        }
                      }}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
