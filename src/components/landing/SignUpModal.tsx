
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  companyName: z.string().optional(),
  farmCount: z.string().optional(),
  location: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"producer" | "company" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      farmCount: "",
      location: "",
      phoneNumber: "",
    },
  });

  const handleTypeSelect = (value: "producer" | "company") => {
    setUserType(value);
    setStep(2);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, {
        name: values.name,
        userType,
        companyName: values.companyName,
        farmCount: values.farmCount,
        location: values.location,
        phoneNumber: values.phoneNumber,
      });
      
      setRegisteredEmail(values.email);
      setEmailSent(true);
      form.reset();
    } catch (error) {
      // Error is handled in the signUp function
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToLogin = () => {
    onOpenChange(false);
    setTimeout(() => {
      setShowLoginModal(true);
    }, 100);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setTimeout(() => {
      onOpenChange(true);
    }, 100);
  };

  const resetForm = () => {
    setEmailSent(false);
    setRegisteredEmail("");
    setStep(1);
    setUserType("");
    form.reset();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetForm();
          }
          onOpenChange(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-[520px] p-6 rounded-lg">
          {emailSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <DialogTitle className="text-2xl font-semibold mb-2">
                {t("signup.checkEmail", "Revisa tu correo")}
              </DialogTitle>
              <DialogDescription className="text-base mt-2 mb-4">
                {t("signup.verificationSent", "Hemos enviado un correo de verificación a")} <strong>{registeredEmail}</strong>. 
                {t("signup.verificationInstructions", "Por favor, sigue las instrucciones para completar tu registro.")}
              </DialogDescription>
              <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
                <AlertDescription>
                  {t("signup.emailNote", "Si no encuentras el correo, revisa tu carpeta de spam o solicita un nuevo enlace de verificación.")}
                </AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-4">
                <Button onClick={switchToLogin} variant="outline">
                  {t("signup.goToLogin", "Ir a iniciar sesión")}
                </Button>
                <Button onClick={resetForm} className="bg-theme-green-primary hover:bg-theme-green-primary/90">
                  {t("signup.registerAnotherAccount", "Registrar otra cuenta")}
                </Button>
              </div>
            </div>
          ) : step === 1 ? (
            <>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-semibold">{t("signup.selectUserType", "Ayúdanos a personalizar tu experiencia")}</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {t("signup.selectUserTypeDescription", "Selecciona el tipo de cuenta que deseas crear.")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <Button
                  variant="outline"
                  className="h-28 flex flex-col gap-2 p-4 hover:bg-gray-50 transition-colors border-green-500"
                  onClick={() => handleTypeSelect("producer")}
                >
                  <span className="text-base font-medium">{t("signup.producer", "Productor")}</span>
                  <span className="text-xs text-muted-foreground text-center px-1 text-wrap">{t("signup.producerDescription", "Gestiono campos agrícolas")}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-28 flex flex-col gap-2 p-4 hover:bg-gray-50 transition-colors border-green-500"
                  onClick={() => handleTypeSelect("company")}
                >
                  <span className="text-base font-medium">{t("signup.company", "Empresa")}</span>
                  <span className="text-xs text-muted-foreground text-center px-1 text-wrap">{t("signup.companyDescription", "Empresa proveedora")}</span>
                </Button>
              </div>

              <DialogFooter className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="text-sm">
                  {t("signup.haveAccount", "¿Ya tienes una cuenta?")}
                  {" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-theme-green-primary"
                    onClick={switchToLogin}
                  >
                    {t("signup.login", "Inicia sesión")}
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-semibold">
                    {userType === "producer" ? t("signup.producerRegistration", "Registro de Productor") : t("signup.companyRegistration", "Registro de Empresa")}
                  </DialogTitle>
                  <DialogDescription className="text-sm mt-1">
                    {t("signup.registrationDescription", "Completa tu información para crear tu cuenta.")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {userType === "producer" ? t("signup.name", "Nombre y Apellido") : t("signup.contactName", "Nombre de contacto")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={userType === "producer" ? "Juan Pérez" : "María González"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t("signup.email", "Correo electrónico")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t("signup.password", "Contraseña")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {userType === "company" && (
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            {t("signup.companyName", "Razón Social")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Empresa S.A."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t("signup.phone", "Teléfono")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+54 9 11 1234 5678"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t("signup.location", "Ubicación")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ciudad, Provincia"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="farmCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {userType === "producer" ? t("signup.farmCount", "Establecimientos") : t("signup.supplierCount", "Proveedores")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="px-4"
                    disabled={isSubmitting}
                  >
                    {t("signup.back", "Volver")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-theme-green-primary hover:bg-theme-green-primary/90 px-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {t("signup.creating", "Creando cuenta...")}
                      </>
                    ) : (
                      t("signup.createAccount", "Crear cuenta")
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal} 
        onRegisterClick={switchToSignup} 
      />
    </>
  );
}
