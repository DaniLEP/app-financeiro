"use client"

import { useState } from "react"
import { ref, set, get, query, orderByChild, equalTo } from "firebase/database"
import { db } from "../../../../firebase"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const CadastroJovem = () => {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    dadosJovem: {
      nome: "",
      cpf: "",
      rg: "",
      telefone: "",
      email: "",
      dataNascimento: "",
      idade: "",
      projeto: "",
      turma: "",
      endereco: { cep: "", rua: "", numero: "", complemento: "", cidade: "", estado: "" },
      observacoes: "",
    },
    dadosResponsavel: {
      nome: "",
      cpf: "",
      rg: "",
      telefone: "",
      email: "",
      endereco: { cep: "", rua: "", numero: "", complemento: "", cidade: "", estado: "" },
    },
    cursoTecnico: {
      nomeCurso: "",
      escolaTecnica: "",
      turno: "",
      anoInicio: "",
      anoConclusao: "",
      razaoSocial: "",
      nomeFantasia: "",
      tipoContrato: "",
      valorCurso: "",
      valorMensalidade: "",
      diaVencimento: "",
      valorDesconto: "",
    },
  })

  // Formatação CPF/RG
  const formatCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d+)/, "$1.$2")
    if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }
  const formatRG = (value) => value.replace(/\D/g, "").replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4")
  const cleanCPF = (cpf) => cpf.replace(/\D/g, "")

  // Notificação
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000)
  }

  // Alteração de campos
  const handleChange = (section, field, value, subField = null) => {
    setFormData((prev) => {
      const updated = { ...prev }
      if (subField) {
        if (!updated[section][field]) updated[section][field] = {}
        updated[section][field][subField] = value || ""
      } else {
        updated[section][field] = value || ""
      }
      return updated
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  // Busca CEP
  const handleCEPBlur = async (section, subField) => {
    const cep = formData[section][subField].cep.replace(/\D/g, "")
    if (cep.length !== 8) return
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      if (!res.data.erro) {
        handleChange(section, subField, res.data.logradouro, "rua")
        handleChange(section, subField, res.data.localidade, "cidade")
        handleChange(section, subField, res.data.uf, "estado")
      } else showNotification("CEP não encontrado", "error")
    } catch {
      showNotification("Erro ao consultar CEP", "error")
    }
  }

  // Cálculo idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return ""
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    const dia = hoje.getDate() - nascimento.getDate()
    if (mes < 0 || (mes === 0 && dia < 0)) idade--
    return idade
  }

  const calcularMeses = (dataNascimento) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12
    meses += hoje.getMonth() - nascimento.getMonth()
    if (hoje.getDate() < nascimento.getDate()) meses--
    return meses
  }

  const determinarProjeto = (dataNascimento) => {
    const meses = calcularMeses(dataNascimento)
    if (meses <= 18 * 12) return "CONDECA"
    return "INSTITUTO RECICLAR"
  }

  // Validação
  const validateStep = () => {
    const newErrors = {}
    if (step === 1) {
      const { dadosJovem, dadosResponsavel } = formData
      if (!dadosJovem.nome.trim()) newErrors.nome = "Nome é obrigatório"
      if (!dadosJovem.cpf.trim()) newErrors.cpf = "CPF é obrigatório"
      if (!dadosJovem.rg.trim()) newErrors.rg = "RG é obrigatório"
      if (!dadosJovem.email.trim()) newErrors.email = "Email é obrigatório"
      if (dadosJovem.email && !/\S+@\S+\.\S+/.test(dadosJovem.email)) newErrors.email = "Email inválido"

      if (!dadosResponsavel.nome.trim()) newErrors.nomeResponsavel = "Nome do responsável é obrigatório"
      if (!dadosResponsavel.cpf.trim()) newErrors.cpfResponsavel = "CPF do responsável é obrigatório"
    } else if (step === 2) {
      const { cursoTecnico } = formData
      if (!cursoTecnico.nomeCurso.trim()) newErrors.nomeCurso = "Nome do curso é obrigatório"
      if (!cursoTecnico.escolaTecnica.trim()) newErrors.escolaTecnica = "Escola técnica é obrigatória"
      if (cursoTecnico.tipoContrato === "pago") {
        if (!cursoTecnico.valorCurso) newErrors.valorCurso = "Valor do curso é obrigatório"
        if (!cursoTecnico.valorMensalidade) newErrors.valorMensalidade = "Valor da mensalidade é obrigatório"
        if (!cursoTecnico.diaVencimento) newErrors.diaVencimento = "Dia do vencimento é obrigatório"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return
    if (step < 2) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)
    try {
      const cpfJovem = cleanCPF(formData.dadosJovem.cpf)
      const cpfResponsavel = cleanCPF(formData.dadosResponsavel.cpf)
      const emailJovem = formData.dadosJovem.email.trim().toLowerCase()
      const emailResponsavel = formData.dadosResponsavel.email.trim().toLowerCase()

      const jovensRef = ref(db, "jovens")

      if ((await get(query(jovensRef, orderByChild("dadosJovem/cpf"), equalTo(cpfJovem)))).exists()) {
        showNotification("CPF do jovem já cadastrado!", "error")
        setIsLoading(false)
        return
      }
      if ((await get(query(jovensRef, orderByChild("dadosResponsavel/cpf"), equalTo(cpfResponsavel)))).exists()) {
        showNotification("CPF do responsável já cadastrado!", "error")
        setIsLoading(false)
        return
      }

      const newKey = Date.now()
      await set(ref(db, `jovens/${newKey}`), {
        ...formData,
        dadosJovem: { ...formData.dadosJovem, cpf: cpfJovem, email: emailJovem },
        dadosResponsavel: { ...formData.dadosResponsavel, cpf: cpfResponsavel, email: emailResponsavel },
        dataCadastro: new Date().toISOString(),
        status: "ativo",
      })

      showNotification("Cadastro realizado com sucesso!", "success")
      setFormData({
        dadosJovem: {
          nome: "",
          cpf: "",
          rg: "",
          telefone: "",
          turma: "",
          email: "",
          dataNascimento: "",
          idade: "",
          projeto: "",
          endereco: { cep: "", rua: "", numero: "", complemento: "", cidade: "", estado: "" },
          observacoes: "",
        },
        dadosResponsavel: {
          nome: "",
          cpf: "",
          rg: "",
          telefone: "",
          email: "",
          endereco: { cep: "", rua: "", numero: "", complemento: "", cidade: "", estado: "" },
        },
        cursoTecnico: {
          nomeCurso: "",
          escolaTecnica: "",
          turno: "",
          anoInicio: "",
          anoConclusao: "",
          razaoSocial: "",
          nomeFantasia: "",
          tipoContrato: "",
          valorCurso: "",
          valorMensalidade: "",
          diaVencimento: "",
          valorDesconto: "",
        },
      })
      setStep(1)
    } catch (error) {
      console.error(error)
      showNotification("Erro ao cadastrar", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        {notification.show && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-top-5 ${notification.type === "error" ? "bg-red-50 border border-red-200 text-red-900" : "bg-emerald-50 border border-emerald-200 text-emerald-900"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${notification.type === "error" ? "bg-red-100" : "bg-emerald-100"}`}
              >
                {notification.type === "error" ? (
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="font-medium text-sm">{notification.message}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white text-balance">Cadastro de Jovem</h1>
            <p className="text-blue-100 text-sm mt-1">Preencha os dados do jovem e responsável</p>
          </div>

          <div className="p-8">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-200 text-gray-500"}`}
                  >
                    1
                  </div>
                  <span
                    className={`font-semibold text-sm transition-colors duration-300 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
                  >
                    Jovem & Responsável
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-200 text-gray-500"}`}
                  >
                    2
                  </div>
                  <span
                    className={`font-semibold text-sm transition-colors duration-300 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
                  >
                    Curso Técnico
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out`}
                  style={{ width: step === 1 ? "50%" : "100%" }}
                ></div>
              </div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Dados do Jovem</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Input
                        placeholder="Nome completo"
                        value={formData.dadosJovem.nome}
                        onChange={(e) => handleChange("dadosJovem", "nome", e.target.value)}
                        className={`h-11 ${errors.nome ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.nome && <p className="text-xs text-red-600 font-medium">{errors.nome}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="CPF"
                        value={formData.dadosJovem.cpf}
                        onChange={(e) => handleChange("dadosJovem", "cpf", formatCPF(e.target.value))}
                        className={`h-11 ${errors.cpf ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.cpf && <p className="text-xs text-red-600 font-medium">{errors.cpf}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="RG"
                        value={formData.dadosJovem.rg}
                        onChange={(e) => handleChange("dadosJovem", "rg", formatRG(e.target.value))}
                        className={`h-11 ${errors.rg ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.rg && <p className="text-xs text-red-600 font-medium">{errors.rg}</p>}
                    </div>
                    <Input
                      placeholder="Telefone"
                      value={formData.dadosJovem.telefone}
                      onChange={(e) => handleChange("dadosJovem", "telefone", e.target.value)}
                      className="h-11"
                    />
                    <div className="space-y-1">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={formData.dadosJovem.email}
                        onChange={(e) => handleChange("dadosJovem", "email", e.target.value)}
                        className={`h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="turma"
                        placeholder="Digite a Turma do Jovem no Reciclar"
                        value={formData.dadosJovem.turma}
                        onChange={(e) => handleChange("dadosJovem", "turma", e.target.value)}
                        className={`h-11 ${errors.turma ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.turma && <p className="text-xs text-red-600 font-medium">{errors.turma}</p>}
                    </div>
                    <Input
                      type="date"
                      placeholder="Data de Nascimento"
                      value={formData.dadosJovem.dataNascimento}
                      onChange={(e) => {
                        const data = e.target.value
                        handleChange("dadosJovem", "dataNascimento", data)
                        handleChange("dadosJovem", "idade", calcularIdade(data))
                        handleChange("dadosJovem", "projeto", determinarProjeto(data))
                      }}
                      className="h-11"
                    />
                    <Input
                      placeholder="Idade"
                      value={formData.dadosJovem.idade}
                      readOnly
                      blocked
                      className="h-11 bg-gray-50 text-gray-600 cursor-not-allowed"
                    />

                    <Input
                      placeholder="Projeto"
                      value={formData.dadosJovem.projeto}
                      readOnly
                      className="h-11 bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Observações (opcional)"
                        value={formData.dadosJovem.observacoes}
                        onChange={(e) => handleChange("dadosJovem", "observacoes", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Dados do Responsável</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Input
                        placeholder="Nome completo"
                        value={formData.dadosResponsavel.nome}
                        onChange={(e) => handleChange("dadosResponsavel", "nome", e.target.value)}
                        className={`h-11 ${errors.nomeResponsavel ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.nomeResponsavel && (
                        <p className="text-xs text-red-600 font-medium">{errors.nomeResponsavel}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="CPF"
                        value={formData.dadosResponsavel.cpf}
                        onChange={(e) => handleChange("dadosResponsavel", "cpf", formatCPF(e.target.value))}
                        className={`h-11 ${errors.cpfResponsavel ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.cpfResponsavel && (
                        <p className="text-xs text-red-600 font-medium">{errors.cpfResponsavel}</p>
                      )}
                    </div>
                    <Input
                      placeholder="RG"
                      value={formData.dadosResponsavel.rg}
                      onChange={(e) => handleChange("dadosResponsavel", "rg", formatRG(e.target.value))}
                      className="h-11"
                    />
                    <Input
                      placeholder="Telefone"
                      value={formData.dadosResponsavel.telefone}
                      onChange={(e) => handleChange("dadosResponsavel", "telefone", e.target.value)}
                      className="h-11"
                    />
                    <div className="md:col-span-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={formData.dadosResponsavel.email}
                        onChange={(e) => handleChange("dadosResponsavel", "email", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Endereço do Jovem</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      placeholder="CEP"
                      value={formData.dadosJovem.endereco.cep}
                      onChange={(e) => handleChange("dadosJovem", "endereco", e.target.value, "cep")}
                      onBlur={() => handleCEPBlur("dadosJovem", "endereco")}
                      className="h-11"
                    />
                    <Input
                      placeholder="Rua"
                      value={formData.dadosJovem.endereco.rua}
                      onChange={(e) => handleChange("dadosJovem", "endereco", e.target.value, "rua")}
                      className="h-11"
                    />
                    <Input
                      placeholder="Número"
                      value={formData.dadosJovem.endereco.numero}
                      onChange={(e) => handleChange("dadosJovem", "endereco", e.target.value, "numero")}
                      className="h-11"
                    />
                    <Input
                      placeholder="Complemento (opcional)"
                      value={formData.dadosJovem.endereco.complemento}
                      onChange={(e) => handleChange("dadosJovem", "endereco", e.target.value, "complemento")}
                      className="h-11"
                    />
                    <Input
                      placeholder="Cidade"
                      value={formData.dadosJovem.endereco.cidade}
                      onChange={(e) => handleChange("dadosJovem", "endereco", e.target.value, "cidade")}
                      className="h-11"
                    />
                    <Input
                      placeholder="Estado"
                      value={formData.dadosJovem.endereco.estado}
                      onChange={(e) => handleChange("dadosJovem", "endereco", e.target.value, "estado")}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all duration-200 hover:shadow-xl hover:shadow-blue-300"
                  >
                    Próximo
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Dados do Curso Técnico</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Input
                        placeholder="Nome do Curso"
                        value={formData.cursoTecnico.nomeCurso}
                        onChange={(e) => handleChange("cursoTecnico", "nomeCurso", e.target.value)}
                        className={`h-11 ${errors.nomeCurso ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.nomeCurso && <p className="text-xs text-red-600 font-medium">{errors.nomeCurso}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Escola Técnica"
                        value={formData.cursoTecnico.escolaTecnica}
                        onChange={(e) => handleChange("cursoTecnico", "escolaTecnica", e.target.value)}
                        className={`h-11 ${errors.escolaTecnica ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.escolaTecnica && (
                        <p className="text-xs text-red-600 font-medium">{errors.escolaTecnica}</p>
                      )}
                    </div>
                    <Select
                      value={formData.cursoTecnico.tipoContrato}
                      onValueChange={(value) => {
                        handleChange("cursoTecnico", "tipoContrato", value)
                        if (value === "bolsa") {
                          handleChange("cursoTecnico", "valorCurso", "")
                          handleChange("cursoTecnico", "valorMensalidade", "")
                          handleChange("cursoTecnico", "diaVencimento", "")
                        }
                      }}
                    >
                      <SelectTrigger className="h-11">Selecione o tipo de contrato</SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bolsa">Bolsa</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Turno (opcional)"
                      value={formData.cursoTecnico.turno}
                      onChange={(e) => handleChange("cursoTecnico", "turno", e.target.value)}
                      className="h-11"
                    />
                    <div>
                      <label> Ano de Início</label>
                       <Input
                      type="date"
                      placeholder="Ano de Início"
                      value={formData.cursoTecnico.anoInicio}
                      onChange={(e) => handleChange("cursoTecnico", "anoInicio", e.target.value)}
                      className="h-11"
                    />
                    </div>
                   
                    <div>
                      <label htmlFor="">Ano de Conclusão</label>
                        <Input
                      type="date"
                      placeholder="Ano de Conclusão"
                      value={formData.cursoTecnico.anoConclusao}
                      onChange={(e) => handleChange("cursoTecnico", "anoConclusao", e.target.value)}
                      className="h-11"
                    />
                    </div>
                  
                    <Input
                      placeholder="Razão Social da Escola"
                      value={formData.cursoTecnico.razaoSocial}
                      onChange={(e) => handleChange("cursoTecnico", "razaoSocial", e.target.value)}
                      className="h-11"
                    />
                    <Input
                      placeholder="Nome Fantasia da Escola"
                      value={formData.cursoTecnico.nomeFantasia}
                      onChange={(e) => handleChange("cursoTecnico", "nomeFantasia", e.target.value)}
                      className="h-11"
                    />

                    {formData.cursoTecnico.tipoContrato === "pago" && (
                      <>
                        <div className="space-y-1 animate-in fade-in duration-300">
                          <Input
                            type="money"
                            placeholder="Valor do Curso"
                            value={formData.cursoTecnico.valorCurso}
                            onChange={(e) => handleChange("cursoTecnico", "valorCurso", e.target.value)}
                            className={`h-11 ${errors.valorCurso ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {errors.valorCurso && <p className="text-xs text-red-600 font-medium">{errors.valorCurso}</p>}
                        </div>
                        <div className="space-y-1 animate-in fade-in duration-300">
                          <Input
                            type="number"
                            placeholder="Valor da Mensalidade"
                            value={formData.cursoTecnico.valorMensalidade}
                            onChange={(e) => handleChange("cursoTecnico", "valorMensalidade", e.target.value)}
                            className={`h-11 ${errors.valorMensalidade ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {errors.valorMensalidade && (
                            <p className="text-xs text-red-600 font-medium">{errors.valorMensalidade}</p>
                          )}
                        </div>

                                                <div className="space-y-1 animate-in fade-in duration-300">
                          <Input
                            type="number"
                            placeholder="Valor do Desconto"
                            value={formData.cursoTecnico.valorDesconto}
                            onChange={(e) => handleChange("cursoTecnico", "valorDesconto", e.target.value)}
                            className={`h-11 ${errors.valorDesconto ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {errors.valorDesconto && (
                            <p className="text-xs text-red-600 font-medium">{errors.valorDesconto}</p>
                          )}
                        </div>
                        <div className="space-y-1 animate-in fade-in duration-300">
                          <label htmlFor="">Dia do Vencimento da parcela</label>
                          <Input
                            type="date"
                            placeholder="Dia do Vencimento"
                            value={formData.cursoTecnico.diaVencimento}
                            onChange={(e) => handleChange("cursoTecnico", "diaVencimento", e.target.value)}
                            className={`h-11 ${errors.diaVencimento ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {errors.diaVencimento && (
                            <p className="text-xs text-red-600 font-medium">{errors.diaVencimento}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-12 px-8 rounded-xl font-semibold transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Salvar Cadastro
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default CadastroJovem
