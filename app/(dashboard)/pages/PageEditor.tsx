// app/(dashboard)/pages/PageEditor.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Menu, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// DnD Imports
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// --- Component Types and Data Definitions ---
// NOTE: It is best practice to move this to a separate file like '@/components/cms/componentTypes'

export type ComponentType = 'HeroSection' | 'TextBlock' | 'Spacer';

export interface HeroSectionData {
  type: 'HeroSection';
  title: string;
  description: string;
  bgColor: string; 
}

export interface TextBlockData {
  type: 'TextBlock';
  content: string; 
}

export interface SpacerData {
  type: 'Spacer';
  height: number; 
}

export type ComponentData = HeroSectionData | TextBlockData | SpacerData;

export interface PageContent {
  components: ComponentData[];
}

export const availableComponents: { label: string; type: ComponentType }[] = [
  { label: 'Hero Section', type: 'HeroSection' },
  { label: 'Text Block', type: 'TextBlock' },
  { label: 'Spacer', type: 'Spacer' },
];


// --- Component Rendering and Forms (Simplified) ---

const HeroSectionForm = ({ data, onChange }: { data: HeroSectionData, onChange: (d: Partial<HeroSectionData>) => void }) => (
    <div className="space-y-2 border p-3 rounded-md bg-blue-50/50">
        <h4 className="font-semibold text-blue-800">Hero Section</h4>
        <Input placeholder="Title" value={data.title} onChange={(e) => onChange({ title: e.target.value })} />
        <Textarea placeholder="Description" value={data.description} onChange={(e) => onChange({ description: e.target.value })} />
        <div className="flex items-center space-x-2">
             <Label htmlFor="bgColor" className="w-1/3">Background Color</Label>
             <Input id="bgColor" placeholder="e.g., #F0F4F8 or bg-gray-100" value={data.bgColor} onChange={(e) => onChange({ bgColor: e.target.value })} />
        </div>
    </div>
);

const TextBlockForm = ({ data, onChange }: { data: TextBlockData, onChange: (d: Partial<TextBlockData>) => void }) => (
    <div className="space-y-2 border p-3 rounded-md bg-green-50/50">
        <h4 className="font-semibold text-green-800">Text Block</h4>
        <Textarea placeholder="Rich Content (HTML/Markdown)" value={data.content} onChange={(e) => onChange({ content: e.target.value })} />
    </div>
);

const ComponentForm = ({ component, onChange }: { component: ComponentData, onChange: (data: ComponentData) => void }) => {
    switch (component.type) {
        case 'HeroSection':
            return <HeroSectionForm 
                data={component} 
                onChange={(d) => onChange({ ...component, ...d } as HeroSectionData)} 
            />;
        case 'TextBlock':
            return <TextBlockForm 
                data={component} 
                onChange={(d) => onChange({ ...component, ...d } as TextBlockData)} 
            />;
        case 'Spacer':
            return <div className="p-2 text-center text-sm text-gray-500 border-dashed border-2 rounded-md">Spacer: Height {component.height}</div>;
        default:
            return <div className="text-red-500">Unknown Component</div>;
    }
};

const getInitialComponentData = (type: ComponentType): ComponentData => {
    switch (type) {
        case 'HeroSection':
            return { type: 'HeroSection', title: 'New Hero Title', description: 'Enter a compelling description.', bgColor: '#FFFFFF' };
        case 'TextBlock':
            return { type: 'TextBlock', content: 'Start typing your body content here.' };
        case 'Spacer':
            return { type: 'Spacer', height: 16 };
        default:
            throw new Error('Invalid component type');
    }
};

// --- Sortable Item Component ---

interface SortableComponentItemProps {
    component: ComponentData;
    index: number;
    updateComponent: (index: number, newData: ComponentData) => void;
    removeComponent: (index: number) => void;
}

const SortableComponentItem = ({ component, index, updateComponent, removeComponent }: SortableComponentItemProps) => {
    // We use the index as the unique ID for simplicity in this array structure
    const id = index.toString(); 

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: transform ? 100 : 1, 
    };

    const handleUpdate = (newData: ComponentData) => {
        updateComponent(index, newData);
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="border p-4 rounded-lg shadow-sm bg-white relative mb-4 touch-action-none" 
        >
            <div className="absolute top-2 right-2 flex space-x-1">
                {/* Drag Handle */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    {...listeners} 
                    {...attributes} 
                    className="cursor-grab text-slate-500 hover:bg-slate-100"
                >
                    <Menu className="h-4 w-4" /> 
                </Button>
                
                {/* Delete Button */}
                <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => removeComponent(index)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="pr-20"> 
                <ComponentForm component={component} onChange={handleUpdate} />
            </div>
        </div>
    );
};


// --- Main Editor Component ---

interface PageEditorProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    initialPage: { id?: number; name: string; slug: string; content: string } | null;
    onSave: (success: boolean) => void;
}

export default function PageEditor({ isOpen, setIsOpen, initialPage, onSave }: PageEditorProps) {
    const isNew = !initialPage;
    
    // Parse content JSON or initialize with an empty array
    const initialContent = useMemo(() => {
        if (initialPage && initialPage.content) {
            try {
                const parsed = JSON.parse(initialPage.content) as PageContent;
                return parsed.components;
            } catch {
                return [];
            }
        }
        return [];
    }, [initialPage]);

    const [pageName, setPageName] = useState(initialPage?.name || '');
    const [pageSlug, setPageSlug] = useState(initialPage?.slug || '');
    const [components, setComponents] = useState<ComponentData[]>(initialContent);
    const [newComponentType, setNewComponentType] = useState<ComponentType | ''>('');
    const [isSaving, setIsSaving] = useState(false);

    // Custom hook to configure the sensor for drag events
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require a small drag distance before activating
            },
        })
    );

    // Sync state with props on change
    useEffect(() => {
        setPageName(initialPage?.name || '');
        setPageSlug(initialPage?.slug || '');
        setComponents(initialContent);
    }, [initialPage, initialContent]);

    // Handle component changes
    const updateComponent = useCallback((index: number, newData: ComponentData) => {
        setComponents(prev => prev.map((comp, i) => (i === index ? newData : comp)));
    }, []);

    const addComponent = () => {
        if (!newComponentType) return;
        const newComponent = getInitialComponentData(newComponentType as ComponentType);
        setComponents(prev => [...prev, newComponent]);
        setNewComponentType(''); // Reset dropdown
    };

    const removeComponent = (index: number) => {
        setComponents(prev => prev.filter((_, i) => i !== index));
    };
    
    // Handle Drag End event
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setComponents((items) => {
                // IDs are strings of the index (e.g., "0", "1", "2")
                const oldIndex = parseInt(active.id as string, 10);
                const newIndex = parseInt(over!.id as string, 10);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, []);

    
    // Handle Save/Create API Call
    const handleSubmit = async () => {
        if (!pageName || !pageSlug) {
            // return toast({ title: 'Validation Error', description: 'Page Name and Slug are required.', variant: 'destructive' });
        }
        
        setIsSaving(true);
        
        const pageData = {
            name: pageName,
            slug: pageSlug.toLowerCase().replace(/\s+/g, '-'), // Auto-slugify
            content: JSON.stringify({ components: components } as PageContent),
        };

        const url = isNew ? '/api/pages' : `/api/pages/${initialPage?.id}`;
        const method = isNew ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pageData),
            });

            if (res.ok) {
                // toast({ title: 'Success', description: `Page ${isNew ? 'created' : 'updated'} successfully.` });
                onSave(true);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to ${isNew ? 'create' : 'update'} page.`);
            }
        } catch {
            // toast({ 
            //     title: 'API Error', 
            //     description: error instanceof Error ? error.message : "An unknown error occurred.", 
            //     variant: 'destructive' 
            // });
            onSave(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset state when closing
            setPageName('');
            setPageSlug('');
            setComponents([]);
            setNewComponentType('');
        }
        setIsOpen(open);
    };

    // Map component data to sortable IDs (string index)
    const componentIds = useMemo(() => components.map((_, i) => i.toString()), [components]);


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isNew ? 'Create New Page' : `Edit Page: ${initialPage?.name}`}</DialogTitle>
                </DialogHeader>
                
                <div className="flex-shrink-0 space-y-4 py-2 border-b">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="pageName">Page Name</Label>
                            <Input id="pageName" value={pageName} onChange={(e) => setPageName(e.target.value)} disabled={isSaving} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="pageSlug">Slug</Label>
                            <Input 
                                id="pageSlug" 
                                value={pageSlug} 
                                onChange={(e) => setPageSlug(e.target.value)} 
                                placeholder="my-awesome-page" 
                                disabled={!isNew || isSaving} // Slug should only be editable on creation
                            />
                            {!isNew && <p className="text-xs text-slate-500 mt-1">Slug is not editable.</p>}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
                    <h3 className="text-lg font-semibold border-b pb-1">Page Components</h3>
                    
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={componentIds} 
                            strategy={verticalListSortingStrategy}
                        >
                            {components.length === 0 && (
                                <div className="text-center py-10 text-slate-500 border-dashed border-2 rounded-lg">
                                    No components added yet.
                                </div>
                            )}
                            {components.map((component, index) => (
                                <SortableComponentItem
                                    key={index}
                                    component={component}
                                    index={index}
                                    updateComponent={updateComponent}
                                    removeComponent={removeComponent}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="flex-shrink-0 space-y-2 pt-2 border-t">
                    <div className="flex space-x-2">
                        <Select onValueChange={(val: ComponentType) => setNewComponentType(val)} value={newComponentType}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Add Component" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableComponents.map(comp => (
                                    <SelectItem key={comp.type} value={comp.type}>
                                        {comp.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={addComponent} disabled={!newComponentType || isSaving}>
                            <Plus className="h-5 w-5 mr-2" /> Add Component
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            <Save className="h-5 w-5 mr-2" /> 
                            {isSaving ? 'Saving...' : (isNew ? 'Create Page' : 'Save Changes')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}