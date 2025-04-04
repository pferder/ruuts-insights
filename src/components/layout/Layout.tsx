import { Sidebar } from "./Sidebar";
import { PageContainer } from "./PageContainer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <PageContainer>{children}</PageContainer>
      <Toaster />
      <Sonner />
    </div>
  );
}
