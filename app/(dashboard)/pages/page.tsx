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

// Placeholder data for demonstration
const pages = [
  { id: '1', name: 'Homepage', status: 'Published', lastUpdated: '2025-09-14' },
  { id: '2', name: 'Product Showcase', status: 'Draft', lastUpdated: '2025-09-12' },
  { id: '3', name: 'Gym Membership Info', status: 'Published', lastUpdated: '2025-09-10' },
];

export default function PagesPage() {
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
          <CardDescription>
            Manage and edit all your dynamic web pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.name}</TableCell>
                  <TableCell>{page.status}</TableCell>
                  <TableCell>{page.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/pages/${page.id}`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}