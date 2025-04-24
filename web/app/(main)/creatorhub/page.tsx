'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import './creatorhub-styles.css';

export default function CreatorHubPage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect if not authenticated
  if (!authenticated && ready) {
    router.replace('/login');
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoadingSpinner size="lg" />
        <span className="ml-3">Redirecting to login...</span>
      </div>
    );
  }

  // Loading state
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoadingSpinner size="lg" />
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigation items for the navbar with updated links
  const navItems = ['LANDING', 'PROJECT', 'TOWN', 'ANALYTICS', 'CONTENT', 'MINT'];

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

        {/* Sliding Navbar - Now in the middle of the top bar */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="w-full max-w-3xl">
            <Navbar
              items={navItems}
              initialActive={0}
              onChange={(index) => console.log(`Switched to tab ${index}`)}
              breakpoint={0} // Force desktop view by setting breakpoint to 0
            />
          </div>
        </div>

        {/* User profile dropdown */}
        <div className="flex items-center">
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon
                className="h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <span className="flex items-center">
                <span
                  className="ml-2 text-sm font-semibold leading-6 text-white"
                  aria-hidden="true"
                >
                  {user?.wallet?.address?.slice(0, 6) || user?.email?.address?.split('@')[0] || '...'}
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
                      onClick={handleLogout}
                    >
                      Sign out
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

        {/* Empty content area */}
        <div className="flex flex-col items-center justify-center mt-12">
          <h1 className="text-3xl font-normal mb-4" style={{ fontFamily: 'League Spartan, sans-serif' }}>
            Welcome to your Town
          </h1>
          <p className="text-center text-gray-400 max-w-lg mb-8">
            Your town has been created successfully. This is your creator hub where you can manage your community.
          </p>
        </div>
      </div>
    </div>
  );
}
