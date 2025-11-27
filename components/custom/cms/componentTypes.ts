// components/cms/componentTypes.ts

// NOTE: Ensure this file is accessible by your components

export type ComponentType = 'HeroSection' | 'TextBlock' | 'Spacer';

export interface HeroSectionData {
  type: 'HeroSection';
  title: string;
  description: string;
  bgColor: string; // e.g., 'bg-blue-100' or hex code
}

export interface TextBlockData {
  type: 'TextBlock';
  content: string; // Rich text content (HTML/Markdown)
}

export interface SpacerData {
  type: 'Spacer';
  height: number; // e.g., 16 for h-16
}

// Union type for all component data
export type ComponentData = HeroSectionData | TextBlockData | SpacerData;

// The full content structure stored in the Page.content field
export interface PageContent {
  components: ComponentData[];
}

export const availableComponents: { label: string; type: ComponentType }[] = [
  { label: 'Hero Section', type: 'HeroSection' },
  { label: 'Text Block', type: 'TextBlock' },
  { label: 'Spacer', type: 'Spacer' },
];