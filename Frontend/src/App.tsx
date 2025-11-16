import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FireDetectionProvider } from "@/contexts/FireDetectionContext";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/Bots";
import Logs from "./pages/Logs";
import Recordings from "./pages/Recordings";
import AdminLogs from "./pages/AdminLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FireDetectionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/admin-logs" element={<AdminLogs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FireDetectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
