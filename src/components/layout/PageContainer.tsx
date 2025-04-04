
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "ml-0 md:ml-64 min-h-screen p-4 md:p-8 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
