// app/(dashboard)/pages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/DataTable'; // Now correctly points to the new file
import PageEditor from './PageEditor'; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { toast } from 'sonner'; // ✨ UPDATED: Using Sonner's direct toast function

// Define the type for the data fetched from your API
interface Page {
    id: number;
    name: string;
    slug: string;
    content: string; // Stored JSON string
    createdAt: string;
}

export default function PagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pages');
            const data = await res.json();
            setPages(data);
        } catch (error) {
            toast.error("Could not load page data from the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (pageId: number, pageName: string) => {
        try {
            const res = await fetch(`/api/pages/${pageId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success(`Page "${pageName}" deleted successfully.`);
                fetchPages(); // Refresh the list
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to delete page.");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unknown error occurred during deletion.");
        }
    };

    const handleSave = (success: boolean) => {
        setIsEditorOpen(false);
        setEditingPage(null);
        if (success) {
            fetchPages();
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const columns = [
        {
            accessorKey: 'name',
            id: 'name',
            header: 'Page Name',
        },
        {
            accessorKey: 'slug',
            id: 'slug',
            header: 'Slug',
            cell: ({ row }: any) => <span className="font-mono text-sm text-blue-600">{`/p/${row.original.slug}`}</span>
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt', 
            header: 'Created On',
            cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        setEditingPage(row.original);
                        setIsEditorOpen(true);
                    }}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the page: <strong>{row.original.name}</strong>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(row.original.id, row.original.name)}>
                                    Yes, delete page
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ];

    if (loading) return <div className="p-8 text-center">Loading pages...</div>;

    return (
        <div className="p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                        <FileText className="h-6 w-6" />
                        <span>Content Pages</span>
                    </CardTitle>
                    <Button onClick={() => { setEditingPage(null); setIsEditorOpen(true); }}>
                        <Plus className="h-5 w-5 mr-2" /> Create New Page
                    </Button>
                </CardHeader>
                <CardContent>
                    {pages.length > 0 ? (
                        <DataTable columns={columns} data={pages} filterColumn="name" />
                    ) : (
                        <div className="text-center p-10 border rounded-lg text-slate-500">
                            No pages created yet. Click "Create New Page" to start.
                        </div>
                    )}
                </CardContent>
            </Card>

            <PageEditor
                isOpen={isEditorOpen}
                setIsOpen={setIsEditorOpen}
                initialPage={editingPage}
                onSave={handleSave}
            />
        </div>
    );
}