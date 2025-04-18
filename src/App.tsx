
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { FarmProvider } from "@/context/FarmContext";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { useState } from "react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Farms from "./pages/Farms";
import FarmDetails from "./pages/FarmDetails";
import AddFarm from "./pages/AddFarm";
import Analytics from "./pages/Analytics";
import ExportData from "./pages/ExportData";
import NotFound from "./pages/NotFound";
import ConfirmEmail from "./pages/ConfirmEmail";

const App = () => {
  // Create QueryClient instance inside the component using useState hook
  const [queryClient] = useState(() => new QueryClient({
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
          <AuthProvider>
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
                  <Route path="/confirm-email" element={<ConfirmEmail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
            </FarmProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
