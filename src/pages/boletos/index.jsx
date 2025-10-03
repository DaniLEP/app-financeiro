import { useEffect, useState } from "react"
import { ref, onValue, update, push } from "firebase/database"
import { db } from "../../../firebase"
import * as XLSX from "xlsx"
import {
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  X,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  Users,
  CreditCard,
} from "lucide-react"

export default function PagamentosCards() {
  // Dados e UI
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
  const [visualizacao, setVisualizacao] = useState("cards") // "cards" ou "tabela"
  const [mostrarDashboard, setMostrarDashboard] = useState(true)

  // Carrega dados e escuta alterações no Firebase
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

    // onValue returns unsubscribe function in web SDK; but Firebase v9 onValue returns the function remove? we don't call here to keep listener
    return () => unsub && typeof unsub === "function" && unsub()
  }, [])

  // ---------- Helpers de status e valores ----------
  // status interno esperado: "nao_recebido", "pendente", "pago"
  const getStatusPagamentoMeta = (jovem) => {
    // se está pago -> pago
    if (jovem.statusPagamento === "pago")
      return { status: "pago", cor: "text-green-600 bg-green-50", label: "Pago" }

    // se recebeu boleto (dataBoletoRecebido) ou status pendente -> pendente de pagamento
    if (jovem.statusPagamento === "pendente" || jovem.dataBoletoRecebido)
      return { status: "pendente", cor: "text-yellow-600 bg-yellow-50", label: "Pendente de pagamento" }

    // se não tem vencimento -> sem dia
    if (!jovem.cursoTecnico?.diaVencimento)
      return { status: "nao_recebido", cor: "text-blue-600 bg-blue-50", label: "Sem dia definido" }

    // calcula dias para vencimento - apenas para exibir 'desconto' ou 'vencido' em casos visuais
    const hoje = new Date()
    const venc = new Date(jovem.cursoTecnico.diaVencimento)
    venc.setFullYear(hoje.getFullYear())
    const diasRestantes = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) return { status: "vencido", cor: "text-red-600 bg-red-50", label: "Vencido" }
    if (diasRestantes <= 5) return { status: "desconto", cor: "text-purple-600 bg-purple-50", label: "Com desconto" }

    return { status: "nao_recebido", cor: "text-blue-600 bg-blue-50", label: "Boleto não recebido" }
  }

  // calcula valor que será cobrado no pagamento (aplica desconto 10% se faltam >=5 dias)
  const calcularValorPagamento = (jovem, referenciaData = new Date()) => {
    const valorOriginal = Number.parseFloat(jovem.cursoTecnico?.valorMensalidade || 0)
    if (!jovem.cursoTecnico?.diaVencimento) return valorOriginal

    const venc = new Date(jovem.cursoTecnico.diaVencimento)
    venc.setFullYear(referenciaData.getFullYear())
    const diasRestantes = Math.ceil((venc - referenciaData) / (1000 * 60 * 60 * 24))

    if (diasRestantes >= 5) return Number((valorOriginal * 0.9).toFixed(2)) // 10% desconto
    if (diasRestantes < 0) return Number(valorOriginal.toFixed(2)) // já venceu -> valor cheio
    return Number(valorOriginal.toFixed(2)) // se estiver entre 0 e 4 dias -> sem desconto (conforme sua regra)
  }

  // Recebe (marca) boleto — esse é o fluxo que você pediu:
  // ao clicar, marcamos dataBoletoRecebido e statusPayment -> "pendente"
  const receberBoleto = async (jovem) => {
    const hojeISO = new Date().toISOString()
    const atualizacao = {
      dataBoletoRecebido: hojeISO,
      statusPagamento: "pendente", // pendente de pagamento (recebido mas ainda não pago)
    }
    try {
      await update(ref(db, `jovens/${jovem.id}`), atualizacao)
      setJovens((prev) => prev.map((j) => (j.id === jovem.id ? { ...j, ...atualizacao } : j)))
    } catch (err) {
      console.error("Erro ao receber boleto:", err)
    }
  }

  // Marca como pago (individual)
  const marcarComoPago = async (jovem) => {
    const hojeISO = new Date().toISOString()
    const valorPago = calcularValorPagamento(jovem, new Date()) // usa data atual para definir desconto
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
      // registrar historico
      await push(ref(db, `historicoPagamentos`), {
        jovemId: jovem.id,
        jovemNome: jovem.dadosJovem?.nome,
        valor: valorPago,
        data: hojeISO,
        tipo: "pagamento",
        numeroBoleto: jovem.ultimoBoleto || "N/A",
      })
      // atualizar local
      setJovens((prev) => prev.map((j) => (j.id === jovem.id ? { ...j, ...atualizacao } : j)))
      // remover da seleção caso estivesse
      setSelecionados((prev) => prev.filter((id) => id !== jovem.id))
    } catch (err) {
      console.error("Erro ao marcar como pago:", err)
    }
  }

  // Seleciona/desseleciona checkbox
  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) setSelecionados((prev) => prev.filter((i) => i !== id))
    else setSelecionados((prev) => [...prev, id])
  }

  // Seleciona todos os que estão PENDENTES (ou seja, já receberam boleto e aguardam pagamento)
  const selecionarTodosPendentes = () => {
    const idsPendentes = jovens.filter((j) => j.statusPagamento === "pendente").map((j) => j.id)
    setSelecionados(idsPendentes)
  }

  // Pagamento em lote (confirmação via modal é tratada no JSX — aqui aplicamos as atualizações)
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

        // Atualiza no Firebase
        await update(ref(db, `jovens/${jovem.id}`), att)

        // Historico
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

      // Atualiza local state de uma vez
      setJovens((prev) => prev.map((j) => {
        const find = updates.find(u => u.id === j.id)
        return find ? { ...j, ...find.att } : j
      }))

      // limpa seleção e fecha modal
      setSelecionados([])
      setModalAberta(false)
      alert("Pagamentos em lote realizados com sucesso.")
    } catch (err) {
      console.error("Erro ao processar pagamento em lote:", err)
      alert("Erro ao processar pagamentos em lote.")
    }
  }

  // Exporta para Excel todos os que NÃO RECEBERAM boleto (status 'nao_recebido' ou sem dataBoletoGerado)
  const exportarNaoRecebidosParaExcel = () => {
    const listaExport = jovens
      .filter((j) => !j.dataBoletoRecebido && j.statusPagamento !== "pendente" && j.statusPagamento !== "pago")
      .map((j) => ({
        Nome: j.dadosJovem?.nome || "-",
        CPF: j.dadosJovem?.cpf || "-",
        Projeto: j.projeto || "-",
        Curso: j.cursoTecnico?.nomeCurso || "-",
        ValorOriginal: j.cursoTecnico?.valorMensalidade || 0,
        DiaVencimento: j.cursoTecnico?.diaVencimento || "-",
        Status: getStatusPagamentoMeta(j).label,
      }))

    const ws = XLSX.utils.json_to_sheet(listaExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "NaoRecebidos")
    XLSX.writeFile(wb, `boletos_nao_recebidos_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // Exporta os jovens filtrados (útil para debug/exportar lista atual)
  const exportarFiltradosParaExcel = (lista) => {
    const listaExport = lista.map((j) => ({
      Nome: j.dadosJovem?.nome || "-",
      CPF: j.dadosJovem?.cpf || "-",
      Projeto: j.projeto || "-",
      Curso: j.cursoTecnico?.nomeCurso || "-",
      DiaVencimento: j.cursoTecnico?.diaVencimento || "-",
      Status: getStatusPagamentoMeta(j).label,
      ValorCobrado: calcularValorPagamento(j),
      UltimoBoleto: j.ultimoBoleto || "-",
    }))
    const ws = XLSX.utils.json_to_sheet(listaExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Export")
    XLSX.writeFile(wb, `export_pagamentos_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // ---------- Métricas para dashboard ----------
  const calcularMetricas = () => {
    const totalReceber = jovens
      .filter((j) => ["pendente", "nao_recebido", "desconto", "vencido"].includes(getStatusPagamentoMeta(j).status))
      .reduce((acc, j) => acc + calcularValorPagamento(j), 0)

    const totalRecebido = jovens.filter((j) => j.statusPagamento === "pago").reduce((acc, j) => acc + (Number.parseFloat(j.valorPago) || 0), 0)

    const totalVencido = jovens.filter((j) => getStatusPagamentoMeta(j).status === "vencido").reduce((acc, j) => acc + calcularValorPagamento(j), 0)

    const totalPendente = jovens.filter((j) => j.statusPagamento === "pendente").reduce((acc, j) => acc + calcularValorPagamento(j), 0)

    const qtdPagos = jovens.filter((j) => j.statusPagamento === "pago").length
    const qtdPendentes = jovens.filter((j) => j.statusPagamento === "pendente").length
    const qtdVencidos = jovens.filter((j) => getStatusPagamentoMeta(j).status === "vencido").length

    return {
      totalReceber,
      totalRecebido,
      totalVencido,
      totalPendente,
      qtdPagos,
      qtdPendentes,
      qtdVencidos,
      totalAlunos: jovens.length,
    }
  }
  const metricas = calcularMetricas()

  // ---------- Filtros aplicados ----------
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
    if (filtroDataInicio && j.cursoTecnico?.diaVencimento) {
      const dataVenc = new Date(j.cursoTecnico.diaVencimento)
      const dataInicio = new Date(filtroDataInicio)
      matchData = dataVenc >= dataInicio
    }
    if (filtroDataFim && j.cursoTecnico?.diaVencimento) {
      const dataVenc = new Date(j.cursoTecnico.diaVencimento)
      const dataFim = new Date(filtroDataFim)
      matchData = matchData && dataVenc <= dataFim
    }

    return matchTexto && matchStatus && matchData
  })

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Painel de Pagamentos
          </h1>
          <p className="text-sm text-gray-600">Controle de boletos — receber, pagar, exportar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarDashboard(!mostrarDashboard)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            {mostrarDashboard ? "Ocultar" : "Mostrar"} Dashboard
          </button>
          <button onClick={() => exportarFiltradosParaExcel(jovensFiltrados)} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Filtrados
          </button>
          <button onClick={exportarNaoRecebidosParaExcel} className="px-4 py-2 bg-yellow-600 text-white rounded">
            Exportar Não Recebidos
          </button>
        </div>
      </div>

      {/* DASHBOARD */}
      {mostrarDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total a Receber</p>
            <p className="text-xl font-bold">R$ {metricas.totalReceber.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{metricas.qtdPendentes} pendentes</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Total Recebido</p>
            <p className="text-xl font-bold">R$ {metricas.totalRecebido.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{metricas.qtdPagos} pagos</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Total Vencido</p>
            <p className="text-xl font-bold">R$ {metricas.totalVencido.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Total Alunos</p>
            <p className="text-xl font-bold">{metricas.totalAlunos}</p>
          </div>
        </div>
      )}

      {/* AÇÕES / FILTROS */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, projeto, curso ou escola..."
              value={filtroUnificado}
              onChange={(e) => setFiltroUnificado(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded"
            />
          </div>

          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="px-3 py-2 border rounded">
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente de pagamento</option>
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
            <option value="desconto">Com Desconto</option>
            <option value="nao_recebido">Boleto não recebido</option>
          </select>

          <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="px-3 py-2 border rounded" />
          <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="px-3 py-2 border rounded" />
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={selecionarTodosPendentes} className="px-4 py-2 bg-yellow-500 text-white rounded flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Selecionar Pendentes
          </button>
          <button
            onClick={() => setModalAberta(true)}
            disabled={selecionados.length === 0}
            className={`px-4 py-2 text-white rounded flex items-center gap-2 ${selecionados.length === 0 ? "bg-gray-300" : "bg-blue-600"}`}
          >
            <CreditCard className="h-4 w-4" />
            Pagar Selecionados ({selecionados.length})
          </button>
          <button onClick={() => exportarFiltradosParaExcel(jovensFiltrados)} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar (filtrados)
          </button>
        </div>
      </div>

      {/* LISTAGEM: CARDS ou TABELA */}
      {visualizacao === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jovensFiltrados.map((jovem) => {
            const meta = getStatusPagamentoMeta(jovem)
            const valorPagamento = calcularValorPagamento(jovem)
            const isSelecionado = selecionados.includes(jovem.id)
            return (
              <div key={jovem.id} className={`bg-white rounded-xl p-4 shadow relative border-2 ${isSelecionado ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"}`}>
                <div className="absolute top-3 right-3">
                  <input
                    type="checkbox"
                    checked={isSelecionado}
                    onChange={() => toggleSelecionado(jovem.id)}
                    disabled={jovem.statusPagamento !== "pendente"}
                  />
                </div>

                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${meta.cor} w-fit`}>
                  {meta.label}
                </span>

                <h3 className="mt-3 font-bold text-lg">{jovem.dadosJovem?.nome || "-"}</h3>
                <p className="text-sm text-gray-600">Turma {jovem.dadosJovem?.turma || "-"}</p>
                <p className="text-sm text-gray-600">{jovem.dadosJovem?.projeto || "-"}</p>
                <p className="text-sm text-gray-600">{jovem.cursoTecnico?.nomeCurso || "-"}</p>
                <p className="text-sm text-gray-600">Vencimento: {jovem.cursoTecnico?.diaVencimento || "-"}</p>
                {jovem.ultimoBoleto && <p className="text-sm text-gray-600">Boleto: {jovem.ultimoBoleto}</p>}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-lg font-bold">R$ {valorPagamento.toFixed(2)}</p>
                  {valorPagamento < Number.parseFloat(jovem.cursoTecnico?.valorMensalidade || 0) && (
                    <p className="text-xs text-green-600">Desconto de 10% aplicado</p>
                  )}
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {/* Se boleto ainda NÃO foi recebido: mostrar botão para receber */}
                  {!jovem.dataBoletoRecebido && (
                    <button
                      onClick={() => receberBoleto(jovem)}
                      className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs font-medium"
                    >
                      <FileText className="h-3 w-3 mr-1 inline" />
                      Receber Boleto
                    </button>
                  )}

                  {/* Se já recebeu (statusPagamento pendente) → mostrar marcar como pago */}
                  {(jovem.statusPagamento === "pendente" || (jovem.dataBoletoRecebido && jovem.statusPagamento !== "pago")) && (
                    <button
                      onClick={() => marcarComoPago(jovem)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Marcar como Pago
                    </button>
                  )}

                  {/* Se já pago */}
                  {jovem.statusPagamento === "pago" && (
                    <div className="flex-1 text-center">
                      <span className="text-green-600 font-semibold text-sm flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Pagamento Confirmado
                      </span>
                      {jovem.dataRecebimento && (
                        <p className="text-xs text-gray-500 mt-1">{new Date(jovem.dataRecebimento).toLocaleDateString("pt-BR")}</p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // TABELA
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3"><input type="checkbox" onChange={(e) => {
                  if (e.target.checked) {
                    const ids = jovensFiltrados.filter(j => j.statusPagamento === "pendente").map(j => j.id)
                    setSelecionados(ids)
                  } else setSelecionados([])
                }} /></th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Projeto</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Vencimento</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Valor</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {jovensFiltrados.map(jovem => {
                const meta = getStatusPagamentoMeta(jovem)
                const valorPagamento = calcularValorPagamento(jovem)
                const isSelecionado = selecionados.includes(jovem.id)
                return (
                  <tr key={jovem.id} className={isSelecionado ? "bg-blue-50" : "hover:bg-gray-50"}>
                    <td className="p-3"><input type="checkbox" checked={isSelecionado} onChange={() => toggleSelecionado(jovem.id)} disabled={jovem.statusPagamento !== "pendente"} /></td>
                    <td className="p-3">{jovem.dadosJovem?.nome}</td>
                    <td className="p-3">{jovem.dadosJovem?.projeto}</td>
                    <td className="p-3">{jovem.cursoTecnico?.nomeCurso}</td>
                    <td className="p-3">{jovem.cursoTecnico?.diaVencimento || "-"}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-sm ${meta.cor}`}>{meta.label}</span></td>
                    <td className="p-3">R$ {valorPagamento.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {!jovem.dataBoletoRecebido && (
                          <button onClick={() => receberBoleto(jovem)} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs">Receber</button>
                        )}
                        {(jovem.statusPagamento === "pendente" || (jovem.dataBoletoRecebido && jovem.statusPagamento !== "pago")) && (
                          <button onClick={() => marcarComoPago(jovem)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Pagar</button>
                        )}
                        <button onClick={() => { setJovemSelecionadoBoleto(jovem); setModalBoleto(true) }} className="px-2 py-1 bg-purple-500 text-white rounded text-xs">Boleto</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Pagamento em lote */}
      {modalAberta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirmar Pagamento em Lote</h2>
              <button onClick={() => setModalAberta(false)} className="text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {selecionados.map(id => {
                const j = jovens.find(x => x.id === id)
                if (!j) return null
                return (
                  <div key={id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium">{j.dadosJovem?.nome}</p>
                      <p className="text-xs text-gray-500">{j.cursoTecnico?.nomeCurso}</p>
                    </div>
                    <span className="font-semibold">R$ {calcularValorPagamento(j).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <span className="font-bold">Total:</span>
              <span className="text-blue-600 font-bold">
                R$ {selecionados.reduce((acc, id) => {
                  const j = jovens.find(x => x.id === id)
                  return j ? acc + calcularValorPagamento(j) : acc
                }, 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setModalAberta(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
              <button onClick={pagarEmLote} className="px-4 py-2 bg-green-600 text-white rounded">Confirmar Pagamento</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Gerar / Receber boleto individual */}
      {modalBoleto && jovemSelecionadoBoleto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Boleto - {jovemSelecionadoBoleto.dadosJovem?.nome}</h2>
              <button onClick={() => { setModalBoleto(false); setJovemSelecionadoBoleto(null) }} className="text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Curso: {jovemSelecionadoBoleto.cursoTecnico?.nomeCurso}</p>
              <p className="text-sm text-gray-600">Vencimento: {jovemSelecionadoBoleto.cursoTecnico?.diaVencimento || "-"}</p>
              <p className="text-sm text-gray-600">Valor Original: R$ {Number.parseFloat(jovemSelecionadoBoleto.cursoTecnico?.valorMensalidade || 0).toFixed(2)}</p>
              <p className="text-lg font-bold text-green-700">Valor a cobrar (com regra de desconto): R$ {calcularValorPagamento(jovemSelecionadoBoleto).toFixed(2)}</p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalBoleto(false); setJovemSelecionadoBoleto(null) }} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>

              {/* Se boleto ainda NÃO foi recebido, permite marcar como recebido (receberBoleto) */}
              {!jovemSelecionadoBoleto.dataBoletoRecebido ? (
                <button onClick={() => { receberBoleto(jovemSelecionadoBoleto); setModalBoleto(false); setJovemSelecionadoBoleto(null) }} className="px-4 py-2 bg-yellow-500 text-white rounded">
                  Marcar Boleto como Recebido
                </button>
              ) : (
                // caso já tenha sido recebido, permitir gerar novo boleto (opcional) ou mostrar marcar como pago
                <>
                  <button onClick={() => gerarBoleto(jovemSelecionadoBoleto)} className="px-4 py-2 bg-purple-600 text-white rounded">Gerar Novo Boleto</button>
                  {jovemSelecionadoBoleto.statusPagamento !== "pago" && (
                    <button onClick={() => { marcarComoPago(jovemSelecionadoBoleto); setModalBoleto(false); setJovemSelecionadoBoleto(null) }} className="px-4 py-2 bg-blue-600 text-white rounded">Marcar como Pago</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ / LEGENDA */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Legenda</h3>
        <div className="flex gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-50 border-2 border-yellow-600 rounded-full"></span>Pendente (boleto recebido)</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded-full"></span>Boleto não recebido / Pendente</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-50 border-2 border-red-600 rounded-full"></span>Vencido</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-50 border-2 border-green-600 rounded-full"></span>Pago</div>
        </div>
      </div>
    </div>
  )
}
