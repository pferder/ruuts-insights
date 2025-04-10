
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { FarmProvider } from "@/context/FarmContext";
import { ThemeProvider } from "@/components/theme/theme-provider";
import React from "react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Farms from "./pages/Farms";
import FarmDetails from "./pages/FarmDetails";
import AddFarm from "./pages/AddFarm";
import Analytics from "./pages/Analytics";
import ExportData from "./pages/ExportData";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create QueryClient instance inside the component
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="farm-theme">
          <FarmProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/farms" element={<Farms />} />
                <Route path="/farms/:id" element={<FarmDetails />} />
                <Route path="/add-farm" element={<AddFarm />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/export" element={<ExportData />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </FarmProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
