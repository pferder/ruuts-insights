
import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { SignUpModal } from "@/components/landing/SignUpModal";

export default function Landing() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  
  // This function will be called when a link with href="#signup" is clicked
  const handleHashChange = () => {
    if (window.location.hash === "#signup") {
      setIsSignUpOpen(true);
    }
  };
  
  // Set up event listener for hash changes
  useState(() => {
    window.addEventListener("hashchange", handleHashChange);
    
    // Check if the initial URL has the #signup hash
    if (window.location.hash === "#signup") {
      setIsSignUpOpen(true);
    }
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <CTA />
      <Footer />
      <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </div>
  );
}
