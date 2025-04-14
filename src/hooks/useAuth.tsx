
import { useState, useEffect, createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(async () => {
            await fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            // Add any other user metadata fields you want to store
          },
        },
      });

      if (error) throw error;

      // After signup, update the profile with additional fields
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            user_type: userData.userType,
            company_name: userData.companyName,
            farm_count: userData.farmCount ? parseInt(userData.farmCount) : null,
            location: userData.location,
            phone_number: userData.phoneNumber,
          })
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }

      toast({
        title: "Registro exitoso",
        description: "¡Bienvenido a Ruuts! Tu cuenta ha sido creada.",
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      
      let errorMessage = "Error en el registro. Por favor intenta nuevamente.";
      if (error.message) {
        if (error.message.includes("already") || error.message.includes("registered")) {
          errorMessage = "Este correo electrónico ya está registrado.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de nuevo a Ruuts!",
      });
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      let errorMessage = "Error en el inicio de sesión. Por favor intenta nuevamente.";
      if (error.message) {
        if (error.message.includes("Invalid") || error.message.includes("credentials")) {
          errorMessage = "Correo electrónico o contraseña incorrectos.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      
      toast({
        title: "Error",
        description: "Error al cerrar sesión. Por favor intenta nuevamente.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      
      toast({
        title: "Error",
        description: "Error al actualizar el perfil. Por favor intenta nuevamente.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
