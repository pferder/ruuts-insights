import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"producer" | "company" | "">("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    farmCount: "",
    location: "",
    phoneNumber: "",
  });

  const handleTypeSelect = (value: "producer" | "company") => {
    setUserType(value);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: t("signup.successTitle", "Registro exitoso"),
      description: t("signup.successDescription", "¡Bienvenido a Ruuts! Tu cuenta ha sido creada."),
    });

    onOpenChange(false);
    navigate("/dashboard");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[520px] p-6 rounded-lg">
        {step === 1 ? (
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
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-semibold">
                {userType === "producer" ? t("signup.producerRegistration", "Registro de Productor") : t("signup.companyRegistration", "Registro de Empresa")}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {t("signup.registrationDescription", "Completa tu información para crear tu cuenta.")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium"
                >
                  {userType === "producer" ? t("signup.name", "Nombre y Apellido") : t("signup.contactName", "Nombre de contacto")}
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={userType === "producer" ? "Juan Pérez" : "María González"}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {userType === "company" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-sm font-medium"
                  >
                    {t("signup.companyName", "Razón Social")}
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Empresa S.A."
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required={userType === "company"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  {t("signup.email", "Correo electrónico")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium"
                >
                  {t("signup.phone", "Teléfono")}
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+54 9 11 1234 5678"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium"
                >
                  {t("signup.location", "Ubicación")}
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ciudad, Provincia"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="farmCount"
                  className="text-sm font-medium"
                >
                  {userType === "producer" ? t("signup.farmCount", "Establecimientos") : t("signup.supplierCount", "Proveedores")}
                </Label>
                <Input
                  id="farmCount"
                  name="farmCount"
                  type="number"
                  placeholder="1"
                  value={formData.farmCount}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="px-4"
              >
                {t("signup.back", "Volver")}
              </Button>
              <Button
                type="submit"
                className="bg-theme-green-primary hover:bg-theme-green-primary/90 px-5"
              >
                {t("signup.createAccount", "Crear cuenta")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
