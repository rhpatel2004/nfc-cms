// app/t/[tagId]/page.tsx
import { notFound } from "next/navigation";
import { TagContentRenderer } from "./TagContentRenderer";

// Interface for API response data (Now confirmed to match the clean JSON)
interface NfcTagData {
  id: number;
  name: string;
  tagId: string;
  pageId: number;
  assignedPage: {
    id: number;
    name: string;
    slug: string;
    content: string; // The JSON content string
  } | null;
}

export default async function TagPage({
  params,
}: {
  params: { tagId: string };
}) {
  const { tagId } = params;
  
  if (!tagId || isNaN(Number(tagId))) {
      return notFound();
  }

  let tagData: NfcTagData | null = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/nfc-tags/${tagId}`;

    const res = await fetch(apiUrl, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      return notFound();
    }

    // Data is already clean JSON from the API (thanks to .toJSON())
    tagData = await res.json(); 
  } catch (error) {
    console.error("Error fetching tag data:", error);
    return notFound();
  }

  // --- Content Rendering Logic ---
  
  const assignedPage = tagData?.assignedPage;
  
  // 1. Check if a page is actually assigned
  if (!tagData || !assignedPage || !assignedPage.content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Content Not Assigned</h1>
        <p className="text-lg text-gray-600">The tag **{tagData?.name || tagId}** is not linked to a content page.</p>
        <p className="text-sm text-gray-500 mt-4">Please contact the CMS administrator.</p>
      </div>
    );
  }

  // 2. Parse the JSON string into a usable JavaScript object
  const pageContent = JSON.parse(assignedPage.content);
  console.log("full page content",pageContent)
  const pageName = assignedPage.name;

  return (
    <div className="tag-page-wrapper">
      {/* Ensures the title is a single string */}
      <title>{`${pageName} - NFC Content`}</title> 

      {/* Pass the parsed object to the client renderer */}
      <TagContentRenderer content={pageContent} pageName={pageName} />
    </div>
  );
}