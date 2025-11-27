// app/(dashboard)/nfc-tags/page.tsx
"use client";

import { DataTable } from "@/components/custom/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Scan, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TagAssignment } from "./TagAssignment";

declare global {
  interface NDEFReader {
    scan(): Promise<void>;
    write(
      message: NDEFMessageSource,
      options?: NDEFWriteOptions
    ): Promise<void>;
    onreading: ((this: NDEFReader, event: NDEFReadingEvent) => void) | null;
  }

  type NDEFMessageSource = { records: { recordType: string; data: string }[] };

  // ✅ Use a type alias instead of an empty interface
  type NDEFWriteOptions = object;
  // or: type NDEFWriteOptions = unknown;

  // ✅ This one is not empty, so no disable comment needed
  interface NDEFReadingEvent {
    serialNumber?: string;
  }

  interface Window {
    NDEFReader: {
      new (): NDEFReader;
      prototype: NDEFReader;
    };
  }
}

// Define the type for the data fetched from your API
interface NfcTag {
  id: number;
  name: string;
  tagId: string | null;
  pageId: number | null;
  assignedPage?: { name: string; slug: string };
  createdAt: string;
}

// Define the props interface for the cell render function
interface CellRenderProps {
  row: { original: NfcTag };
}

export default function NfcTagsPage() {
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [currentTagToRegister, setCurrentTagToRegister] =
    useState<NfcTag | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [currentTagToAssign, setCurrentTagToAssign] = useState<NfcTag | null>(
    null
  );

  const BASE_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const handleAssignClick = (tag: NfcTag) => {
    setCurrentTagToAssign(tag);
    setIsAssignOpen(true);
  };
  const handleDelete = async (tagId: number, tagName: string) => {
    try {
      const res = await fetch(`/api/nfc-tags/${tagId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Tag "${tagName}" deleted.`, {
          description: "The tag record was permanently removed.",
        });
        fetchTags(); // Refresh the list
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete tag.");
      }
    } catch (error) {
      toast.error("Deletion Failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nfc-tags");
      const data = await res.json();
      setTags(data);
    } catch {
      toast.error("Error fetching NFC tags.", {
        description: "Could not load tag data from the server.",
      });
    } finally {
      setLoading(false);
    }
  }; // --- CRUD Handlers ---

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const res = await fetch("/api/nfc-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName }),
      });

      if (res.ok) {
        toast.success(`Tag record "${newTagName}" created.`, {
          description: "Ready for card registration.",
        });
        setNewTagName("");
        setIsCreateOpen(false);
        fetchTags();
      } else {
        throw new Error("Failed to create tag record.");
      }
    } catch (error) {
      toast.error("Creation Failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  }; // --- WebNFC Registration Logic ---
  const isNFCSupported =
    typeof window !== "undefined" && "NDEFReader" in window;
  const startNFCRegistration = (tag: NfcTag) => {
    if (!isNFCSupported) {
      toast.warning("NFC Not Supported", {
        description: "Web NFC is not available in your browser or device.",
      });
      return;
    }

    setCurrentTagToRegister(tag);
    setIsRegisterOpen(true);
    checkAndWriteNFC(tag);
  };
  // 💡 FIX 2: checkAndWriteNFC is used in startNFCRegistration, so it must be defined.
  // The previous error was that checkAndWriteNFC was defined in the block below,
  // and was therefore not assigned to a variable, causing the "unused" warning
  // when a function with the same name was expected but not defined.
  // However, since it is used in startNFCRegistration, we leave it as a function
  // declaration/const assignment below.

  const checkAndWriteNFC = async (tag: NfcTag) => {
    const reader = new window.NDEFReader();
    const permanentUrl = `${BASE_URL}/t/${tag.id}`;

    try {
      toast.loading(`Awaiting NFC Tap for: ${tag.name}...`, { id: "nfc-reg" });
      await reader.scan();
      reader.onreading = async (event: NDEFReadingEvent) => {
        reader.onreading = null;

        const tagId = event.serialNumber || "NFC_UID_UNKNOWN_" + Date.now();
        const writer = new window.NDEFReader();

        await writer.write({
          records: [
            {
              recordType: "url",
              data: permanentUrl,
            },
          ],
        }); // 3. Update DB with the physical TagId
        await fetch(`/api/nfc-tags/${tag.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId: tagId }),
        });
        toast.dismiss("nfc-reg");
        toast.success(`Successfully registered tag "${tag.name}"!`, {
          description: `URL written: ${permanentUrl}. Physical ID saved: ${tagId.substring(
            0,
            10
          )}...`,
        });

        setIsRegisterOpen(false);
        fetchTags();
      };
    } catch {
      toast.dismiss("nfc-reg");
      toast.error("Registration Failed", {
        description:
          "Could not complete NFC operation. Ensure HTTPS and browser is in foreground.",
      });
      setIsRegisterOpen(false);
    }
  }; // Handler to open the registration modal
  const handleRegisterClick = (tag: NfcTag) => {
    setCurrentTagToRegister(tag);
    setIsRegisterOpen(true);
    startNFCRegistration(tag);
  };

  useEffect(() => {
    fetchTags();
  }, []); // 💡 FIX: Apply CellRenderProps interface to all column cell functions

  const columns = [
  {
    accessorKey: "name",
    id: "name",
    header: "Tag Name",
  },
  {
    accessorKey: "assignedPage.name",
    id: "pageName",
    header: "Assigned Page",
    cell: ({ row }: CellRenderProps) => (
      <span className="font-medium">
        {row.original.assignedPage?.name || "--- None Assigned ---"}
      </span>
    ),
  },
  {
    accessorKey: "tagId",
    id: "tagId",
    header: "Card ID",
    cell: ({ row }: CellRenderProps) => (
      <span
        className={`font-mono text-xs px-2 py-1 rounded-md ${
          row.original.tagId
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {row.original.tagId
          ? `Registered (${row.original.tagId.substring(0, 8)}...)`
          : "UNREGISTERED"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: CellRenderProps) => (
      <div className="flex flex-wrap gap-2">
        {!row.original.tagId ? (
          <Button size="sm" onClick={() => handleRegisterClick(row.original)}>
            <Scan className="h-4 w-4 mr-2" />
            Register Card
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAssignClick(row.original)}
          >
            Assign Page
          </Button>
        )}

        {/* Re-register/Update Card button (optional but useful) */}
        {row.original.tagId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleRegisterClick(row.original)}
          >
            <Scan className="h-4 w-4 mr-2" />
            Re-Register
          </Button>
        )}

        <AlertDialog>
          {/* CRITICAL FIX: Ensure NO space/newlines exist between <AlertDialogTrigger> and <Button> */}
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the NFC tag record:
                <strong>{row.original.name}</strong>. The physical card will no longer link to content.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleDelete(row.original.id, row.original.name)
                }
              >
                Yes, Delete Tag
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  },
];

  if (loading)
    return <div className="p-4 md:p-8 text-center">Loading NFC tags...</div>;

  return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl mb-4 md:mb-0">
                        <Tag className="h-6 w-6" />
                        <span>NFC Card Management</span>
                    </CardTitle>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-5 w-5 mr-2" /> Create New Tag Record
                    </Button>
                </CardHeader>
                <CardContent>
                    {tags.length > 0 ? (
                        <div className="overflow-x-auto">
                            <DataTable columns={columns} data={tags} filterColumn="name" />
                        </div>
                    ) : (
                        <div className="text-center p-10 border rounded-lg text-slate-500">
                            No NFC tag records created yet.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog for Creating a New Tag */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New NFC Tag Record</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label htmlFor="tagName">Tag Name (e.g., &apos;Front Desk Kiosk&apos;)</Label>
                        <Input 
                            id="tagName" 
                            value={newTagName} 
                            onChange={(e) => setNewTagName(e.target.value)} 
                            placeholder="Enter a descriptive name" 
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                            Create Tag Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog for Registering/Tapping the Card */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Register Physical Card: {currentTagToRegister?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                        <Scan className="h-16 w-16 text-blue-500 animate-pulse" />
                        <p className="text-lg font-medium">Tap your NFC card to the back of your phone now.</p>
                        <p className="text-sm text-gray-500">
                            **IMPORTANT:** We will **overwrite** any existing data on the card and write the permanent URL:
                            <br />
                            <strong className="text-blue-600 break-all">{BASE_URL}/t/{currentTagToRegister?.id}</strong>
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsRegisterOpen(false); 
                            toast.dismiss('nfc-reg'); // Dismiss loading toast
                        }}>
                            Cancel Registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {currentTagToAssign && (
                <TagAssignment
                    isOpen={isAssignOpen}
                    setIsOpen={setIsAssignOpen}
                    tagId={currentTagToAssign.id}
                    initialPageId={currentTagToAssign.pageId}
                    tagName={currentTagToAssign.name}
                    onAssignmentComplete={fetchTags}
                />
            )}
        </div>
    );
}