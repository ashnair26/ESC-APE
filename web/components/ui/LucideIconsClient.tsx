'use client';

import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Edit,
  ExternalLink,
  File,
  FileText,
  Folder,
  Github,
  Heart,
  HelpCircle,
  Home,
  Image,
  Info,
  Link,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Share,
  Trash,
  User,
  X,
  Zap,
} from 'lucide-react';

const LucideIconsClient = () => {
  const icons = [
    { name: 'AlertCircle', icon: <AlertCircle /> },
    { name: 'ArrowRight', icon: <ArrowRight /> },
    { name: 'Check', icon: <Check /> },
    { name: 'ChevronDown', icon: <ChevronDown /> },
    { name: 'ChevronUp', icon: <ChevronUp /> },
    { name: 'Copy', icon: <Copy /> },
    { name: 'Download', icon: <Download /> },
    { name: 'Edit', icon: <Edit /> },
    { name: 'ExternalLink', icon: <ExternalLink /> },
    { name: 'File', icon: <File /> },
    { name: 'FileText', icon: <FileText /> },
    { name: 'Folder', icon: <Folder /> },
    { name: 'Github', icon: <Github /> },
    { name: 'Heart', icon: <Heart /> },
    { name: 'HelpCircle', icon: <HelpCircle /> },
    { name: 'Home', icon: <Home /> },
    { name: 'Image', icon: <Image /> },
    { name: 'Info', icon: <Info /> },
    { name: 'Link', icon: <Link /> },
    { name: 'Mail', icon: <Mail /> },
    { name: 'Menu', icon: <Menu /> },
    { name: 'MessageSquare', icon: <MessageSquare /> },
    { name: 'MoreHorizontal', icon: <MoreHorizontal /> },
    { name: 'MoreVertical', icon: <MoreVertical /> },
    { name: 'Plus', icon: <Plus /> },
    { name: 'Search', icon: <Search /> },
    { name: 'Settings', icon: <Settings /> },
    { name: 'Share', icon: <Share /> },
    { name: 'Trash', icon: <Trash /> },
    { name: 'User', icon: <User /> },
    { name: 'X', icon: <X /> },
    { name: 'Zap', icon: <Zap /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {icons.map((item) => (
        <div
          key={item.name}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-2 text-brand dark:text-brand-light">{item.icon}</div>
          <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default LucideIconsClient;
