"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/client";

type Note = Database["public"]["Tables"]["notes"]["Row"];
type NewNote = Database["public"]["Tables"]["notes"]["Insert"];

interface NoteDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note;
  onSaved: () => void;
}

export function NoteDialog({ 
  mode, 
  open, 
  onOpenChange, 
  note, 
  onSaved 
}: NoteDialogProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    if (mode === "create") {
      setTitle("");
      setContent("");
    } else {
      setTitle(note?.title || "");
      setContent(note?.content || "");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        throw new Error("User not authenticated");
      }

      if (mode === "create") {
        const newNote: NewNote = {
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
        };

        const { error } = await supabase.from("notes").insert(newNote);

        if (error) {
          throw error;
        }

        toast({
          title: "Note created",
          description: "Your note has been created successfully",
        });
      } else if (note) {
        const { error } = await supabase
          .from("notes")
          .update({
            title: title.trim(),
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", note.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Note updated",
          description: "Your note has been updated successfully",
        });
      }

      onSaved();
      handleOpenChange(false);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create" : "Edit"} Note</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new note to your collection."
              : "Make changes to your note here."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your note content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none focus-visible:ring-primary"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}