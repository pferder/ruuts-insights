
import React from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-0.5 mb-8">
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
      <Separator className="mt-4" />
    </div>
  );
};
