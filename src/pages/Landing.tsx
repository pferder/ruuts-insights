
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { SignUpModal } from "@/components/landing/SignUpModal";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  // Redirect on hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#signup") {
        setIsSignUpOpen(true);
      } else if (window.location.hash === "#login") {
        setIsLoginOpen(true);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    
    // Check if the initial URL has the hash
    if (window.location.hash === "#signup") {
      setIsSignUpOpen(true);
    } else if (window.location.hash === "#login") {
      setIsLoginOpen(true);
    }
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const switchToLogin = () => {
    setIsSignUpOpen(false);
    setTimeout(() => {
      setIsLoginOpen(true);
    }, 100);
  };

  const switchToSignup = () => {
    setIsLoginOpen(false);
    setTimeout(() => {
      setIsSignUpOpen(true);
    }, 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-green-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={() => setIsLoginOpen(true)} onSignUpClick={() => setIsSignUpOpen(true)} />
      <Hero />
      <Features />
      <About />
      <CTA />
      <Footer />
      <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} onRegisterClick={switchToSignup} />
    </div>
  );
}
