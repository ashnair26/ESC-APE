'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Component imports will go here as we create them
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import ProgressCard from '@/components/ui/ProgressCard';
import Stat from '@/components/ui/Stat';
import BentoGrid from '@/components/ui/BentoGrid';
import BentoBox from '@/components/ui/BentoBox';
import Navbar from '@/components/ui/Navbar';
import ComicEntryCard from '@/components/ui/ComicEntryCard';
import BrutalistButton from '@/components/ui/BrutalistButton';
import StageCard from '@/components/ui/StageCard';

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState('cards');

  const tabs = [
    { id: 'cards', name: 'Cards' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'badges', name: 'Badges' },
    { id: 'alerts', name: 'Alerts' },
    { id: 'progress', name: 'Progress' },
    { id: 'stats', name: 'Stats' },
    { id: 'bento', name: 'Bento Grid' },
    { id: 'navbar', name: 'Navbar' },
    { id: 'comic', name: 'Comic Components' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-escape-heading">
                Component Showcase
              </h1>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-escape-heading"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-1" />
              Theme Settings
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-escape-body">
            View and interact with all the UI components available in the ESCAPE Creator Engine.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'cards' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Cards</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Basic Cards</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Card title="Basic Card">
                    <p className="text-gray-500 dark:text-gray-400">
                      This is a basic card with a title and content.
                    </p>
                  </Card>

                  <Card title="Card with Footer" footer={<div className="text-right"><Button size="sm">Action</Button></div>}>
                    <p className="text-gray-500 dark:text-gray-400">
                      This card has a footer with an action button.
                    </p>
                  </Card>

                  <Card title="Card with Badge" badge={<Badge color="primary">New</Badge>}>
                    <p className="text-gray-500 dark:text-gray-400">
                      This card has a badge in the title.
                    </p>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Stage Card</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  The Stage Card is a large, immersive card that represents a stage in the creator's world.
                  It features a full-bleed background image, lore text, and a password input for unlocking.
                  The card has fixed dimensions (1174px × 574px) in desktop view.
                </p>

                <div className="space-y-8">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locked Stage</p>
                    <StageCard
                      stageNumber={1}
                      stageTitle="The Forgotten Realm"
                      loreText="Deep within the ancient forest lies a realm forgotten by time itself. Whispers of its existence have been passed down through generations, but few have ever glimpsed its true nature. Those who venture too close often find themselves lost in endless circles, their memories fading with each step."
                      backgroundImage="/images/stage-bg-1.jpg"
                      isLocked={true}
                      correctPassword="ESCAPE"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unlocked Stage</p>
                    <StageCard
                      stageNumber={2}
                      stageTitle="The Crystal Caverns"
                      loreText="Beneath the surface world, a network of crystal caverns pulses with ancient energy. The walls shimmer with colors unknown to the human eye, and the air itself seems to whisper secrets to those who know how to listen. Many have sought the source of this power, but the caverns reveal their mysteries only to the worthy."
                      backgroundImage="/images/stage-bg-2.jpg"
                      isLocked={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'buttons' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Buttons</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Button Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="error">Error</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="info">Info</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" size="xs">Extra Small</Button>
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="primary" size="xl">Extra Large</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Button States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Normal</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="primary" loading>Loading</Button>
                  <Button variant="primary" icon={<HomeIcon className="h-5 w-5" />}>With Icon</Button>
                  <Button variant="primary" iconRight={<HomeIcon className="h-5 w-5" />}>Icon Right</Button>
                  <Button variant="primary" icon={<HomeIcon className="h-5 w-5" />} iconOnly />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Brutalist Buttons</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Brutalist design emphasizes raw, unpolished aesthetics with bold colors, sharp contrasts, and unconventional layouts.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors</h4>
                    <div className="flex flex-wrap gap-4">
                      <BrutalistButton color="red">Red</BrutalistButton>
                      <BrutalistButton color="blue">Blue</BrutalistButton>
                      <BrutalistButton color="yellow">Yellow</BrutalistButton>
                      <BrutalistButton color="green">Green</BrutalistButton>
                      <BrutalistButton color="black">Black</BrutalistButton>
                      <BrutalistButton color="white">White</BrutalistButton>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sizes</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <BrutalistButton color="red" size="sm">Small</BrutalistButton>
                      <BrutalistButton color="red" size="md">Medium</BrutalistButton>
                      <BrutalistButton color="red" size="lg">Large</BrutalistButton>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Styles</h4>
                    <div className="flex flex-wrap gap-4">
                      <BrutalistButton color="blue" skew>Skewed</BrutalistButton>
                      <BrutalistButton color="yellow" noisy>Noisy</BrutalistButton>
                      <BrutalistButton color="green" skew noisy>Skewed & Noisy</BrutalistButton>
                      <BrutalistButton color="black" disabled>Disabled</BrutalistButton>
                      <BrutalistButton color="red" loading>Loading</BrutalistButton>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comic Read Button</h4>
                    <BrutalistButton color="red" style={{ backgroundColor: '#c20023', borderColor: '#000000' }}>READ NOW</BrutalistButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Badges</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Badge Colors</h3>
                <div className="flex flex-wrap gap-4">
                  <Badge color="primary">Primary</Badge>
                  <Badge color="secondary">Secondary</Badge>
                  <Badge color="accent">Accent</Badge>
                  <Badge color="success">Success</Badge>
                  <Badge color="error">Error</Badge>
                  <Badge color="warning">Warning</Badge>
                  <Badge color="info">Info</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Badge Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge color="primary" size="sm">Small</Badge>
                  <Badge color="primary" size="md">Medium</Badge>
                  <Badge color="primary" size="lg">Large</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Badge Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Badge color="primary" variant="solid">Solid</Badge>
                  <Badge color="primary" variant="outline">Outline</Badge>
                  <Badge color="primary" variant="subtle">Subtle</Badge>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Alerts</h2>

              <div className="space-y-4">
                <Alert
                  title="Success Alert"
                  type="success"
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                >
                  This is a success alert with an icon.
                </Alert>

                <Alert
                  title="Error Alert"
                  type="error"
                  icon={<XCircleIcon className="h-5 w-5" />}
                >
                  This is an error alert with an icon.
                </Alert>

                <Alert
                  title="Warning Alert"
                  type="warning"
                  icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                >
                  This is a warning alert with an icon.
                </Alert>

                <Alert
                  title="Info Alert"
                  type="info"
                  icon={<InformationCircleIcon className="h-5 w-5" />}
                >
                  This is an info alert with an icon.
                </Alert>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Alert with Actions</h3>
                <Alert
                  title="Alert with Actions"
                  type="info"
                  icon={<InformationCircleIcon className="h-5 w-5" />}
                  actions={
                    <div className="flex space-x-2">
                      <Button variant="primary" size="sm">Accept</Button>
                      <Button variant="outline" size="sm">Dismiss</Button>
                    </div>
                  }
                >
                  This alert has action buttons.
                </Alert>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Progress Components</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Progress Cards</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <ProgressCard
                    title="Project Alpha"
                    progress={75}
                    status="In Progress"
                    startDate="Jan 1, 2023"
                    endDate="Dec 31, 2023"
                  />

                  <ProgressCard
                    title="Project Beta"
                    progress={100}
                    status="Completed"
                    startDate="Mar 15, 2023"
                    endDate="Sep 30, 2023"
                  />

                  <ProgressCard
                    title="Project Gamma"
                    progress={25}
                    status="At Risk"
                    startDate="Jun 1, 2023"
                    endDate="Feb 28, 2024"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Stat Components</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Stat Cards</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat
                    title="Total Users"
                    value="12,345"
                    change={12}
                    changeType="increase"
                    icon={<HomeIcon className="h-6 w-6" />}
                  />

                  <Stat
                    title="Revenue"
                    value="$45,678"
                    change={8.5}
                    changeType="increase"
                    icon={<HomeIcon className="h-6 w-6" />}
                  />

                  <Stat
                    title="Bounce Rate"
                    value="24.57%"
                    change={3.2}
                    changeType="decrease"
                    icon={<HomeIcon className="h-6 w-6" />}
                  />

                  <Stat
                    title="Avg. Session"
                    value="2m 45s"
                    change={0}
                    changeType="neutral"
                    icon={<HomeIcon className="h-6 w-6" />}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bento' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Bento Grid</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Basic Bento Grid</h3>
                <BentoGrid>
                  <BentoBox size="1x1" className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800" style={{ borderWidth: '0.5px' }}>
                    <div className="flex h-full items-center justify-center">
                      <p className="text-primary-700 dark:text-primary-300">1x1</p>
                    </div>
                  </BentoBox>

                  <BentoBox size="1x2" className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800" style={{ borderWidth: '0.5px' }}>
                    <div className="flex h-full items-center justify-center">
                      <p className="text-secondary-700 dark:text-secondary-300">1x2</p>
                    </div>
                  </BentoBox>

                  <BentoBox size="2x1" className="bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800" style={{ borderWidth: '0.5px' }}>
                    <div className="flex h-full items-center justify-center">
                      <p className="text-accent-700 dark:text-accent-300">2x1</p>
                    </div>
                  </BentoBox>

                  <BentoBox size="2x2" className="bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-800" style={{ borderWidth: '0.5px' }}>
                    <div className="flex h-full items-center justify-center">
                      <p className="text-success-700 dark:text-success-300">2x2</p>
                    </div>
                  </BentoBox>
                </BentoGrid>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Dashboard Example</h3>
                <BentoGrid>
                  <BentoBox size="2x1" noBorder>
                    <Stat
                      title="Total Users"
                      value="12,345"
                      change={12}
                      changeType="increase"
                      icon={<HomeIcon className="h-6 w-6" />}
                    />
                  </BentoBox>

                  <BentoBox size="1x1" noBorder>
                    <Card title="Quick Actions">
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm" fullWidth>New Project</Button>
                        <Button variant="outline" size="sm" fullWidth>Add User</Button>
                      </div>
                    </Card>
                  </BentoBox>

                  <BentoBox size="1x2" noBorder>
                    <ProgressCard
                      title="Project Alpha"
                      progress={75}
                      status="In Progress"
                      startDate="Jan 1, 2023"
                      endDate="Dec 31, 2023"
                    />
                  </BentoBox>

                  <BentoBox size="2x2" noBorder>
                    <Card title="Recent Activity">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <HomeIcon className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">New user registered</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                            <HomeIcon className="h-4 w-4 text-secondary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Project updated</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
                            <HomeIcon className="h-4 w-4 text-accent-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">New comment</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </BentoBox>
                </BentoGrid>
              </div>
            </div>
          )}

          {activeTab === 'navbar' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Navigation</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Sliding Navbar</h3>
                <div className="w-full max-w-3xl">
                  <Navbar
                    items={['PROJECT', 'SOCIAL', 'ANALYTICS', 'CONTENT', 'MINT']}
                    initialActive={0}
                    onChange={(index) => console.log(`Switched to tab ${index}`)}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This navbar features a smooth sliding indicator that moves to highlight the active item.
                  Click on different items to see the animation in action. Resize your browser window to see
                  it transform into a hamburger menu when space is limited.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Navbar Variants</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary</p>
                    <Navbar
                      items={['Home', 'Features', 'Pricing', 'About', 'Contact']}
                      initialActive={0}
                      className="border-primary-200 dark:border-primary-800"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary</p>
                    <Navbar
                      items={['Dashboard', 'Analytics', 'Reports', 'Settings', 'Support']}
                      initialActive={1}
                      className="border-secondary-200 dark:border-secondary-800"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent</p>
                    <Navbar
                      items={['Overview', 'Activity', 'Explore', 'Favorites', 'Archive']}
                      initialActive={2}
                      className="border-accent-200 dark:border-accent-800"
                    />
                  </div>
                </div>

                <h3 className="text-md font-medium text-gray-900 dark:text-white mt-8">Responsive Behavior</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The navbar automatically transforms into a hamburger menu when the container width becomes too small.
                    You can control this breakpoint with the <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">breakpoint</code> prop.
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Small Container (Always Mobile)</p>
                      <div className="w-48">
                        <Navbar
                          items={['One', 'Two', 'Three', 'Four', 'Five']}
                          initialActive={0}
                          breakpoint={1000} // Force mobile view in this small container
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Breakpoint (300px)</p>
                      <Navbar
                        items={['Short', 'Items', 'Fit', 'Better']}
                        initialActive={0}
                        breakpoint={300} // Only switch to mobile at very small widths
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comic' && (
            <div className="space-y-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Comic Components</h2>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Comic Entry Card</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This card serves as the entry point to the Comic Reader. It displays the chapter cover image, title, and a call-to-action button.
                  The card has fixed dimensions (358px × 514px) with the image filling the entire card and text overlay at the bottom.
                </p>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Standard Chapter</p>
                    <ComicEntryCard
                      chapterNumber={1}
                      chapterTitle="The Awakening"
                      description="The journey begins as our hero discovers a hidden world beneath the surface."
                      coverImage="/images/comic-cover-1.jpg"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Chapter</p>
                    <ComicEntryCard
                      chapterNumber={2}
                      chapterTitle="The Descent"
                      description="Venturing deeper into the unknown, secrets begin to reveal themselves."
                      coverImage="/images/comic-cover-2.jpg"
                      isNew={true}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locked Chapter</p>
                    <ComicEntryCard
                      chapterNumber={3}
                      chapterTitle="The Revelation"
                      description="The truth is finally revealed, but at what cost?"
                      coverImage="/images/comic-cover-3.jpg"
                      isLocked={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
