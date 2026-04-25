import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout({ children }) {
const isMobile = useIsMobile();
const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
setCollapsed(isMobile);
}, [isMobile]);

return (
<div className="min-h-screen bg-background">
<Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

{isMobile && !collapsed && (
<div
onClick={() => setCollapsed(true)}
className="fixed inset-0 bg-black/40 z-30"
/>
)}

<main
className={`min-h-screen transition-all duration-300 ${
isMobile ? 'ml-0 pt-16' : collapsed ? 'ml-[68px]' : 'ml-[240px]'
}`}
>
<div className="p-4 md:p-6">{children}</div>
</main>
</div>
);
}