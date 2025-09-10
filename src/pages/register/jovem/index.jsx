import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebase"; // importando seu db já configurado
import * as XLSX from "xlsx";

const CadastroJovem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nomeJovem: "",
    cpfJovem: "",
    telefoneJovem: "",
    emailJovem: "",
    enderecoJovem: "",
    cepJovem: "",
    cidadeJovem: "",
    estadoJovem: "",
    nomeResponsavel: "",
    cpfResponsavel: "",
    telefoneResponsavel: "",
    emailResponsavel: "",
    enderecoResponsavel: "",
    cepResponsavel: "",
    cidadeResponsavel: "",
    estadoResponsavel: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Auto-save draft
  useEffect(() => {
    const savedDraft = localStorage.getItem("cadastroJovemDraft");
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
      setIsDraftSaved(true);
      showNotification("Rascunho carregado", "info");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("cadastroJovemDraft", JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Formatações
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpfJovem" || name === "cpfResponsavel") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 11) formattedValue = formatCPF(numbers);
      else return;
    } else if (name === "cepJovem" || name === "cepResponsavel") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 8) formattedValue = formatCEP(numbers);
      else return;
    } else if (name === "telefoneJovem" || name === "telefoneResponsavel") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 11) formattedValue = numbers;
      else return;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validação por step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nomeJovem.trim()) newErrors.nomeJovem = "Nome é obrigatório";
      if (!formData.cpfJovem.trim()) newErrors.cpfJovem = "CPF é obrigatório";
      if (!formData.telefoneJovem.trim()) newErrors.telefoneJovem = "Telefone é obrigatório";
      if (!formData.emailJovem.trim()) newErrors.emailJovem = "Email é obrigatório";
      if (formData.emailJovem && !/\S+@\S+\.\S+/.test(formData.emailJovem))
        newErrors.emailJovem = "Email inválido";
    } else if (step === 2) {
      if (!formData.nomeResponsavel.trim()) newErrors.nomeResponsavel = "Nome do responsável é obrigatório";
      if (!formData.cpfResponsavel.trim()) newErrors.cpfResponsavel = "CPF do responsável é obrigatório";
      if (!formData.telefoneResponsavel.trim()) newErrors.telefoneResponsavel = "Telefone do responsável é obrigatório";
      if (!formData.emailResponsavel.trim()) newErrors.emailResponsavel = "Email do responsável é obrigatório";
      if (formData.emailResponsavel && !/\S+@\S+\.\S+/.test(formData.emailResponsavel))
        newErrors.emailResponsavel = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 3));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const cpfQuery = query(collection(db, "jovens"), where("cpfJovem", "==", formData.cpfJovem));
      const cpfSnapshot = await getDocs(cpfQuery);

      if (!cpfSnapshot.empty) {
        showNotification("CPF já cadastrado no sistema!", "error");
        setIsLoading(false);
        return;
      }

      await addDoc(collection(db, "jovens"), { ...formData, dataCadastro: new Date().toISOString(), status: "ativo" });

      showNotification("Cadastro realizado com sucesso!", "success");

      setFormData({
        nomeJovem: "",
        cpfJovem: "",
        telefoneJovem: "",
        emailJovem: "",
        enderecoJovem: "",
        cepJovem: "",
        cidadeJovem: "",
        estadoJovem: "",
        nomeResponsavel: "",
        cpfResponsavel: "",
        telefoneResponsavel: "",
        emailResponsavel: "",
        enderecoResponsavel: "",
        cepResponsavel: "",
        cidadeResponsavel: "",
        estadoResponsavel: "",
        observacoes: "",
      });
      localStorage.removeItem("cadastroJovemDraft");
      setCurrentStep(1);
      setIsDraftSaved(false);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      showNotification("Erro ao realizar cadastro. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const promises = data.map((row) =>
          addDoc(collection(db, "jovens"), {
            nomeJovem: row["Nome do Jovem"] || "",
            cpfJovem: row["CPF do Jovem"] || "",
            telefoneJovem: row["Telefone do Jovem"] || "",
            emailJovem: row["Email do Jovem"] || "",
            enderecoJovem: row["Endereço do Jovem"] || "",
            cepJovem: row["CEP do Jovem"] || "",
            cidadeJovem: row["Cidade do Jovem"] || "",
            estadoJovem: row["Estado do Jovem"] || "",
            nomeResponsavel: row["Nome do Responsável"] || "",
            cpfResponsavel: row["CPF do Responsável"] || "",
            telefoneResponsavel: row["Telefone do Responsável"] || "",
            emailResponsavel: row["Email do Responsável"] || "",
            enderecoResponsavel: row["Endereço do Responsável"] || "",
            cepResponsavel: row["CEP do Responsável"] || "",
            cidadeResponsavel: row["Cidade do Responsável"] || "",
            estadoResponsavel: row["Estado do Responsável"] || "",
            observacoes: row["Observações"] || "",
            dataCadastro: new Date().toISOString(),
            status: "ativo",
          })
        );

        await Promise.all(promises);
        showNotification(`${data.length} registros importados com sucesso!`, "success");
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        showNotification("Erro ao processar arquivo Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download template Excel
  const downloadTemplate = () => {
    const template = [
      {
        "Nome do Jovem": "",
        "CPF do Jovem": "",
        "Telefone do Jovem": "",
        "Email do Jovem": "",
        "Endereço do Jovem": "",
        "CEP do Jovem": "",
        "Cidade do Jovem": "",
        "Estado do Jovem": "",
        "Nome do Responsável": "",
        "CPF do Responsável": "",
        "Telefone do Responsável": "",
        "Email do Responsável": "",
        "Endereço do Responsável": "",
        "CEP do Responsável": "",
        "Cidade do Responsável": "",
        "Estado do Responsável": "",
        "Observações": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_cadastro_jovens.xlsx");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Dados do Jovem</h2>
              <p className="text-gray-600">Preencha as informações pessoais do jovem</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nomeJovem"
                  value={formData.nomeJovem}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.nomeJovem 
                      ? 'border-red-300 bg-red-50' 
                      : formData.nomeJovem 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="Digite o nome completo"
                />
                {errors.nomeJovem && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.nomeJovem}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpfJovem"
                  value={formData.cpfJovem}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.cpfJovem 
                      ? 'border-red-300 bg-red-50' 
                      : formData.cpfJovem 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="000.000.000-00"
                />
                {errors.cpfJovem && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.cpfJovem}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Telefone *
                </label>
                <input
                  type="text"
                  name="telefoneJovem"
                  value={formData.telefoneJovem}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.telefoneJovem 
                      ? 'border-red-300 bg-red-50' 
                      : formData.telefoneJovem 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="11999999999"
                />
                {errors.telefoneJovem && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.telefoneJovem}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="emailJovem"
                  value={formData.emailJovem}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.emailJovem 
                      ? 'border-red-300 bg-red-50' 
                      : formData.emailJovem 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="email@exemplo.com"
                />
                {errors.emailJovem && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.emailJovem}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  name="enderecoJovem"
                  value={formData.enderecoJovem}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  type="text"
                  name="cepJovem"
                  value={formData.cepJovem}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidadeJovem"
                  value={formData.cidadeJovem}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  name="estadoJovem"
                  value={formData.estadoJovem}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Dados do Responsável</h2>
              <p className="text-gray-600">Preencha as informações do responsável legal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nomeResponsavel"
                  value={formData.nomeResponsavel}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.nomeResponsavel 
                      ? 'border-red-300 bg-red-50' 
                      : formData.nomeResponsavel 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="Digite o nome completo"
                />
                {errors.nomeResponsavel && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.nomeResponsavel}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpfResponsavel"
                  value={formData.cpfResponsavel}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.cpfResponsavel 
                      ? 'border-red-300 bg-red-50' 
                      : formData.cpfResponsavel 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="000.000.000-00"
                />
                {errors.cpfResponsavel && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.cpfResponsavel}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Telefone *
                </label>
                <input
                  type="text"
                  name="telefoneResponsavel"
                  value={formData.telefoneResponsavel}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.telefoneResponsavel 
                      ? 'border-red-300 bg-red-50' 
                      : formData.telefoneResponsavel 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="11999999999"
                />
                {errors.telefoneResponsavel && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.telefoneResponsavel}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="emailResponsavel"
                  value={formData.emailResponsavel}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.emailResponsavel 
                      ? 'border-red-300 bg-red-50' 
                      : formData.emailResponsavel 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  placeholder="email@exemplo.com"
                />
                {errors.emailResponsavel && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.emailResponsavel}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  name="enderecoResponsavel"
                  value={formData.enderecoResponsavel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  type="text"
                  name="cepResponsavel"
                  value={formData.cepResponsavel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidadeResponsavel"
                  value={formData.cidadeResponsavel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  name="estadoResponsavel"
                  value={formData.estadoResponsavel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Revisão e Finalização</h2>
              <p className="text-gray-600">Confira os dados antes de finalizar o cadastro</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Dados do Jovem
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nome:</span> {formData.nomeJovem}</p>
                    <p><span className="font-medium">CPF:</span> {formData.cpfJovem}</p>
                    <p><span className="font-medium">Telefone:</span> {formData.telefoneJovem}</p>
                    <p><span className="font-medium">Email:</span> {formData.emailJovem}</p>
                    {formData.enderecoJovem && <p><span className="font-medium">Endereço:</span> {formData.enderecoJovem}</p>}
                    {formData.cidadeJovem && <p><span className="font-medium">Cidade:</span> {formData.cidadeJovem}/{formData.estadoJovem}</p>}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Dados do Responsável
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nome:</span> {formData.nomeResponsavel}</p>
                    <p><span className="font-medium">CPF:</span> {formData.cpfResponsavel}</p>
                    <p><span className="font-medium">Telefone:</span> {formData.telefoneResponsavel}</p>
                    <p><span className="font-medium">Email:</span> {formData.emailResponsavel}</p>
                    {formData.enderecoResponsavel && <p><span className="font-medium">Endereço:</span> {formData.enderecoResponsavel}</p>}
                    {formData.cidadeResponsavel && <p><span className="font-medium">Cidade:</span> {formData.cidadeResponsavel}/{formData.estadoResponsavel}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Observações Adicionais
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="Informações adicionais sobre o cadastro..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Cadastro de Jovens</h1>
          <p className="text-gray-600">Sistema de cadastro para programa jovem</p>
          {isDraftSaved && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <span>💾</span> Rascunho salvo automaticamente
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Importação em Lote</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadTemplate}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>📥</span> Baixar Template Excel
            </button>
            <div className="flex-1">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Progress */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="font-semibold text-gray-800 mb-6">Progresso do Cadastro</h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Dados do Jovem', icon: '👤' },
                  { step: 2, title: 'Dados do Responsável', icon: '👨‍👩‍👧‍👦' },
                  { step: 3, title: 'Revisão Final', icon: '✅' }
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      currentStep === item.step
                        ? 'bg-blue-100 text-blue-700 shadow-md'
                        : currentStep > item.step
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep === item.step
                        ? 'bg-blue-500 text-white'
                        : currentStep > item.step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > item.step ? '✓' : item.step}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs opacity-70">
                        {currentStep > item.step ? 'Concluído' : 
                         currentStep === item.step ? 'Em andamento' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips Section */}
              <div className="mt-8 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>💡</span> Dicas
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Campos com * são obrigatórios</li>
                  <li>• Dados são salvos automaticamente</li>
                  <li>• Use o template Excel para importação em lote</li>
                  <li>• Verifique os dados antes de finalizar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Etapa {currentStep} de 3
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round((currentStep / 3) * 100)}% concluído
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[600px]">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md transform hover:scale-105'
                  }`}
                >
                  <span>←</span> Anterior
                </button>

                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step === currentStep
                          ? 'bg-blue-500 scale-125'
                          : step < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    Próximo <span>→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <span>✓</span> Finalizar Cadastro
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroJovem;
