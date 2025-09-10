"use client"

import { useState, useEffect } from "react"
import {
  Check,
  X,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

export default function CadastroEscolaTecnica() {
  const [cnpj, setCnpj] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [nomeFantasia, setNomeFantasia] = useState("")
  const [inscricaoEstadual, setInscricaoEstadual] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [site, setSite] = useState("")
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [uf, setUf] = useState("")

  const [loading, setLoading] = useState(false)
  const [cnpjLoading, setCnpjLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [mensagemStatus, setMensagemStatus] = useState("")
  const [statusType, setStatusType] = useState("")

  // ====== Funções de máscara ======
  const maskCNPJ = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14)
    let masked = numbers
    if (numbers.length > 2) masked = numbers.replace(/^(\d{2})(\d)/, "$1.$2")
    if (numbers.length > 5) masked = masked.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    if (numbers.length > 8) masked = masked.replace(/\.(\d{3})(\d)/, ".$1/$2")
    if (numbers.length > 12) masked = masked.replace(/(\d{4})(\d)/, "$1-$2")
    return masked
  }

  const maskTelefone = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11)
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
    }
    return numbers.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
  }

  const maskCEP = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 8)
    return numbers.replace(/^(\d{5})(\d)/, "$1-$2")
  }

  // ====== Validação CNPJ ======
  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "")
    if (cnpjLimpo.length !== 14) return false
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false

    let tamanho = cnpjLimpo.length - 2
    let numeros = cnpjLimpo.substring(0, tamanho)
    const digitos = cnpjLimpo.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--
      if (pos < 2) pos = 9
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== Number(digitos.charAt(0))) return false

    tamanho += 1
    numeros = cnpjLimpo.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--
      if (pos < 2) pos = 9
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    return resultado === Number(digitos.charAt(1))
  }

  const validateFields = () => {
    const newErrors = {}
    if (!cnpj || !validarCNPJ(cnpj)) newErrors.cnpj = "CNPJ inválido"
    if (!razaoSocial.trim()) newErrors.razaoSocial = "Razão Social é obrigatória"
    if (!endereco.trim()) newErrors.endereco = "Endereço é obrigatório"
    if (!telefone || telefone.replace(/\D/g, "").length < 10)
      newErrors.telefone = "Telefone deve ter pelo menos 10 dígitos"
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email inválido"
    if (!cep || cep.replace(/\D/g, "").length !== 8) newErrors.cep = "CEP deve ter 8 dígitos"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ====== Busca automática CNPJ ======
  useEffect(() => {
    const cnpjLimpo = cnpj.replace(/\D/g, "")
    if (cnpjLimpo.length !== 14) return
    const timeout = setTimeout(() => buscarCNPJ(cnpjLimpo), 500)
    return () => clearTimeout(timeout)
  }, [cnpj])

  const buscarCNPJ = async (sanitizedCNPJ) => {
    setCnpjLoading(true)
    setMensagemStatus("")
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${sanitizedCNPJ}`)
      if (!response.ok) throw new Error("CNPJ não encontrado")
      const data = await response.json()
      if (!razaoSocial) setRazaoSocial(data.razao_social || "")
      if (!nomeFantasia) setNomeFantasia(data.nome_fantasia || "")
      if (!inscricaoEstadual) setInscricaoEstadual(data.inscricao_estadual || "")
      if (!email) setEmail(data.email || "")
      if (!site) setSite(data.site || "")
      if (!telefone && data.ddd_telefone_1 && data.telefone_1)
        setTelefone(data.ddd_telefone_1 + data.telefone_1)
      if (!endereco) setEndereco(data.logradouro || "")
      if (!numero) setNumero(data.numero || "")
      if (!complemento) setComplemento(data.complemento || "")
      if (!bairro) setBairro(data.bairro || "")
      if (!cidade) setCidade(data.municipio || "")
      if (!uf) setUf(data.uf || "")
      if (!cep) setCep(data.cep || "")
      setMensagemStatus("Dados preenchidos automaticamente via BrasilAPI")
      setStatusType("success")
    } catch (err) {
      console.error(err)
      setMensagemStatus("CNPJ não encontrado ou inválido")
      setStatusType("error")
    } finally {
      setCnpjLoading(false)
    }
  }

  // ====== Busca automática CEP ======
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, "")
    if (cepLimpo.length !== 8) return
    const timeout = setTimeout(() => buscarCEP(cepLimpo), 500)
    return () => clearTimeout(timeout)
  }, [cep])

  const buscarCEP = async (sanitizedCEP) => {
    setCepLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${sanitizedCEP}/json/`)
      if (!response.ok) throw new Error("CEP não encontrado")
      const data = await response.json()
      if (data.erro) throw new Error("CEP não encontrado")
      if (!endereco) setEndereco(data.logradouro || "")
      if (!bairro) setBairro(data.bairro || "")
      if (!cidade) setCidade(data.localidade || "")
      if (!uf) setUf(data.uf || "")
    } catch (err) {
      console.error(err)
    } finally {
      setCepLoading(false)
    }
  }

  const limparFormulario = () => {
    setCnpj("")
    setRazaoSocial("")
    setNomeFantasia("")
    setInscricaoEstadual("")
    setEmail("")
    setSite("")
    setTelefone("")
    setCep("")
    setEndereco("")
    setNumero("")
    setComplemento("")
    setBairro("")
    setCidade("")
    setUf("")
    setErrors({})
    setMensagemStatus("")
    setStatusType("")
  }

  const salvarEscola = (e) => {
    e.preventDefault()
    if (!validateFields()) {
      setMensagemStatus("Por favor, corrija os erros no formulário")
      setStatusType("error")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setMensagemStatus("Cadastro realizado com sucesso!")
      setStatusType("success")
    }, 1500)
  }

  const InputField = ({ icon: Icon, label, error, loading, value, onChange, ...props }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? <Loader2 className="h-4 w-4 text-gray-400 animate-spin" /> : <Icon className="h-4 w-4 text-gray-400" />}
        </div>
        <input
          {...props}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-500"
              : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
          } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )

  const StatusMessage = ({ message, type }) => {
    if (!message) return null
    const styles = { success: "bg-green-50 border-green-200 text-green-800", error: "bg-red-50 border-red-200 text-red-800", info: "bg-blue-50 border-blue-200 text-blue-800" }
    const icons = { success: CheckCircle2, error: AlertCircle, info: AlertCircle }
    const Icon = icons[type] || AlertCircle
    return (
      <div className={`p-4 rounded-xl border-2 ${styles[type]} flex items-center gap-2`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    )
  }

  // ====== Render ======
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Escola Técnica</h1>
          <p className="text-gray-600 max-w-md mx-auto">Preencha os dados da instituição. Digite o CNPJ ou CEP para preenchimento automático dos campos.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <form onSubmit={salvarEscola} className="space-y-8">
            {/* Dados da empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={FileText}
                label="CNPJ *"
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj}
                loading={cnpjLoading}
              />
              <InputField
                icon={Building2}
                label="Razão Social *"
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Nome oficial da empresa"
                error={errors.razaoSocial}
              />
              <InputField
                icon={Building2}
                label="Nome Fantasia"
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Nome comercial"
              />
              <InputField
                icon={FileText}
                label="Inscrição Estadual"
                type="text"
                value={inscricaoEstadual}
                onChange={(e) => setInscricaoEstadual(e.target.value)}
                placeholder="Número da inscrição estadual"
              />
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={Mail}
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@escola.com.br"
                error={errors.email}
              />
              <InputField
                icon={Phone}
                label="Telefone *"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
                error={errors.telefone}
              />
              <InputField
                icon={Globe}
                label="Site"
                type="url"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="https://www.escola.com.br"
              />
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                icon={MapPin}
                label="CEP *"
                type="text"
                value={cep}
                onChange={(e) => setCep(maskCEP(e.target.value))}
                placeholder="00000-000"
                error={errors.cep}
                loading={cepLoading}
              />
              <InputField
                icon={MapPin}
                label="Endereço *"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Avenida, etc."
                error={errors.endereco}
              />
              <InputField
                icon={MapPin}
                label="Número"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="123"
              />
              <InputField
                icon={MapPin}
                label="Complemento"
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Sala, Andar, etc."
              />
              <InputField
                icon={MapPin}
                label="Bairro"
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Nome do bairro"
              />
              <InputField
                icon={MapPin}
                label="Cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Nome da cidade"
              />
              <InputField
                icon={MapPin}
                label="UF"
                type="text"
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength={2}
              />
            </div>

            <StatusMessage message={mensagemStatus} type={statusType} />

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Salvar Cadastro
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={limparFormulario}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              >
                <X className="w-5 h-5" /> Limpar Formulário
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">* Campos obrigatórios</p>
          </form>
        </div>
      </div>
    </div>
  )
}
