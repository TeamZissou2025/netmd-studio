import { type ReactNode, createContext, useContext, useState } from 'react';

interface TabsContextValue { activeTab: string; setActiveTab: (tab: string) => void; }
const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps { defaultValue: string; children: ReactNode; className?: string; }

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-1 pb-px ${className}`} style={{ borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!;
  const active = ctx.activeTab === value;
  return (
    <button
      onClick={() => ctx.setActiveTab(value)}
      className="px-3 py-1.5 text-nav font-medium transition-colors rounded-t-md cursor-pointer"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!;
  if (ctx.activeTab !== value) return null;
  return <div className="pt-4">{children}</div>;
}
