
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
    phoneNumber: ""
  });

  const handleTypeSelect = (value: "producer" | "company") => {
    setUserType(value);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulamos el proceso de registro
    toast({
      title: t("signup.successTitle", "Registro exitoso"),
      description: t("signup.successDescription", "¡Bienvenido a Ruuts! Tu cuenta ha sido creada."),
    });
    
    // Cerramos el modal y redireccionamos al dashboard
    onOpenChange(false);
    navigate("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("signup.selectUserType", "¿Cómo te identificas?")}</DialogTitle>
              <DialogDescription>
                {t("signup.selectUserTypeDescription", "Selecciona el tipo de cuenta que deseas crear.")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-2"
                onClick={() => handleTypeSelect("producer")}
              >
                <span className="text-lg font-medium">{t("signup.producer", "Productor Agropecuario")}</span>
                <span className="text-sm text-muted-foreground text-center">
                  {t("signup.producerDescription", "Gestiono uno o más establecimientos agropecuarios")}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-2"
                onClick={() => handleTypeSelect("company")}
              >
                <span className="text-lg font-medium">{t("signup.company", "Empresa")}</span>
                <span className="text-sm text-muted-foreground text-center">
                  {t("signup.companyDescription", "Represento a una empresa en la cadena de suministros")}
                </span>
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {userType === "producer" 
                  ? t("signup.producerRegistration", "Registro de Productor") 
                  : t("signup.companyRegistration", "Registro de Empresa")}
              </DialogTitle>
              <DialogDescription>
                {t("signup.registrationDescription", "Completa la información para crear tu cuenta.")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {userType === "producer" 
                    ? t("signup.name", "Nombre y Apellido") 
                    : t("signup.contactName", "Nombre de contacto")}
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {userType === "company" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="companyName" className="text-right">
                    {t("signup.companyName", "Razón Social")}
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    className="col-span-3"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required={userType === "company"}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("signup.email", "Correo electrónico")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  {t("signup.phone", "Teléfono")}
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  className="col-span-3"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  {t("signup.location", "Ubicación")}
                </Label>
                <Input
                  id="location"
                  name="location"
                  className="col-span-3"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="farmCount" className="text-right">
                  {userType === "producer" 
                    ? t("signup.farmCount", "Cantidad de establecimientos") 
                    : t("signup.supplierCount", "Cantidad de proveedores")}
                </Label>
                <Input
                  id="farmCount"
                  name="farmCount"
                  type="number"
                  className="col-span-3"
                  value={formData.farmCount}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                {t("signup.back", "Volver")}
              </Button>
              <Button type="submit" className="bg-theme-green-primary hover:bg-farm-green-600">
                {t("signup.createAccount", "Crear cuenta")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
