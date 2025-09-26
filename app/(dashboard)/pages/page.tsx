'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Page {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/pages');
        if (!response.ok) {
          throw new Error('Failed to fetch pages.');
        }
        const data: Page[] = await response.json();
        setPages(data);
      } catch (err) {
        setError('Could not fetch pages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Pages</h1>
        <Link href="/pages/new">
          <Button>+ Make Page</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Manage and edit all your dynamic web pages.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <p>Loading pages...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && pages.length === 0 && (
            <div className="text-center py-8">
              <p>No pages found. Create your first page!</p>
            </div>
          )}
          {!loading && !error && pages.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.name}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>{format(new Date(page.updatedAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/pages/${page.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}