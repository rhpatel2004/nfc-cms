'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Helper function to create a URL-friendly slug
const slugify = (str:any) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const availableComponents = [
  { id: 'hero-section', name: 'Hero Section' },
  { id: 'image-grid', name: 'Image Grid' },
  { id: 'slider', name: 'Slider' },
  { id: 'text-block', name: 'Text Block' },
];

interface PageComponent {
  id: string;
  name: string;
  type: string;
  data: any;
}

export default function NewPageForm() {
  const [pageName, setPageName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<PageComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });
  const router = useRouter();

  const handleAddComponent = (componentId:any) => {
    const component = availableComponents.find(comp => comp.id === componentId);
    if (component) {
      setSelectedComponents([...selectedComponents, {
        id: `comp-${Date.now()}`,
        name: component.name,
        type: component.id,
        data: { body: '' }
      }]);
    }
  };

  const handleUpdateComponentData = (index:any, data:any) => {
    const newComps = [...selectedComponents];
    newComps[index].data = { ...newComps[index].data, ...data };
    setSelectedComponents(newComps);
  };

  const handleSubmit = async (event:any) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ text: 'Saving page...', color: 'text-slate-500' });
    
    // Create the final JSON payload
    const pageData = {
      name: pageName,
      slug: slugify(pageName),
      content: JSON.stringify({ components: selectedComponents }),
    };

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Page saved successfully!', color: 'text-green-600' });
        setTimeout(() => router.push('/pages'), 2000);
      } else {
        setMessage({ text: data.message || 'Failed to save page.', color: 'text-red-600' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', color: 'text-red-600' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-3xl font-bold">Create New Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
          <CardDescription>Give your page a name and add components to build it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                type="text"
                placeholder="e.g., Product Details Page"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <Label>Add Components</Label>
              <Select onValueChange={handleAddComponent} disabled={loading}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a component" />
                </SelectTrigger>
                <SelectContent>
                  {availableComponents.map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedComponents.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                {selectedComponents.map((comp, index) => (
                  <Card key={comp.id} className="bg-slate-50 dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>{comp.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* For simplicity, we use a single text area for all component data */}
                      <Label htmlFor={`content-${index}`}>Content</Label>
                      <Textarea
                        id={`content-${index}`}
                        placeholder={`Enter content for the ${comp.name.toLowerCase()}...`}
                        className="mt-2"
                        value={comp.data.body}
                        onChange={(e) => handleUpdateComponentData(index, { body: e.target.value })}
                        disabled={loading}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Page'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {message.text && (
        <p className={`text-center mt-4 text-sm ${message.color}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}