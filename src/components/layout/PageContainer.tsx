import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("w-full flex-1 min-h-screen p-3 md:p-6 lg:p-8 transition-all duration-300", "mt-16 md:mt-0 md:ml-64", className)}>
      <div className="max-w-[1600px] mx-auto">{children}</div>
    </div>
  );
}
