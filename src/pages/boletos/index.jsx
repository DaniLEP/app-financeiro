"use client"

import { useEffect, useState } from "react"
import { ref, onValue, update, push, get } from "firebase/database"
import { db } from "../../../firebase"
import {
  Search,
  CheckCircle,
  FileText,
  Users,
  CreditCard,
  Filter,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react"

export default function PagamentosCards() {
  const [jovens, setJovens] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroUnificado, setFiltroUnificado] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [selecionados, setSelecionados] = useState([])
  const [modalAberta, setModalAberta] = useState(false)
  const [modalBoleto, setModalBoleto] = useState(false)
  const [jovemSelecionadoBoleto, setJovemSelecionadoBoleto] = useState(null)
  const [visualizacao, setVisualizacao] = useState("cards")
  const [mostrarDashboard, setMostrarDashboard] = useState(true)

  useEffect(() => {
    const jovensRef = ref(db, "jovens")
    const unsub = onValue(
      jovensRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const dados = Object.entries(snapshot.val()).map(([id, jovem]) => ({ id, ...jovem }))
          setJovens(dados)
        } else {
          setJovens([])
        }
        setLoading(false)
      },
      (err) => {
        console.error("Erro ao buscar jovens:", err)
        setLoading(false)
      },
    )
    return () => unsub && typeof unsub === "function" && unsub()
  }, [])

  // ---------- FUNÇÃO WHATSAPP ----------
  const entrarEmContatoWhatsApp = (jovem) => {
    if (!jovem.dadosJovem?.telefone) {
      alert("Número de telefone não cadastrado para este jovem.")
      return
    }

    const numero = jovem.dadosJovem.telefone.replace(/\D/g, "")
    const url = `https://wa.me/${numero}`
    window.open(url, "_blank")
  }

  // ---------- FUNÇÃO PARA ADICIONAR TELEFONE PADRÃO ----------
  const adicionarTelefonePadrao = async () => {
    const jovensRef = ref(db, "jovens")
    const snapshot = await get(jovensRef)
    if (!snapshot.exists()) return

    const dados = snapshot.val()
    for (const [id, jovem] of Object.entries(dados)) {
      if (!jovem.dadosJovem?.telefone) {
        await update(ref(db, `jovens/${id}/dadosJovem`), {
          telefone: "5511999999999",
        })
      }
    }
    alert("Telefones adicionados com sucesso!")
  }

  // ---------- FUNÇÕES DE STATUS E PAGAMENTO ----------
  const getStatusPagamentoMeta = (jovem) => {
    if (jovem.statusPagamento === "pago")
      return {
        status: "pago",
        cor: "text-emerald-700 bg-emerald-50/80 border border-emerald-200/60",
        label: "Pago",
        icon: CheckCircle,
      }
    if (jovem.statusPagamento === "pendente" || jovem.dataBoletoRecebido)
      return {
        status: "pendente",
        cor: "text-amber-700 bg-amber-50/80 border border-amber-200/60",
        label: "Pendente",
        icon: AlertCircle,
      }
    if (!jovem.cursoTecnico?.diaVencimento)
      return {
        status: "nao_recebido",
        cor: "text-slate-600 bg-slate-50/80 border border-slate-200/60",
        label: "Aguardando",
        icon: Calendar,
      }

    const hoje = new Date()
    const venc = new Date(jovem.cursoTecnico.diaVencimento)
    venc.setFullYear(hoje.getFullYear())
    const diasRestantes = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0)
      return {
        status: "vencido",
        cor: "text-rose-700 bg-rose-50/80 border border-rose-200/60",
        label: "Vencido",
        icon: AlertCircle,
      }
    if (diasRestantes <= 5)
      return {
        status: "desconto",
        cor: "text-blue-700 bg-blue-50/80 border border-blue-200/60",
        label: "Desconto",
        icon: DollarSign,
      }
    return {
      status: "nao_recebido",
      cor: "text-slate-600 bg-slate-50/80 border border-slate-200/60",
      label: "Não recebido",
      icon: FileText,
    }
  }

  const calcularValorPagamento = (jovem, referenciaData = new Date()) => {
    const valorOriginal = Number.parseFloat(jovem.cursoTecnico?.valorMensalidade || 0)
    if (!jovem.cursoTecnico?.diaVencimento) return valorOriginal

    const venc = new Date(jovem.cursoTecnico.diaVencimento)
    venc.setFullYear(referenciaData.getFullYear())
    const diasRestantes = Math.ceil((venc - referenciaData) / (1000 * 60 * 60 * 24))

    if (diasRestantes >= 5) return Number((valorOriginal * 0.9).toFixed(2))
    return Number(valorOriginal.toFixed(2))
  }

  const receberBoleto = async (jovem) => {
    const hojeISO = new Date().toISOString()
    const atualizacao = { dataBoletoRecebido: hojeISO, statusPagamento: "pendente" }
    try {
      await update(ref(db, `jovens/${jovem.id}`), atualizacao)
      setJovens((prev) => prev.map((j) => (j.id === jovem.id ? { ...j, ...atualizacao } : j)))
    } catch (err) {
      console.error("Erro ao receber boleto:", err)
    }
  }

  const marcarComoPago = async (jovem) => {
    const hojeISO = new Date().toISOString()
    const valorPago = calcularValorPagamento(jovem, new Date())
    const totalParcelas = (Number.parseInt(jovem.cursoTecnico?.parcelas) || 1) - 1
    const parcelasPagas = (Number.parseInt(jovem.parcelasPagas) || 0) + 1
    const atualizacao = {
      statusPagamento: "pago",
      parcelasPagas,
      "cursoTecnico/parcelas": totalParcelas,
      valorPago,
      dataRecebimento: hojeISO,
    }
    try {
      await update(ref(db, `jovens/${jovem.id}`), atualizacao)
      await push(ref(db, `historicoPagamentos`), {
        jovemId: jovem.id,
        jovemNome: jovem.dadosJovem?.nome,
        valor: valorPago,
        data: hojeISO,
        tipo: "pagamento",
        numeroBoleto: jovem.ultimoBoleto || "N/A",
      })
      setJovens((prev) => prev.map((j) => (j.id === jovem.id ? { ...j, ...atualizacao } : j)))
      setSelecionados((prev) => prev.filter((id) => id !== jovem.id))
    } catch (err) {
      console.error("Erro ao marcar como pago:", err)
    }
  }

  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) setSelecionados((prev) => prev.filter((i) => i !== id))
    else setSelecionados((prev) => [...prev, id])
  }

  const selecionarTodosPendentes = () => {
    const idsPendentes = jovens.filter((j) => j.statusPagamento === "pendente").map((j) => j.id)
    setSelecionados(idsPendentes)
  }

  const pagarEmLote = async () => {
    const hojeISO = new Date().toISOString()
    const updates = []
    try {
      for (const id of selecionados) {
        const jovem = jovens.find((j) => j.id === id)
        if (!jovem) continue
        const valorPago = calcularValorPagamento(jovem, new Date())
        const totalParcelas = (Number.parseInt(jovem.cursoTecnico?.parcelas) || 1) - 1
        const parcelasPagas = (Number.parseInt(jovem.parcelasPagas) || 0) + 1

        const att = {
          statusPagamento: "pago",
          parcelasPagas,
          "cursoTecnico/parcelas": totalParcelas,
          valorPago,
          dataRecebimento: hojeISO,
        }

        await update(ref(db, `jovens/${jovem.id}`), att)
        await push(ref(db, `historicoPagamentos`), {
          jovemId: jovem.id,
          jovemNome: jovem.dadosJovem?.nome,
          valor: valorPago,
          data: hojeISO,
          tipo: "pagamento",
          numeroBoleto: jovem.ultimoBoleto || "N/A",
        })

        updates.push({ id: jovem.id, att })
      }
      setJovens((prev) =>
        prev.map((j) => {
          const find = updates.find((u) => u.id === j.id)
          return find ? { ...j, ...find.att } : j
        }),
      )
      setSelecionados([])
      setModalAberta(false)
      alert("Pagamentos em lote realizados com sucesso.")
    } catch (err) {
      console.error("Erro ao processar pagamento em lote:", err)
      alert("Erro ao processar pagamentos em lote.")
    }
  }

  // ---------- Filtragem ----------
  const jovensFiltrados = jovens.filter((j) => {
    const termo = filtroUnificado.toLowerCase()
    const matchTexto =
      j.dadosJovem?.nome?.toLowerCase().includes(termo) ||
      (j.projeto || "").toLowerCase().includes(termo) ||
      (j.cursoTecnico?.nomeCurso || "").toLowerCase().includes(termo) ||
      (j.escolaTecnica?.nomeFantasia || "").toLowerCase().includes(termo)

    const status = getStatusPagamentoMeta(j).status
    const matchStatus = filtroStatus === "todos" || status === filtroStatus

    let matchData = true
    if (filtroDataInicio) {
      const dataInicio = new Date(filtroDataInicio)
      const dataVenc = new Date(j.cursoTecnico?.anoConclusao || new Date())
      matchData = dataVenc >= dataInicio
    }
    if (filtroDataFim) {
      const dataFim = new Date(filtroDataFim)
      const dataVenc = new Date(j.cursoTecnico?.anoConclusao || new Date())
      matchData = matchData && dataVenc <= dataFim
    }

    return matchTexto && matchStatus && matchData
  })

  // ---------- Renderização ----------
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-6 text-slate-700 font-semibold text-lg">Carregando dados financeiros...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Gestão Financeira</h1>
              <p className="text-slate-600 text-base lg:text-lg">Controle e acompanhamento de pagamentos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total de Registros</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{jovensFiltrados.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 lg:p-7 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">Filtros Avançados</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Busca Geral</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nome, projeto, curso..."
                  value={filtroUnificado}
                  onChange={(e) => setFiltroUnificado(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="todos">Todos os status</option>
                <option value="pago">✓ Pago</option>
                <option value="pendente">⏳ Pendente</option>
                <option value="vencido">⚠ Vencido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data Início</label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data Fim</label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {jovensFiltrados.map((jovem) => {
            const statusMeta = getStatusPagamentoMeta(jovem)
            const StatusIcon = statusMeta.icon

            return (
              <div
                key={jovem.id}
                className={`relative bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selecionados.includes(jovem.id)
                    ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
                    : "border-slate-200/80"
                }`}
              >
                <div className="p-5 lg:p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${statusMeta.cor}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusMeta.label}
                    </span>

                    <input
                      type="checkbox"
                      checked={selecionados.includes(jovem.id)}
                      onChange={() => toggleSelecionado(jovem.id)}
                      disabled={jovem.statusPagamento !== "pendente"}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    />
                  </div>

                  <h3 className="font-bold text-xl text-slate-900 leading-tight mb-3">
                    {jovem.dadosJovem?.nome || "-"}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
                        Projeto:
                      </span>
                      <span className="text-sm font-medium text-slate-700">{jovem.projeto || "-"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
                        Curso:
                      </span>
                      <span className="text-sm font-medium text-slate-700">{jovem.cursoTecnico?.nomeCurso || "-"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
                        Vencto:
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {jovem.cursoTecnico?.diaVencimento || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 lg:px-6 py-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Valor</span>
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                    R$ {calcularValorPagamento(jovem).toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <div className="p-5 lg:p-6 space-y-3">
                  {!jovem.dataBoletoRecebido && (
                    <button
                      onClick={() => receberBoleto(jovem)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                      <FileText className="h-4 w-4" />
                      Receber Boleto
                    </button>
                  )}

                  {(jovem.statusPagamento === "pendente" ||
                    (jovem.dataBoletoRecebido && jovem.statusPagamento !== "pago")) && (
                    <button
                      onClick={() => marcarComoPago(jovem)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Pagamento
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setJovemSelecionadoBoleto(jovem)
                        setModalBoleto(true)
                      }}
                      className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:bg-slate-300 text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-200"
                    >
                      <FileText className="h-4 w-4" />
                      Boleto
                    </button>

                    <button
                      onClick={() => entrarEmContatoWhatsApp(jovem)}
                      className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-sm hover:shadow-md transition-all"
                    >
                      <Users className="h-4 w-4" />
                      Contato
                    </button>
                  </div>

                  {jovem.statusPagamento === "pago" && (
                    <div className="mt-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-800 font-bold text-sm uppercase tracking-wide">
                          Pagamento Confirmado
                        </span>
                      </div>
                      {jovem.dataRecebimento && (
                        <p className="text-center text-xs text-emerald-700 font-semibold">
                          {new Date(jovem.dataRecebimento).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {jovensFiltrados.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <CreditCard className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum registro encontrado</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Ajuste os filtros acima para visualizar diferentes resultados ou verifique se há dados cadastrados no
              sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
