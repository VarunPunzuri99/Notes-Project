import Link from 'next/link';
import { StickyNote } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';

export function Header({ user }: { user: any }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5">
      <div className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <StickyNote className="h-6 w-6" />
          <span className="text-lg font-semibold">Notes</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}