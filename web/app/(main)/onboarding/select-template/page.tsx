'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
// Use default import for Button as suggested by previous error message structure
import Button from '@/components/ui/Button';
// Card component is a default export, sub-components are not exported separately
import Card from '@/components/ui/Card';

// Placeholder template data
const templates = [
  { id: 'lore', name: 'Lore Focused', description: 'Ideal for deep storytelling and community lore building.' },
  { id: 'nft_club', name: 'NFT Club', description: 'Centered around NFT collection, evolution, and gated access.' },
  { id: 'quest_hub', name: 'Quest Hub', description: 'Gamified experience driven by daily and project quests.' },
];

export default function SelectTemplatePage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Basic loading state
  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  // Redirect if not authenticated
  if (!authenticated) {
    router.replace('/login');
    return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /> Redirecting...</div>;
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    // In a real scenario, you might store this selection
    console.log(`Selected template: ${templateId}`);
  };

  const handleNext = () => {
    if (selectedTemplate) {
      // Navigate to the next step, potentially passing template info
      router.push(`/onboarding/customize?template=${selectedTemplate}`);
    } else {
      alert('Please select a template first.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Choose Your Starting Point
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Select a template to kickstart your community structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`flex flex-col justify-between cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-primary-500 border-2 scale-105 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelectTemplate(template.id)}
            // Pass title directly as a prop
            title={<span className="text-xl">{template.name}</span>}
            // Footer content is passed via the footer prop
            footer={
              <Button
                variant={selectedTemplate === template.id ? 'primary' : 'outline'}
                className="w-full"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelectTemplate(template.id); }}
              >
                {selectedTemplate === template.id ? 'Selected' : 'Select'}
              </Button>
            }
          >
            {/* Main content goes directly as children */}
            <p>{template.description}</p>
            {/* Placeholder for template preview/icon */}
            <div className="mt-4 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
              Template Preview
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleNext}
        disabled={!selectedTemplate}
        size="lg"
        className="btn-primary"
      >
        Next: Customize Your Community
      </Button>
    </div>
  );
}
