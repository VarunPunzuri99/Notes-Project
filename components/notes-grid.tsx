"use client";

import { useEffect, useState } from "react";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/note-card";
import { NoteDialog } from "@/components/note-dialog";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Note = Database["public"]["Tables"]["notes"]["Row"];

export function NotesGrid({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotes();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('notes_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notes'
        }, () => {
          fetchNotes();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[200px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <>
        <EmptyState
          message="You don't have any notes yet"
          buttonText="Create your first note"
          onClick={() => setShowCreateDialog(true)}
        />
        <NoteDialog
          mode="create"
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSaved={fetchNotes}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <CirclePlus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onUpdated={fetchNotes} />
        ))}
      </div>
      <NoteDialog
        mode="create"
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSaved={fetchNotes}
      />
    </>
  );
}