// app/t/[tagId]/TagContentRenderer.tsx
'use client';

import React from 'react';
import { PageContent, ComponentData, HeroSectionData, TextBlockData, SpacerData } from '@/components/custom/cms/componentTypes'; 

// --- Component Implementations ---

const HeroSection: React.FC<HeroSectionData> = ({ title, description, bgColor }) => (
    // 💡 FIX: Ensure a minimum height (e.g., min-h-64) and that text color 
    // is applied to contrast the background. 
    <section 
        className={`p-12 text-center text-white min-h-64 flex flex-col items-center justify-center`}
        // Apply the background color dynamically (handles both Tailwind classes and hex codes)
        style={{ backgroundColor: bgColor.startsWith('#') ? bgColor : undefined }}
    >
        <h1 className="text-4xl font-extrabold mb-4 text-black">{title}</h1>
        <p className="text-xl text-gray-500">{description}</p>
    </section>
);


const TextBlock: React.FC<TextBlockData> = ({ content }) => (
    <div className="p-8 max-w-4xl mx-auto">
        {/* 💡 FIX: Using dangerouslySetInnerHTML to render content that was filled 
           in the Page Editor (e.g., HTML from a rich text editor). */}
        <div 
            className="prose lg:prose-xl" 
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    </div>
);

const Spacer: React.FC<SpacerData> = ({ height }) => {
    // Dynamically sets the height class (e.g., h-16)
    return <div className={`w-full h-${height}`}></div>; 
};


const renderComponent = (component: ComponentData, index: number) => {
    switch (component.type) {
        case 'HeroSection':
            return <HeroSection key={index} {...(component as HeroSectionData)} />;
        case 'TextBlock':
            return <TextBlock key={index} {...(component as TextBlockData)} />;
        case 'Spacer':
            return <Spacer key={index} {...(component as SpacerData)} />;
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
            {/* Map over the components array and render each one */}
            {content.components.map(renderComponent)}
        </div>
    );
};