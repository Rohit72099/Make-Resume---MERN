import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateResumeForm from "./pages/CreateResumeForm";
import MyResumes from "./pages/MyResumes";
import ResumePreview from "./pages/ResumePreview";
import PublicResume from "./pages/PublicResume";
import NotFound from "./pages/NotFound";
import TipsExamples from "./pages/TipsExamples";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/create/form"
              element={
                <ProtectedRoute>
                  <CreateResumeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/my-resumes"
              element={
                <ProtectedRoute>
                  <MyResumes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/resume/:id/preview"
              element={
                <ProtectedRoute>
                  <ResumePreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/tips"
              element={
                <ProtectedRoute>
                  <TipsExamples />
                </ProtectedRoute>
              }
            />
            
            {/* Public Resume Route */}
            <Route path="/r/:slug" element={<PublicResume />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
