// app/t/[tagId]/page.tsx
import { notFound } from 'next/navigation';
import { TagContentRenderer } from './TagContentRenderer';

// Interface for API response data
interface NfcTagData {
    id: number;
    name: string;
    tagId: string;
    pageId: number;
    // Sequelize includes the Page data when fetching the Tag
    assignedPage: {
        id: number;
        name: string;
        slug: string;
        content: string; // The JSON content string
    } | null;
}

// Next.js dynamic server component function
export default async function TagPage({ params }: { params: { tagId: string } }) {
    const { tagId } = params;
if (!tagId || isNaN(Number(tagId))) {
        return notFound();
    }
    let tagData: NfcTagData | null = null;
    
    // Fetch Tag data from the API
    try {
                const apiUrl = process.env.NODE_ENV === 'development' 
            ? `http://localhost:3000/api/nfc-tags/${tagId}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/api/nfc-tags/${tagId}`; // Or another prod env var

        const res = await fetch(apiUrl, {
             // Cache settings for dynamic content
             next: { revalidate: 10 }
        });

        if (!res.ok) {
            console.error(`API response failed for tagId ${tagId}: ${res.status}`);
            return notFound(); 
        }



        tagData = await res.json();
    } catch (error) {
        console.error("Error fetching tag data:", error);
        return notFound();
    }

    // Check if a page is actually assigned
    if (!tagData || !tagData.assignedPage || !tagData.assignedPage.content) {
        // Render a default message or redirect to a landing page if no content is assigned
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Content Not Assigned</h1>
                <p className="text-lg text-gray-600">The tag **{tagData?.name || tagId}** has not yet been linked to a content page.</p>
                <p className="text-sm text-gray-500 mt-4">Please contact the CMS administrator.</p>
            </div>
        );
    }
    
    const pageContent = JSON.parse(tagData.assignedPage.content);
    const pageName = tagData.assignedPage.name;

    // Render the content using the client component
    return (
        <div className="tag-page-wrapper">
            {/* Optional: Set document title for SEO/UX */}
            <title>{pageName} - NFC Content</title>
            
            {/* This client component handles rendering the JSON components */}
            <TagContentRenderer content={pageContent} pageName={pageName} />
        </div>
    );
}