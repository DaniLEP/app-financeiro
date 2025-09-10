"use client"

import React, { useState, useEffect } from "react"
import { db } from "../../../../firebase"
import { ref, set, onValue } from "firebase/database"
import {
  BookOpen,
  School,
  Search,
  Check,
  X,
  ArrowLeft,
  Plus,
  GraduationCap,
  Building2,
  AlertCircle,
  MapPin,
  Phone,
  FileText,
} from "lucide-react"

export default function CadastroCursoTecnicoMelhorado() {
  const [nomeCurso, setNomeCurso] = useState("")
  const [escolaSelecionadaId, setEscolaSelecionadaId] = useState("")
  const [escolaSelecionada, setEscolaSelecionada] = useState(null)
  const [escolas, setEscolas] = useState({})
  const [modalAberto, setModalAberto] = useState(false)
  const [pesquisa, setPesquisa] = useState("")
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Carregar escolas do Firebase
  useEffect(() => {
    const escolasRef = ref(db, "cadastrodeescolatecnica")
    onValue(escolasRef, (snapshot) => {
      setEscolas(snapshot.val() || {})
    })
  }, [])

  // Validação em tempo real
  const validateField = (field, value) => {
    const errors = {}

    if (field === "nomeCurso") {
      if (!value.trim()) {
        errors.nomeCurso = "Nome do curso é obrigatório"
      } else if (value.trim().length < 3) {
        errors.nomeCurso = "Nome deve ter pelo menos 3 caracteres"
      } else if (value.trim().length > 100) {
        errors.nomeCurso = "Nome deve ter no máximo 100 caracteres"
      }
    }

    if (field === "escola") {
      if (!escolaSelecionadaId) {
        errors.escola = "Selecione uma escola técnica"
      }
    }

    return errors
  }

  const handleFieldChange = (field, value) => {
    if (field === "nomeCurso") {
      setNomeCurso(value)
    }

    if (touched[field]) {
      const fieldErrors = validateField(field, value)
      setValidationErrors((prev) => ({
        ...prev,
        ...fieldErrors,
        [field]: fieldErrors[field] || "",
      }))
    }
  }

  const handleFieldBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const fieldErrors = validateField(field, value)
    setValidationErrors((prev) => ({
      ...prev,
      ...fieldErrors,
    }))
  }

  // Selecionar escola do modal
  const selecionarEscola = (id) => {
    setEscolaSelecionadaId(id)
    setEscolaSelecionada(escolas[id])
    setModalAberto(false)
    setPesquisa("")
    if (touched.escola) {
      setValidationErrors((prev) => ({ ...prev, escola: "" }))
    }
  }

  const salvarCurso = async (e) => {
    e.preventDefault()

    setTouched({ nomeCurso: true, escola: true })

    const nomeErrors = validateField("nomeCurso", nomeCurso)
    const escolaErrors = validateField("escola", escolaSelecionadaId)
    const allErrors = { ...nomeErrors, ...escolaErrors }

    setValidationErrors(allErrors)

    if (Object.values(allErrors).some((error) => error)) {
      return
    }

    setLoading(true)
    setErro("")

    const cursoId = Date.now().toString()

    try {
      await set(ref(db, "cursosTecnicos/" + cursoId), {
        nomeCurso: nomeCurso.trim(),
        escolaId: escolaSelecionadaId,
        dataCadastro: new Date().toISOString(),
      })

      setSucesso(true)
      setNomeCurso("")
      setEscolaSelecionadaId("")
      setEscolaSelecionada(null)
      setTouched({})
      setValidationErrors({})

      setTimeout(() => setSucesso(false), 4000)
    } catch (error) {
      setErro("Erro ao cadastrar curso. Tente novamente.")
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  const escolasFiltradas = Object.entries(escolas).filter(
    ([id, escola]) =>
      escola.nomeFantasia?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      escola.endereco?.toLowerCase().includes(pesquisa.toLowerCase())
  )

  const isFormValid =
    nomeCurso.trim() &&
    escolaSelecionadaId &&
    !Object.values(validationErrors).some((error) => error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Cadastro de Curso Técnico</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Registre novos cursos técnicos no sistema de forma rápida e organizada
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
            {sucesso && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 mb-1">Curso cadastrado com sucesso!</p>
                    <p className="text-green-700 text-sm">
                      O curso <strong>{nomeCurso}</strong> foi adicionado ao sistema e já está disponível.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {erro && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Erro no cadastro</p>
                    <p className="text-red-700 text-sm">{erro}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={salvarCurso} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="nomeCurso" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Nome do Curso Técnico
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="nomeCurso"
                    type="text"
                    value={nomeCurso}
                    onChange={(e) => handleFieldChange("nomeCurso", e.target.value)}
                    onBlur={(e) => handleFieldBlur("nomeCurso", e.target.value)}
                    required
                    placeholder="Ex: Técnico em Informática"
                    className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      validationErrors.nomeCurso
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                    maxLength={100}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {nomeCurso.length}/100
                  </div>
                </div>
                {validationErrors.nomeCurso && (
                  <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.nomeCurso}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="escola" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <School className="w-4 h-4 text-indigo-600" />
                  Escola Técnica
                  <span className="text-red-500">*</span>
                </label>
                <button
                  id="escola"
                  type="button"
                  onClick={() => setModalAberto(true)}
                  onBlur={() => handleFieldBlur("escola", escolaSelecionadaId)}
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl cursor-pointer flex justify-between items-center text-left transition-all duration-200 hover:bg-gray-100 ${
                    validationErrors.escola
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                >
                  <span className={escolaSelecionada ? "text-gray-900" : "text-gray-500"}>
                    {escolaSelecionada ? escolaSelecionada.nomeFantasia : "Clique para selecionar uma escola"}
                  </span>
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>

                {validationErrors.escola && (
                  <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.escola}
                  </p>
                )}

                {escolaSelecionada && (
                  <div className="mt-4 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {escolaSelecionada.nomeFantasia?.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-2 flex-1">
                        <h4 className="font-semibold text-gray-900">{escolaSelecionada.nomeFantasia}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {escolaSelecionada.endereco}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {escolaSelecionada.telefone}
                          </p>
                          <p className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            CNPJ: {escolaSelecionada.cnpj}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Cadastrar Curso
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/home")}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-200 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}
        >
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <School className="w-6 h-6 text-indigo-600" />
                  Selecionar Escola
                </h3>
                <button
                  onClick={() => setModalAberto(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou endereço..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {escolasFiltradas.length > 0 ? (
                escolasFiltradas
                  .sort((a, b) => a[1].nomeFantasia?.localeCompare(b[1].nomeFantasia))
                  .map(([id, escola]) => (
                    <button
                      key={id}
                      onClick={() => selecionarEscola(id)}
                      className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl flex items-start gap-3 transition-colors duration-200 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {escola.nomeFantasia?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-1 truncate">{escola.nomeFantasia}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" />
                          {escola.endereco}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {escola.telefone}
                        </p>
                      </div>
                    </button>
                  ))
              ) : (
                <div className="text-center py-12">
                  <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Nenhuma escola encontrada</p>
                  <p className="text-gray-400 text-sm">{pesquisa ? "Tente ajustar sua pesquisa" : "Não há escolas cadastradas no sistema"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
