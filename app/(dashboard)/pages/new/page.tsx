'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PageComponent {
  id: string;
  name: string;
  content: string;
}
// Placeholder for available components
const availableComponents = [
  { id: 'hero', name: 'Hero Section' },
  { id: 'image-grid', name: 'Image Grid' },
  { id: 'slider', name: 'Slider' },
  { id: 'text-block', name: 'Text Block' },
];

export default function NewPageForm() {
  const [pageName, setPageName] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<PageComponent[]>([]);
  const router = useRouter();

  const handleAddComponent = (componentId: string) => {
    const component = availableComponents.find(comp => comp.id === componentId);
    if (component) {
      setSelectedComponents([...selectedComponents, { ...component, content: '' }]);
    }
  };

  const handleSavePage = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // Here, you would send the pageName and selectedComponents data to your backend API
    console.log('Page Data to Save:', { pageName, components: selectedComponents });

    // After saving, redirect the user back to the pages list
    router.push('/pages');
  };

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-3xl font-bold">Create New Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
          <CardDescription>
            Give your page a name and add components to build it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSavePage} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                type="text"
                placeholder="e.g., Product Details Page"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Add Components</Label>
              <div className="flex items-center gap-2">
                <Select onValueChange={handleAddComponent}>
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
            </div>

            {selectedComponents.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                {selectedComponents.map((comp, index) => (
                  <Card key={index} className="bg-slate-50 dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>{comp.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor={`content-${index}`}>Content</Label>
                      <Textarea
                        id={`content-${index}`}
                        placeholder={`Enter content for the ${comp.name.toLowerCase()}...`}
                        className="mt-2"
                        value={comp.content}
                        onChange={(e) => {
                          const newComps = [...selectedComponents];
                          newComps[index].content = e.target.value;
                          setSelectedComponents(newComps);
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit">Save Page</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}