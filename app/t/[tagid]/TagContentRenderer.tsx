// app/t/[tagId]/TagContentRenderer.tsx
'use client';

import React from 'react';
import { PageContent, ComponentData, HeroSectionData, TextBlockData } from '@/components/custom/cms/componentTypes'; 
// NOTE: Ensure componentTypes.ts is accessible

// --- Component Implementations (Frontend View) ---

const HeroSection: React.FC<HeroSectionData> = ({ title, description, bgColor }) => (
    // Example rendering using Tailwind classes (you will style this fully)
    <section className={`p-12 text-center text-white ${bgColor || 'bg-gray-800'}`}>
        <h1 className="text-4xl font-extrabold mb-4">{title}</h1>
        <p className="text-xl">{description}</p>
    </section>
);

const TextBlock: React.FC<TextBlockData> = ({ content }) => (
    <div className="p-8 max-w-4xl mx-auto">
        {/* WARNING: In a real app, you would sanitize this HTML. 
           Using dangerouslySetInnerHTML for content is generally risky but common in CMS rendering. */}
        <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
);

const Spacer: React.FC = () => <div className="h-16 w-full"></div>;


const renderComponent = (component: ComponentData, index: number) => {
    switch (component.type) {
        case 'HeroSection':
            // TypeScript assertion is required here since the switch case confirms the type
            return <HeroSection key={index} {...(component as HeroSectionData)} />;
        case 'TextBlock':
            return <TextBlock key={index} {...(component as TextBlockData)} />;
        case 'Spacer':
            return <Spacer key={index} />;
        default:
            return <div key={index} className="p-4 bg-red-100 text-red-700">Error: Unknown component type.</div>;
    }
};

interface TagContentRendererProps {
    content: PageContent;
    pageName: string;
}

export const TagContentRenderer: React.FC<TagContentRendererProps> = ({ content }) => {
    return (
        <div className="min-h-screen w-full">
            {content.components.map(renderComponent)}
        </div>
    );
};