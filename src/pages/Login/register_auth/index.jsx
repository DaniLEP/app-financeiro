import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, createUserWithEmailAndPassword, db } from "../../../../firebase";
import { ref, set } from "firebase/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegistroUser() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    funcao: "",
    senha: "",
    confirmSenha: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [step, setStep] = useState(1);
  const navigate = useNavigate(-1);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (senha) => senha.length >= 6;

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    switch (field) {
      case "nome":
        if (!value.trim()) errors.nome = "Nome é obrigatório";
        else if (value.length < 2) errors.nome = "Nome deve ter pelo menos 2 caracteres";
        else delete errors.nome;
        break;
      case "email":
        if (!value) errors.email = "E-mail é obrigatório";
        else if (!validateEmail(value)) errors.email = "E-mail inválido";
        else delete errors.email;
        break;
      case "senha":
        if (!value) errors.senha = "Senha é obrigatória";
        else if (!validatePassword(value)) errors.senha = "Senha deve ter pelo menos 6 caracteres";
        else delete errors.senha;
        break;
      case "confirmSenha":
        if (!value) errors.confirmSenha = "Confirmação de senha é obrigatória";
        else if (value !== formData.senha) errors.confirmSenha = "Senhas não coincidem";
        else delete errors.confirmSenha;
        break;
      case "funcao":
        if (!value) errors.funcao = "Função é obrigatória";
        else delete errors.funcao;
        break;
    }
    setValidationErrors(errors);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const canProceedToStep2 = () =>
    formData.nome &&
    formData.email &&
    validateEmail(formData.email) &&
    !validationErrors.nome &&
    !validationErrors.email;

  const canSubmit = () =>
    Object.keys(validationErrors).length === 0 &&
    formData.nome &&
    formData.email &&
    formData.funcao &&
    formData.senha &&
    formData.confirmSenha;

  const handleSubmit = async (e) => {
    e.preventDefault();
    Object.keys(formData).forEach((field) => validateField(field, formData[field]));

    if (!canSubmit()) {
      toast.warning("Por favor, corrija os erros no formulário.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );
      const newUser = userCredential.user;

      await set(ref(db, "usuarios/" + newUser.uid), {
        nome: formData.nome,
        email: formData.email,
        funcao: formData.funcao.toLowerCase(),
        uid: newUser.uid,
        ativo: true,
        online: false,
        criadoEm: Date.now(),
      });

      toast.success("Usuário criado com sucesso!");
      setTimeout(() => navigate("/admin/usuarios"), 2000);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está em uso.");
      } else {
        toast.error(`Erro: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // password strength helpers
  const passwordStrength = getPasswordStrength(formData.senha);
  const getStrengthText = (strength) => {
    if (strength < 25) return "Muito fraca";
    if (strength < 50) return "Fraca";
    if (strength < 75) return "Média";
    return "Forte";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Criar Nova Conta
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">Preencha os dados para criar um novo usuário no sistema</CardDescription>

            {/* Indicador de Progresso */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              <div className={`flex items-center space-x-2 ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200"}`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
                </div>
                <span className="text-sm font-medium">Dados Pessoais</span>
              </div>
              <div className={`w-12 h-0.5 ${step > 1 ? "bg-blue-600" : "bg-slate-200"}`} />
              <div className={`flex items-center space-x-2 ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200"}`}>2</div>
                <span className="text-sm font-medium">Segurança</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {/* Nome */}
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" /> Nome Completo
                      </Label>
                      <div className="relative">
                        <Input
                          id="nome"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange("nome", e.target.value)}
                          placeholder="Digite seu nome completo"
                          className={`pl-4 pr-10 h-12 ${
                            validationErrors.nome ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                          }`}
                        />
                        {formData.nome && !validationErrors.nome && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />}
                        {validationErrors.nome && <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />}
                      </div>
                      {validationErrors.nome && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.nome}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-mail
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Digite seu e-mail"
                          className={`pl-4 pr-10 h-12 ${
                            validationErrors.email ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                          }`}
                        />
                        {formData.email && !validationErrors.email && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />}
                        {validationErrors.email && <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />}
                      </div>
                      {validationErrors.email && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.email}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link to="/gestão-users">
                        <Button type="button" variant="outline" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 h-12">
                          Cancelar
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!canProceedToStep2()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 ml-5"
                      >
                        Próximo
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    {/* Função */}
                    <div className="space-y-2">
                      <Label htmlFor="funcao" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Função no Sistema
                      </Label>
                      <Select value={formData.funcao} onValueChange={(value) => handleInputChange("funcao", value)}>
                        <SelectTrigger className={`h-12 ${validationErrors.funcao ? "border-red-500" : "border-slate-300"}`}>
                          <SelectValue placeholder="Selecione sua função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Administrador</SelectItem>
                          <SelectItem value="Cozinha">Cozinha</SelectItem>
                          <SelectItem value="T.I">T.I</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.funcao && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.funcao}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          value={formData.senha}
                          onChange={(e) => handleInputChange("senha", e.target.value)}
                          placeholder="Digite uma senha segura"
                          className={`pl-4 pr-10 h-12 ${validationErrors.senha ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {formData.senha && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Força da senha:</span>
                            <span
                              className={`font-medium ${
                                passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"
                              }`}
                            >
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-2" />
                        </div>
                      )}

                      {validationErrors.senha && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.senha}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmSenha" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmSenha"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmSenha}
                          onChange={(e) => handleInputChange("confirmSenha", e.target.value)}
                          placeholder="Confirme sua senha"
                          className={`pl-4 pr-10 h-12 ${
                            validationErrors.confirmSenha ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {validationErrors.confirmSenha && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">{validationErrors.confirmSenha}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex justify-between gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 px-6 h-12"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                      </Button>

                      <div className="flex gap-3">
                      <Link to="/gestão-users">
                          <Button type="button" variant="outline" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 h-12">
                            Cancelar
                          </Button>
                        </Link>
                        <Button
                          type="submit"
                          disabled={!canSubmit() || isLoading}
                          className={`px-8 h-12 text-white rounded-full ${canSubmit() && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                              Criando...
                            </>
                          ) : (
                            "Finalizar"
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover />
    </div>
  )
}
