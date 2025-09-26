// app/(dashboard)/nfc-tags/TagAssignment.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Page {
    id: number;
    name: string;
    slug: string;
}

interface TagAssignmentProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tagId: number;
    initialPageId: number | null;
    tagName: string;
    onAssignmentComplete: () => void;
}

export const TagAssignment: React.FC<TagAssignmentProps> = ({
    isOpen,
    setIsOpen,
    tagId,
    initialPageId,
    tagName,
    onAssignmentComplete
}) => {
    const [pages, setPages] = useState<Page[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId ? String(initialPageId) : '');
    const [loading, setLoading] = useState(false);

    // Fetch all available pages for the dropdown
    useEffect(() => {
        const fetchPages = async () => {
            try {
                const res = await fetch('/api/pages');
                const data: Page[] = await res.json();
                setPages(data);
            } catch (error) {
                toast.error("Failed to load content pages.");
            }
        };
        if (isOpen) {
            fetchPages();
            setSelectedPageId(initialPageId ? String(initialPageId) : '');
        }
    }, [isOpen, initialPageId]);

    const handleAssign = async () => {
        if (!selectedPageId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/nfc-tags/${tagId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: parseInt(selectedPageId, 10) }),
            });

            if (res.ok) {
                toast.success(`Page assigned to "${tagName}".`, {
                    description: `Tag ID ${tagId} now links to ${pages.find(p => p.id === parseInt(selectedPageId))?.name}.`
                });
                onAssignmentComplete(); // Refresh parent list
                setIsOpen(false);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to assign page.");
            }
        } catch (error) {
            toast.error("Assignment Failed", { description: error instanceof Error ? error.message : "An unknown error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Content to Tag: {tagName}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-gray-500">
                        Select the content page this permanent link (`/t/{tagId}`) should display.
                    </p>
                    <Select value={selectedPageId} onValueChange={setSelectedPageId} disabled={loading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a Page" />
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
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAssign} disabled={!selectedPageId || loading}>
                        {loading ? 'Saving...' : 'Assign Page'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};