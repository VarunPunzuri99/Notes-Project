"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { NotesGrid } from "@/components/notes-grid";
import { EmptyState } from "@/components/empty-state";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="px-5 flex-1 py-8">
        {user ? (
          <NotesGrid userId={user.id} />
        ) : (
          <div className="mt-12">
            <EmptyState 
              message="Sign in to view and manage your notes"
              buttonText="Sign in"
              onClick={() => redirect('/auth')}
            />
          </div>
        )}
      </main>
      <footer className="border-t py-6  px-5">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Notes App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}