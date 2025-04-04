
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFarm } from "@/context/FarmContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export function Header({ title, subtitle, showSearch = false }: HeaderProps) {
  const { t } = useTranslation();
  const { searchFarms } = useFarm();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchFarms(searchQuery);
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-farm-green-800">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      
      {showSearch && (
        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.searchFarms')}
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="ml-2 bg-farm-green-700 hover:bg-farm-green-800">
            {t('common.search')}
          </Button>
        </form>
      )}
    </div>
  );
}
