'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Tag, FileText, Link } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';


// Define the structure for Tags and Pages
interface Page {
    id: number;
    name: string;
    slug: string;
}

interface NfcTag {
    id: number;
    name: string;
    tagId: string | null;
    pageId: number | null;
    assignedPage?: { name: string, slug: string };
}

export default function AssignmentsPage() {
    const [tags, setTags] = useState<NfcTag[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTagId, setSelectedTagId] = useState<string>('');
    const [selectedPageId, setSelectedPageId] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tagsRes, pagesRes] = await Promise.all([
                    fetch('/api/nfc-tags'),
                    fetch('/api/pages'),
                ]);

                const tagsData: NfcTag[] = await tagsRes.json();
                const pagesData: Page[] = await pagesRes.json();

                setTags(tagsData.filter(t => t.tagId !== null)); // Only show registered tags
                setPages(pagesData);
            } catch {
                toast.error("Error fetching data.", { description: "Could not load tags or pages." });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Assignment Logic ---
    const handleAssign = async () => {
        if (!selectedTagId || !selectedPageId) {
            toast.warning("Selection Required", { description: "Please select both a tag and a page." });
            return;
        }

        setIsAssigning(true);
        try {
            const res = await fetch(`/api/nfc-tags/${selectedTagId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: parseInt(selectedPageId, 10) }),
            });

            if (res.ok) {
                const assignedPage = pages.find(p => p.id === parseInt(selectedPageId, 10));
                
                toast.success("Assignment Successful!", {
                    description: `Tag assigned to: ${assignedPage?.name}`,
                });
                
                // Optimistically update the local state to show the new assignment
                setTags(tags.map(t => 
                    t.id === parseInt(selectedTagId, 10) 
                        ? { ...t, pageId: parseInt(selectedPageId, 10), assignedPage: assignedPage }
                        : t
                ));
                
                setSelectedTagId('');
                setSelectedPageId('');

            } else {
                throw new Error("Failed to save assignment.");
            }
        } catch (error) {
            toast.error("Assignment Failed", { description: error instanceof Error ? error.message : "An unknown error occurred." });
        } finally {
            setIsAssigning(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Assignments...</div>;

    // --- Render Content ---
    const registeredTags = tags.filter(t => t.tagId !== null);
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold">Content Assignment Center</h1>
            <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                        <Link className="h-5 w-5 text-blue-500" />
                        <span>Link Tag to Page</span>
                    </CardTitle>
                    <CardDescription>
                        Select a registered tag and a content page, then click &apos;Assign&apos; to create the link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        
                        {/* 1. TAG SELECTOR */}
                        <div className="flex-1 w-full space-y-2">
                            <Label className="flex items-center space-x-2 text-lg font-semibold"><Tag className="w-5 h-5 text-gray-500" /> Select Registered Tag</Label>
                            <Select value={selectedTagId} onValueChange={setSelectedTagId} disabled={isAssigning}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={registeredTags.length > 0 ? "Choose a Tag ID" : "No Registered Tags Available"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {registeredTags.map(tag => (
                                        <SelectItem key={tag.id} value={String(tag.id)}>
                                            {tag.name} (ID: {tag.tagId?.substring(0, 8)}...)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* 2. ARROW CONNECTOR */}
                        <div className="p-4 hidden md:block">
                            <ArrowRight className="h-6 w-6 text-blue-500" />
                        </div>

                        {/* 3. PAGE SELECTOR */}
                        <div className="flex-1 w-full space-y-2">
                            <Label className="flex items-center space-x-2 text-lg font-semibold"><FileText className="w-5 h-5 text-gray-500" /> Select Content Page</Label>
                            <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={isAssigning}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={pages.length > 0 ? "Choose a Content Page" : "No Pages Available"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.map(page => (
                                        <SelectItem key={page.id} value={String(page.id)}>
                                            {page.name} (/p/{page.slug})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <div className="mt-6 flex justify-center">
                        <Button 
                            onClick={handleAssign} 
                            disabled={!selectedTagId || !selectedPageId || isAssigning}
                            className="w-full md:w-auto"
                        >
                            {isAssigning ? 'Assigning...' : 'Complete Assignment'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 4. ASSIGNMENT STATUS TABLE (optional, but helpful for visual confirmation) */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {registeredTags.length === 0 ? (
                            <p className="text-center text-gray-500">No registered tags found. Please register a tag first.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {registeredTags.map(tag => (
                                    <Card key={tag.id} className={tag.assignedPage ? "border-green-400" : "border-orange-400"}>
                                        <CardContent className="p-4 space-y-1">
                                            <p className="font-semibold">{tag.name}</p>
                                            <p className="text-xs text-gray-500 font-mono break-all">ID: {tag.tagId}</p>
                                            <div className="mt-2 pt-2 border-t dark:border-slate-700">
                                                {tag.assignedPage ? (
                                                    <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                                                        <Link className="h-4 w-4 mr-2" />
                                                        Links to: {tag.assignedPage.name}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                                        Needs Content Assignment
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}