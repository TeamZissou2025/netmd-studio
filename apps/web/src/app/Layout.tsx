import { Outlet } from 'react-router';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <TopNav />
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto" style={{ padding: '0 clamp(1.5rem, 1rem + 3vw, 5rem)' }}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <MobileNav />
      <span className="font-mono text-2xs text-studio-text-dim fixed bottom-2 right-2 z-50 opacity-60">v0.2.4-alpha · 2026-03-14 · 19:20</span>
    </div>
  );
}
