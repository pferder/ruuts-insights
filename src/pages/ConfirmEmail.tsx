
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export default function ConfirmEmail() {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const params = new URLSearchParams(location.hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (type === "signup" && accessToken) {
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            throw error;
          }

          setVerificationSuccess(true);
          
          toast({
            title: t("auth.emailConfirmed", "Email confirmado con éxito"),
            description: t("auth.redirecting", "Serás redirigido al dashboard"),
          });
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else {
          setVerificationSuccess(false);
        }
      } catch (error) {
        console.error("Error during email confirmation:", error);
        setVerificationSuccess(false);
        toast({
          title: t("auth.verificationFailed", "Verificación fallida"),
          description: t("auth.verificationError", "No pudimos verificar tu email. Por favor, intenta nuevamente o contacta a soporte."),
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailConfirmation();
  }, [location, navigate, toast, t]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        {isVerifying ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-green-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2">{t("auth.verifying", "Verificando tu email...")}</h2>
            <p className="text-gray-500">{t("auth.pleaseWait", "Por favor espera mientras verificamos tu email.")}</p>
          </div>
        ) : verificationSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t("auth.emailConfirmed", "Email confirmado con éxito")}</h2>
            <p className="text-gray-500 mb-6">{t("auth.accountReady", "Tu cuenta está lista para usar.")}</p>
            <Button onClick={() => navigate("/dashboard")} className="bg-theme-green-primary hover:bg-theme-green-primary/90">
              {t("auth.goDashboard", "Ir al Dashboard")}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t("auth.verificationFailed", "Verificación fallida")}</h2>
            <p className="text-gray-500 mb-6">{t("auth.tryAgain", "Por favor, intenta nuevamente o contacta a soporte.")}</p>
            <div className="space-x-4">
              <Button onClick={() => navigate("/")} variant="outline">
                {t("auth.backToHome", "Volver al inicio")}
              </Button>
              <Button onClick={() => navigate("/#login")} className="bg-theme-green-primary hover:bg-theme-green-primary/90">
                {t("auth.tryLogin", "Iniciar sesión")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
