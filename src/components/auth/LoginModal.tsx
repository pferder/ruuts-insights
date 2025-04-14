
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick: () => void;
}

const formSchema = z.object({
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export function LoginModal({ open, onOpenChange, onRegisterClick }: LoginModalProps) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the signIn function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px] p-6 rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold">{t("login.title", "Iniciar sesión")}</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            {t("login.description", "Ingresa tus credenciales para acceder a tu cuenta.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.email", "Correo electrónico")}</FormLabel>
                  <FormControl>
                    <Input
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
                  <FormLabel>{t("login.password", "Contraseña")}</FormLabel>
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

            <DialogFooter className="flex flex-col pt-4 gap-3">
              <Button
                type="submit"
                className="w-full bg-theme-green-primary hover:bg-theme-green-primary/90 px-5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {t("login.loggingIn", "Iniciando sesión...")}
                  </>
                ) : (
                  t("login.login", "Iniciar sesión")
                )}
              </Button>
              
              <div className="text-center text-sm">
                {t("login.noAccount", "¿No tienes una cuenta?")}
                {" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-theme-green-primary"
                  onClick={onRegisterClick}
                >
                  {t("login.register", "Regístrate")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
