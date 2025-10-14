// import { useEffect, useState, useMemo } from "react"
// import { ref, onValue, update, push, get } from "firebase/database"
// import { db } from "../../../firebase"
// import * as XLSX from "xlsx"
// import {
//   Search,
//   CheckCircle,
//   FileText,
//   Users,
//   CreditCard,
//   Filter,
//   Calendar,
//   DollarSign,
//   AlertCircle,
//   Download,
//   Table as TableIcon,
//   Grid,
// } from "lucide-react"

// export default function PagamentosCards() {
//   const [jovens, setJovens] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filtroUnificado, setFiltroUnificado] = useState("")
//   const [filtroStatus, setFiltroStatus] = useState("todos")
//   const [filtroProjeto, setFiltroProjeto] = useState("todos")
//   const [filtroDataInicio, setFiltroDataInicio] = useState("")
//   const [filtroDataFim, setFiltroDataFim] = useState("")
//   const [selecionados, setSelecionados] = useState([])
//   const [modalAberta, setModalAberta] = useState(false)
//   const [modalBoleto, setModalBoleto] = useState(false)
//   const [jovemSelecionadoBoleto, setJovemSelecionadoBoleto] = useState(null)
//   const [visualizacao, setVisualizacao] = useState("cards") // "cards" | "tabela"
//   const [mostrarDashboard, setMostrarDashboard] = useState(true)

//   useEffect(() => {
//     const jovensRef = ref(db, "jovens")
//     const unsub = onValue(
//       jovensRef,
//       (snapshot) => {
//         if (snapshot.exists()) {
//           const dados = Object.entries(snapshot.val()).map(([id, jovem]) => ({ id, ...jovem }))
//           setJovens(dados)
//         } else {
//           setJovens([])
//         }
//         setLoading(false)
//       },
//       (err) => {
//         console.error("Erro ao buscar jovens:", err)
//         setLoading(false)
//       },
//     )
//     return () => unsub && typeof unsub === "function" && unsub()
//   }, [])

//   // ---------- FUNÇÃO WHATSAPP ----------
//   const entrarEmContatoWhatsApp = (jovem) => {
//     if (!jovem.dadosJovem?.telefone) {
//       alert("Número de telefone não cadastrado para este jovem.")
//       return
//     }

//     const numero = jovem.dadosJovem.telefone.replace(/\D/g, "")
//     const url = `https://wa.me/${numero}`
//     window.open(url, "_blank")
//   }

//   // ---------- FUNÇÃO PARA ADICIONAR TELEFONE PADRÃO ----------
//   const adicionarTelefonePadrao = async () => {
//     const jovensRef = ref(db, "jovens")
//     const snapshot = await get(jovensRef)
//     if (!snapshot.exists()) return

//     const dados = snapshot.val()
//     for (const [id, jovem] of Object.entries(dados)) {
//       if (!jovem.dadosJovem?.telefone) {
//         await update(ref(db, `jovens/${id}/dadosJovem`), {
//           telefone: "5511999999999",
//         })
//       }
//     }
//     alert("Telefones adicionados com sucesso!")
//   }

//   // ---------- FUNÇÕES DE STATUS E PAGAMENTO ----------
//   const getStatusPagamentoMeta = (jovem) => {
//     if (jovem.statusPagamento === "pago")
//       return {
//         status: "pago",
//         cor: "text-emerald-700 bg-emerald-50/80 border border-emerald-200/60",
//         label: "Pago",
//         icon: CheckCircle,
//       }
//     if (jovem.statusPagamento === "pendente" || jovem.dataBoletoRecebido)
//       return {
//         status: "pendente",
//         cor: "text-amber-700 bg-amber-50/80 border border-amber-200/60",
//         label: "Pendente",
//         icon: AlertCircle,
//       }
//     if (!jovem.cursoTecnico?.diaVencimento)
//       return {
//         status: "nao_recebido",
//         cor: "text-slate-600 bg-slate-50/80 border border-slate-200/60",
//         label: "Aguardando",
//         icon: Calendar,
//       }

//     const hoje = new Date()
//     const venc = new Date(jovem.cursoTecnico.diaVencimento)
//     venc.setFullYear(hoje.getFullYear())
//     const diasRestantes = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))

//     if (diasRestantes < 0)
//       return {
//         status: "vencido",
//         cor: "text-rose-700 bg-rose-50/80 border border-rose-200/60",
//         label: "Vencido",
//         icon: AlertCircle,
//       }
//     if (diasRestantes <= 5)
//       return {
//         status: "desconto",
//         cor: "text-blue-700 bg-blue-50/80 border border-blue-200/60",
//         label: "Desconto",
//         icon: DollarSign,
//       }
//     return {
//       status: "nao_recebido",
//       cor: "text-slate-600 bg-slate-50/80 border border-slate-200/60",
//       label: "Não recebido",
//       icon: FileText,
//     }
//   }

//   const calcularValorPagamento = (jovem, referenciaData = new Date()) => {
//     const valorOriginal = Number.parseFloat(jovem.cursoTecnico?.valorMensalidade || 0)
//     if (!jovem.cursoTecnico?.diaVencimento) return valorOriginal

//     const venc = new Date(jovem.cursoTecnico.diaVencimento)
//     venc.setFullYear(referenciaData.getFullYear())
//     const diasRestantes = Math.ceil((venc - referenciaData) / (1000 * 60 * 60 * 24))

//     if (diasRestantes >= 5) return Number((valorOriginal * 0.9).toFixed(2))
//     return Number(valorOriginal.toFixed(2))
//   }

//   // Helper para atualizar parcelas (decrementar) com segurança
//   const calcularNovaQuantidadeParcelas = (jovem) => {
//     const qAtual =
//       Number.parseInt(jovem.cursoTecnico?.quantidadeParcelas ?? jovem.cursoTecnico?.parcelas ?? 0) || 0
//     const nova = Math.max(qAtual - 1, 0)
//     return nova
//   }

//   const receberBoleto = async (jovem) => {
//     const hojeISO = new Date().toISOString()
//     const atualizacao = { dataBoletoRecebido: hojeISO, statusPagamento: "pendente" }
//     try {
//       await update(ref(db, `jovens/${jovem.id}`), atualizacao)
//       setJovens((prev) => prev.map((j) => (j.id === jovem.id ? { ...j, ...atualizacao } : j)))
//     } catch (err) {
//       console.error("Erro ao receber boleto:", err)
//     }
//   }

// const marcarComoPago = async (jovem) => {
//   setProcessandoPagamento(jovem.id)
//   const hojeISO = new Date().toISOString()
//   const valorPago = calcularValorPagamento(jovem, new Date())
//   const parcelasPagas = (Number.parseInt(jovem.parcelasPagas) || 0) + 1
//   const novaQuantidadeParcelas = calcularNovaQuantidadeParcelas(jovem)

//   const atualizacao = {
//     statusPagamento: "pago",
//     parcelasPagas,
//     valorPago,
//     dataRecebimento: hojeISO,
//     "cursoTecnico/parcelas": novaQuantidadeParcelas,
//     "cursoTecnico/quantidadeParcelas": novaQuantidadeParcelas,
//   }

//   try {
//     // Atualiza pagamento no Firebase
//     await update(ref(db, `jovens/${jovem.id}`), atualizacao)

//     // Adiciona registro no histórico
//     await push(ref(db, `historicoPagamentos`), {
//       jovemId: jovem.id,
//       jovemNome: jovem.dadosJovem?.nome,
//       valor: valorPago,
//       data: hojeISO,
//       tipo: "pagamento",
//       numeroBoleto: jovem.ultimoBoleto || "N/A",
//     })

//     // 🟢 MOVER PARA FIM DE CONTRATO SE ACABARAM AS PARCELAS
//     if (novaQuantidadeParcelas === 0) {
//       const jovemRef = ref(db, `jovens/${jovem.id}`)
//       const jovemSnapshot = await get(jovemRef)

//       if (jovemSnapshot.exists()) {
//         const dadosJovem = jovemSnapshot.val()

//         // Cria registro na tabela "fimContrato"
//         await push(ref(db, "fimContrato"), {
//           ...dadosJovem,
//           dataFimContrato: hojeISO,
//         })

//         // Marca como inativo (ou remova se preferir)
//         await update(ref(db, `jovens/${jovem.id}`), { ativo: false })
//       }
//     }

//     // Atualiza localmente o estado dos jovens
//     setJovens((prev) => prev.map((j) => (j.id === jovem.id ? { ...j, ...atualizacao } : j)))
//     setSelecionados((prev) => prev.filter((id) => id !== jovem.id))
//   } catch (err) {
//     console.error("Erro ao marcar como pago:", err)
//     alert("Ocorreu um erro ao confirmar pagamento.")
//   } finally {
//     setProcessandoPagamento(null)
//   }
// }


// const pagarEmLote = async () => {
//   if (selecionados.length === 0) {
//     alert("Nenhum registro selecionado.")
//     return
//   }

//   setProcessandoLote(true)
//   const hojeISO = new Date().toISOString()
//   const updates = []

//   try {
//     for (const id of selecionados) {
//       const jovem = jovens.find((j) => j.id === id)
//       if (!jovem) continue

//       const valorPago = calcularValorPagamento(jovem, new Date())
//       const parcelasPagas = (Number.parseInt(jovem.parcelasPagas) || 0) + 1
//       const novaQuantidadeParcelas = calcularNovaQuantidadeParcelas(jovem)

//       const att = {
//         statusPagamento: "pago",
//         parcelasPagas,
//         valorPago,
//         dataRecebimento: hojeISO,
//         "cursoTecnico/parcelas": novaQuantidadeParcelas,
//         "cursoTecnico/quantidadeParcelas": novaQuantidadeParcelas,
//       }

//       // Atualiza o pagamento no Firebase
//       await update(ref(db, `jovens/${jovem.id}`), att)

//       // Adiciona registro no histórico
//       await push(ref(db, `historicoPagamentos`), {
//         jovemId: jovem.id,
//         jovemNome: jovem.dadosJovem?.nome,
//         valor: valorPago,
//         data: hojeISO,
//         tipo: "pagamento",
//         numeroBoleto: jovem.ultimoBoleto || "N/A",
//       })

//       // 🟢 MOVER PARA FIM DE CONTRATO SE ACABARAM AS PARCELAS
//       if (novaQuantidadeParcelas === 0) {
//         const jovemRef = ref(db, `jovens/${jovem.id}`)
//         const jovemSnapshot = await get(jovemRef)

//         if (jovemSnapshot.exists()) {
//           const dadosJovem = jovemSnapshot.val()

//           // Cria registro na tabela "fimContrato"
//           await push(ref(db, "fimContrato"), {
//             ...dadosJovem,
//             dataFimContrato: hojeISO,
//           })

//           // Marca como inativo (ou remova se preferir)
//           await update(ref(db, `jovens/${jovem.id}`), { ativo: false })
//         }
//       }

//       updates.push({ id: jovem.id, att })
//     }

//     // Atualiza o estado local com os novos dados
//     setJovens((prev) =>
//       prev.map((j) => {
//         const find = updates.find((u) => u.id === j.id)
//         return find ? { ...j, ...find.att } : j
//       }),
//     )

//     setSelecionados([])
//     setModalAberta(false)
//     alert("Pagamentos em lote realizados com sucesso.")
//   } catch (err) {
//     console.error("Erro ao processar pagamento em lote:", err)
//     alert("Erro ao processar pagamentos em lote.")
//   } finally {
//     setProcessandoLote(false)
//   }
// }

//   const toggleSelecionado = (id) => {
//     if (selecionados.includes(id)) setSelecionados((prev) => prev.filter((i) => i !== id))
//     else setSelecionados((prev) => [...prev, id])
//   }

//   const selecionarTodosPendentes = () => {
//     const idsPendentes = jovens.filter((j) => j.statusPagamento === "pendente").map((j) => j.id)
//     setSelecionados(idsPendentes)
//   }

//   // ---------- Filtragem ----------
//   // Gerar lista de projetos para o select de filtro
//   const projetosUnicos = useMemo(() => {
//     const setProjetos = new Set()
//     jovens.forEach((j) => {
//       if (j.dadosJovem?.projeto) setProjetos.add(j.dadosJovem?.projeto)
//     })
//     return ["todos", ...Array.from(setProjetos)]
//   }, [jovens])

//   const jovensFiltrados = jovens.filter((j) => {
//     const termo = filtroUnificado.toLowerCase()
//     const matchTexto =
//       (j.dadosJovem?.nome || "").toLowerCase().includes(termo) ||
//       (j.dadosJovem?.projeto || "").toLowerCase().includes(termo) ||
//       (j.cursoTecnico?.nomeCurso || "").toLowerCase().includes(termo) ||
//       (j.escolaTecnica?.nomeFantasia || "").toLowerCase().includes(termo)

//     const status = getStatusPagamentoMeta(j).status
//     const matchStatus = filtroStatus === "todos" || status === filtroStatus

//     const matchProjeto = filtroProjeto === "todos" || (j.dadosJovem?.projeto || "") === filtroProjeto

//     let matchData = true
//     if (filtroDataInicio) {
//       const dataInicio = new Date(filtroDataInicio)
//       const dataVenc = new Date(j.cursoTecnico?.anoConclusao || new Date())
//       matchData = dataVenc >= dataInicio
//     }
//     if (filtroDataFim) {
//       const dataFim = new Date(filtroDataFim)
//       const dataVenc = new Date(j.cursoTecnico?.anoConclusao || new Date())
//       matchData = matchData && dataVenc <= dataFim
//     }

//     return matchTexto && matchStatus && matchProjeto && matchData
//   })

//   // ---------- EXPORTAR PARA EXCEL ----------
//   const exportarExcel = () => {
//     if (!jovensFiltrados || jovensFiltrados.length === 0) {
//       alert("Nenhum registro para exportar com os filtros aplicados.")
//       return
//     }

//     // Transformar dados pro formato Excel
//     const dadosParaExportar = jovensFiltrados.map((j) => {
//       const statusMeta = getStatusPagamentoMeta(j)
//       return {
//         ID: j.id,
//         Nome: j.dadosJovem?.nome || "-",
//         Projeto: j.dadosJovem?.projeto || "-",
//         Curso: j.cursoTecnico?.nomeCurso || "-",
//         Vencto: j.cursoTecnico?.diaVencimento || "-",
//         Parcelas_Restantes:
//           j.cursoTecnico?.quantidadeParcelas ?? j.cursoTecnico?.parcelas ?? "-",
//         Parcelas_Pagas: j.parcelasPagas ?? 0,
//         Valor_atual: calcularValorPagamento(j).toFixed(2).replace(".", ","),
//         Status: statusMeta.label,
//         Telefone: j.dadosJovem?.telefone || "-",
//         DataRecebimento: j.dataRecebimento ? new Date(j.dataRecebimento).toLocaleString("pt-BR") : "-",
//       }
//     })

//     const ws = XLSX.utils.json_to_sheet(dadosParaExportar)
//     const wb = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(wb, ws, "Pagamentos")
//     XLSX.writeFile(wb, `pagamentos_filtrados_${new Date().toISOString().slice(0, 10)}.xlsx`)
//   }

//   // ---------- Renderização ----------
//   if (loading)
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
//         <div className="text-center">
//           <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
//           <p className="mt-6 text-slate-700 font-semibold text-lg">Carregando dados financeiros...</p>
//         </div>
//       </div>
//     )

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
//       <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
//         <div className="mb-8 lg:mb-10">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Gestão Financeira</h1>
//               <p className="text-slate-600 text-base lg:text-lg">Controle e acompanhamento de pagamentos</p>
//             </div>

//             {/* Top controls: total, view toggle e export */}
//             <div className="flex items-center gap-3">
//               <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm mr-2">
//                 <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total de Registros</p>
//                 <p className="text-2xl font-bold text-slate-900 mt-0.5">{jovensFiltrados.length}</p>
//               </div>

//               <div className="inline-flex items-center gap-2">
//                 <button
//                   onClick={() => setVisualizacao("cards")}
//                   className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
//                     visualizacao === "cards"
//                       ? "bg-blue-600 text-white border-blue-600"
//                       : "bg-white text-slate-700 border-slate-200"
//                   }`}
//                 >
//                   <Grid className="h-4 w-4" />
//                   Cards
//                 </button>

//                 <button
//                   onClick={() => setVisualizacao("tabela")}
//                   className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
//                     visualizacao === "tabela"
//                       ? "bg-blue-600 text-white border-blue-600"
//                       : "bg-white text-slate-700 border-slate-200"
//                   }`}
//                 >
//                   <TableIcon className="h-4 w-4" />
//                   Tabela
//                 </button>

//                 <button
//                   onClick={exportarExcel}
//                   className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white border-emerald-600 hover:brightness-95"
//                 >
//                   <Download className="h-4 w-4" />
//                   Exportar Excel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filtros */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 lg:p-7 mb-6 lg:mb-8">
//           <div className="flex items-center gap-3 mb-5">
//             <div className="p-2 bg-blue-50 rounded-lg">
//               <Filter className="h-5 w-5 text-blue-600" />
//             </div>
//             <h2 className="text-lg lg:text-xl font-bold text-slate-900">Filtros Avançados</h2>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="sm:col-span-2 lg:col-span-1">
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Busca Geral</label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Nome, projeto, curso..."
//                   value={filtroUnificado}
//                   onChange={(e) => setFiltroUnificado(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
//               <select
//                 value={filtroStatus}
//                 onChange={(e) => setFiltroStatus(e.target.value)}
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
//               >
//                 <option value="todos">Todos os status</option>
//                 <option value="pago">✓ Pago</option>
//                 <option value="pendente">⏳ Pendente</option>
//                 <option value="vencido">⚠ Vencido</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Projeto</label>
//               <select
//                 value={filtroProjeto}
//                 onChange={(e) => setFiltroProjeto(e.target.value)}
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
//               >
//                 {projetosUnicos.map((p) => (
//                   <option key={p} value={p}>
//                     {p === "todos" ? "Todos os projetos" : p}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Data Fim</label>
//               <input
//                 type="date"
//                 value={filtroDataFim}
//                 onChange={(e) => setFiltroDataFim(e.target.value)}
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">Data Início</label>
//               <input
//                 type="date"
//                 value={filtroDataInicio}
//                 onChange={(e) => setFiltroDataInicio(e.target.value)}
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Visualização: Cards */}
//         {visualizacao === "cards" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
//             {jovensFiltrados.map((jovem) => {
//               const statusMeta = getStatusPagamentoMeta(jovem)
//               const StatusIcon = statusMeta.icon

//               return (
//                 <div
//                   key={jovem.id}
//                   className={`relative bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
//                     selecionados.includes(jovem.id)
//                       ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
//                       : "border-slate-200/80"
//                   }`}
//                 >
//                   <div className="p-5 lg:p-6 border-b border-slate-100">
//                     <div className="flex items-start justify-between gap-3 mb-4">
//                       <span
//                         className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${statusMeta.cor}`}
//                       >
//                         <StatusIcon className="h-3.5 w-3.5" />
//                         {statusMeta.label}
//                       </span>

//                       <input
//                         type="checkbox"
//                         checked={selecionados.includes(jovem.id)}
//                         onChange={() => toggleSelecionado(jovem.id)}
//                         disabled={jovem.statusPagamento !== "pendente"}
//                         className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
//                       />
//                     </div>

//                     <h3 className="font-bold text-xl text-slate-900 leading-tight mb-3">
//                       {jovem.dadosJovem?.nome || "-"}
//                     </h3>

//                     <div className="space-y-2">
//                       <div className="flex items-start gap-2">
//                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
//                           Projeto:
//                         </span>
//                         <span className="text-sm font-medium text-slate-700">{jovem.dadosJovem?.projeto || "-"}</span>
//                       </div>
//                       <div className="flex items-start gap-2">
//                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
//                           Curso:
//                         </span>
//                         <span className="text-sm font-medium text-slate-700">{jovem.cursoTecnico?.nomeCurso || "-"}</span>
//                       </div>
//                       <div className="flex items-start gap-2">
//                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
//                           Vencto:
//                         </span>
//                         <span className="text-sm font-medium text-slate-700">
//                           {jovem.cursoTecnico?.diaVencimento || "-"}
//                         </span>
//                       </div>
//                       <div className="flex items-start gap-2">
//                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[70px]">
//                           Parcelas:
//                         </span>
//                         <span className="text-sm font-medium text-slate-700">
//                           {jovem.cursoTecnico?.quantidadeParcelas ?? "-"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="px-5 lg:px-6 py-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Valor</span>
//                       <DollarSign className="h-4 w-4 text-slate-400" />
//                     </div>
//                     <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
//                       R$ {calcularValorPagamento(jovem).toFixed(2).replace(".", ",")}
//                     </p>
//                   </div>

//                   <div className="p-5 lg:p-6 space-y-3">
//                     {!jovem.dataBoletoRecebido && (
//                       <button
//                         onClick={() => receberBoleto(jovem)}
//                         className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
//                       >
//                         <FileText className="h-4 w-4" />
//                         Receber Boleto
//                       </button>
//                     )}

//                     {(jovem.statusPagamento === "pendente" ||
//                       (jovem.dataBoletoRecebido && jovem.statusPagamento !== "pago")) && (
//                       <button
//                         onClick={() => marcarComoPago(jovem)}
//                         className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
//                       >
//                         <CheckCircle className="h-4 w-4" />
//                         Confirmar Pagamento
//                       </button>
//                     )}

//                     <div className="grid gap-3">
//                       <button
//                         onClick={() => entrarEmContatoWhatsApp(jovem)}
//                         className="px-10 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-sm hover:shadow-md transition-all"
//                       >
//                         <Users className="h-4 w-4" />
//                         Contato
//                       </button>
//                     </div>

//                     {jovem.statusPagamento === "pago" && (
//                       <div className="mt-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg p-4 border border-emerald-200">
//                         <div className="flex items-center justify-center gap-2 mb-2">
//                           <CheckCircle className="h-5 w-5 text-emerald-600" />
//                           <span className="text-emerald-800 font-bold text-sm uppercase tracking-wide">
//                             Pagamento Confirmado
//                           </span>
//                         </div>
//                         {jovem.dataRecebimento && (
//                           <p className="text-center text-xs text-emerald-700 font-semibold">
//                             {new Date(jovem.dataRecebimento).toLocaleDateString("pt-BR", {
//                               day: "2-digit",
//                               month: "long",
//                               year: "numeric",
//                             })}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         {/* Visualização: Tabela */}
//         {visualizacao === "tabela" && (
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="text-xs text-slate-500 uppercase tracking-wide">
//                     <th className="px-3 py-2">#</th>
//                     <th className="px-3 py-2">Nome</th>
//                     <th className="px-3 py-2">Projeto</th>
//                     <th className="px-3 py-2">Curso</th>
//                     <th className="px-3 py-2">Vencto</th>
//                     <th className="px-3 py-2">Parcelas</th>
//                     <th className="px-3 py-2">Valor</th>
//                     <th className="px-3 py-2">Status</th>
//                     <th className="px-3 py-2">Ações</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {jovensFiltrados.map((j, idx) => {
//                     const statusMeta = getStatusPagamentoMeta(j)
//                     const StatusIcon = statusMeta.icon
//                     return (
//                       <tr key={j.id} className="border-t border-slate-100">
//                         <td className="px-3 py-3 text-sm">{idx + 1}</td>
//                         <td className="px-3 py-3 text-sm font-medium">{j.dadosJovem?.nome || "-"}</td>
//                         <td className="px-3 py-3 text-sm">{j.dadosJovem?.projeto || "-"}</td>
//                         <td className="px-3 py-3 text-sm">{j.cursoTecnico?.nomeCurso || "-"}</td>
//                         <td className="px-3 py-3 text-sm">{j.cursoTecnico?.diaVencimento || "-"}</td>
//                         <td className="px-3 py-3 text-sm">{j.cursoTecnico?.quantidadeParcelas ?? "-"}</td>
//                         <td className="px-3 py-3 text-sm">R$ {calcularValorPagamento(j).toFixed(2).replace(".", ",")}</td>
//                         <td className="px-3 py-3 text-sm">
//                           <span className={`inline-flex items-center gap-2 px-2 py-1 rounded ${statusMeta.cor}`}>
//                             <StatusIcon className="h-3 w-3" />
//                             <span className="text-xs font-bold">{statusMeta.label}</span>
//                           </span>
//                         </td>
//                         <td className="px-3 py-3 text-sm space-x-2">
//                           <button
//                             onClick={() => entrarEmContatoWhatsApp(j)}
//                             className="px-2 py-1 rounded bg-emerald-500 text-white text-xs"
//                           >
//                             Contato
//                           </button>

//                           {!j.dataBoletoRecebido && (
//                             <button
//                               onClick={() => receberBoleto(j)}
//                               className="px-2 py-1 rounded bg-amber-500 text-white text-xs"
//                             >
//                               Receber Boleto
//                             </button>
//                           )}

//                           {(j.statusPagamento === "pendente" ||
//                             (j.dataBoletoRecebido && j.statusPagamento !== "pago")) && (
//                             <button
//                               onClick={() => marcarComoPago(j)}
//                               className="px-2 py-1 rounded bg-blue-600 text-white text-xs"
//                             >
//                               Confirmar
//                             </button>
//                           )}

//                           <input
//                             type="checkbox"
//                             checked={selecionados.includes(j.id)}
//                             onChange={() => toggleSelecionado(j.id)}
//                             disabled={j.statusPagamento !== "pendente"}
//                             className="ml-2"
//                           />
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mt-4 flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={selecionarTodosPendentes}
//                   className="px-3 py-2 bg-slate-100 rounded text-sm"
//                 >
//                   Selecionar todos pendentes
//                 </button>
//                 <button
//                   onClick={pagarEmLote}
//                   className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
//                 >
//                   Confirmar pagamentos selecionados
//                 </button>
//               </div>
//               <div className="text-sm text-slate-500">{selecionados.length} selecionados</div>
//             </div>
//           </div>
//         )}

//         {jovensFiltrados.length === 0 && (
//           <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
//               <CreditCard className="h-10 w-10 text-slate-400" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum registro encontrado</h3>
//             <p className="text-slate-600 max-w-md mx-auto">
//               Ajuste os filtros acima para visualizar diferentes resultados ou verifique se há dados cadastrados no
//               sistema.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import { useEffect, useState, useMemo } from "react"
import { ref, onValue, update, push, get } from "firebase/database"
import { db } from "../../../firebase"
import * as XLSX from "xlsx"
import { useNavigate } from "react-router-dom" // se estiver usando react-router

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
  Download,
  Table as TableIcon,
  Grid,
  ContrastIcon,
} from "lucide-react"

export default function PagamentosCards() {
  const [jovens, setJovens] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroUnificado, setFiltroUnificado] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroProjeto, setFiltroProjeto] = useState("todos")
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [selecionados, setSelecionados] = useState([])
  const [visualizacao, setVisualizacao] = useState("cards") // "cards" | "tabela"
  const navigate = useNavigate()

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

  // ---------- Funções de utilidade ----------
  const entrarEmContatoWhatsApp = (jovem) => {
    if (!jovem.dadosJovem?.telefone) {
      alert("Número de telefone não cadastrado para este jovem.")
      return
    }
    const numero = jovem.dadosJovem.telefone.replace(/\D/g, "")
    window.open(`https://wa.me/${numero}`, "_blank")
  }

  const getStatusPagamentoMeta = (jovem) => {
    if (jovem.statusPagamento === "pago")
      return { status: "pago", cor: "text-emerald-700 bg-emerald-50/80 border border-emerald-200/60", label: "Pago", icon: CheckCircle }
    if (jovem.statusPagamento === "pendente" || jovem.dataBoletoRecebido)
      return { status: "pendente", cor: "text-amber-700 bg-amber-50/80 border border-amber-200/60", label: "Pendente", icon: AlertCircle }
    if (!jovem.cursoTecnico?.diaVencimento)
      return { status: "nao_recebido", cor: "text-slate-600 bg-slate-50/80 border border-slate-200/60", label: "Aguardando", icon: Calendar }

    const hoje = new Date()
    const venc = new Date(jovem.cursoTecnico.diaVencimento)
    venc.setFullYear(hoje.getFullYear())
    const diasRestantes = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) return { status: "vencido", cor: "text-rose-700 bg-rose-50/80 border border-rose-200/60", label: "Vencido", icon: AlertCircle }
    if (diasRestantes <= 5) return { status: "desconto", cor: "text-blue-700 bg-blue-50/80 border border-blue-200/60", label: "Desconto", icon: DollarSign }
    return { status: "nao_recebido", cor: "text-slate-600 bg-slate-50/80 border border-slate-200/60", label: "Não recebido", icon: FileText }
  }

  const calcularValorPagamento = (jovem, referenciaData = new Date()) => {
    const valorOriginal = Number.parseFloat(jovem.cursoTecnico?.valorMensalidade || 0)
    if (!jovem.cursoTecnico?.diaVencimento) return valorOriginal

    const venc = new Date(jovem.cursoTecnico.diaVencimento)
    venc.setFullYear(referenciaData.getFullYear())
    const diasRestantes = Math.ceil((venc - referenciaData) / (1000 * 60 * 60 * 24))

    return diasRestantes >= 5 ? Number((valorOriginal * 0.9).toFixed(2)) : Number(valorOriginal.toFixed(2))
  }

  const calcularNovaQuantidadeParcelas = (jovem) => {
    const qAtual = Number.parseInt(jovem.cursoTecnico?.quantidadeParcelas ?? jovem.cursoTecnico?.parcelas ?? 0) || 0
    return Math.max(qAtual - 1, 0)
  }

  // ---------- Funções de atualização ----------
  const verificarFimContrato = async (jovem) => {
    const novaQuantidadeParcelas = calcularNovaQuantidadeParcelas(jovem)
    if (novaQuantidadeParcelas === 0) {
      const hojeISO = new Date().toISOString()
      const jovemRef = ref(db, `jovens/${jovem.id}`)
      const jovemSnapshot = await get(jovemRef)

      if (jovemSnapshot.exists()) {
        const dadosJovem = jovemSnapshot.val()
        await push(ref(db, "fimContrato"), { ...dadosJovem, dataFimContrato: hojeISO })
        await update(ref(db, `jovens/${jovem.id}`), { ativo: false })
        setJovens((prev) => prev.filter((j) => j.id !== jovem.id))
      }
    }
  }

  const marcarComoPago = async (jovem) => {
    const hojeISO = new Date().toISOString()
    const valorPago = calcularValorPagamento(jovem, new Date())
    const parcelasPagas = (Number.parseInt(jovem.parcelasPagas) || 0) + 1
    const novaQuantidadeParcelas = calcularNovaQuantidadeParcelas(jovem)

    const atualizacao = {
      statusPagamento: "pago",
      parcelasPagas,
      valorPago,
      dataRecebimento: hojeISO,
      "cursoTecnico/parcelas": novaQuantidadeParcelas,
      "cursoTecnico/quantidadeParcelas": novaQuantidadeParcelas,
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
      await verificarFimContrato(jovem)
    } catch (err) {
      console.error("Erro ao marcar como pago:", err)
      alert("Ocorreu um erro ao confirmar pagamento.")
    }
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

  // ---------- Filtragem ----------
  const projetosUnicos = useMemo(() => {
    const setProjetos = new Set()
    jovens.forEach((j) => { if (j.dadosJovem?.projeto) setProjetos.add(j.dadosJovem.projeto) })
    return ["todos", ...Array.from(setProjetos)]
  }, [jovens])

  const jovensFiltrados = jovens.filter((j) => {
    const termo = filtroUnificado.toLowerCase()
    const matchTexto = (j.dadosJovem?.nome || "").toLowerCase().includes(termo)
      || (j.dadosJovem?.projeto || "").toLowerCase().includes(termo)
      || (j.cursoTecnico?.nomeCurso || "").toLowerCase().includes(termo)
    
    const status = getStatusPagamentoMeta(j).status
    const matchStatus = filtroStatus === "todos" || status === filtroStatus
    const matchProjeto = filtroProjeto === "todos" || (j.dadosJovem?.projeto || "") === filtroProjeto

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

    return matchTexto && matchStatus && matchProjeto && matchData
  })

  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) setSelecionados((prev) => prev.filter((i) => i !== id))
    else setSelecionados((prev) => [...prev, id])
  }

  // ---------- Exportar Excel ----------
  const exportarExcel = () => {
    if (!jovensFiltrados || jovensFiltrados.length === 0) {
      alert("Nenhum registro para exportar com os filtros aplicados.")
      return
    }
    const dadosParaExportar = jovensFiltrados.map((j) => {
      const statusMeta = getStatusPagamentoMeta(j)
      return {
        ID: j.id,
        Nome: j.dadosJovem?.nome || "-",
        Projeto: j.dadosJovem?.projeto || "-",
        Curso: j.cursoTecnico?.nomeCurso || "-",
        Vencto: j.cursoTecnico?.diaVencimento || "-",
        Parcelas_Restantes: j.cursoTecnico?.quantidadeParcelas ?? "-",
        Parcelas_Pagas: j.parcelasPagas ?? 0,
        Valor_atual: calcularValorPagamento(j).toFixed(2).replace(".", ","),
        Status: statusMeta.label,
        Telefone: j.dadosJovem?.telefone || "-",
        DataRecebimento: j.dataRecebimento ? new Date(j.dataRecebimento).toLocaleString("pt-BR") : "-",
      }
    })
    const ws = XLSX.utils.json_to_sheet(dadosParaExportar)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pagamentos")
    XLSX.writeFile(wb, `pagamentos_filtrados_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }



  // ---------- Render ----------
  if (loading) return (
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
        {/* Cabeçalho */}
        <div className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Gestão Financeira</h1>
            <p className="text-slate-600 text-base lg:text-lg">Controle e acompanhamento de pagamentos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm mr-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total de Registros</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{jovensFiltrados.length}</p>
            </div>
            <div className="inline-flex items-center gap-2">
              <button onClick={() => setVisualizacao("cards")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${visualizacao === "cards" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"}`}><Grid className="h-4 w-4" />Cards</button>
              <button onClick={() => setVisualizacao("tabela")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${visualizacao === "tabela" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"}`}><TableIcon className="h-4 w-4" />Tabela</button>
              <button onClick={exportarExcel} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white border-emerald-600 hover:brightness-95"><Download className="h-4 w-4" />Exportar Excel</button>
              <button onClick={() => navigate("/contrato-finalizado")} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white border-emerald-600 hover:brightness-95"><ContrastIcon className="h-4 w-4" />Contratos Finalizados</button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 lg:p-7 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg"><Filter className="h-5 w-5 text-blue-600" /></div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">Filtros Avançados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Busca Geral</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="text" placeholder="Nome, projeto, curso..." value={filtroUnificado} onChange={(e) => setFiltroUnificado(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer">
                <option value="todos">Todos os status</option>
                <option value="pago">✓ Pago</option>
                <option value="pendente">⏳ Pendente</option>
                <option value="vencido">⚠ Vencido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Projeto</label>
              <select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer">
                {projetosUnicos.map((p) => <option key={p} value={p}>{p === "todos" ? "Todos os projetos" : p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data Fim</label>
              <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"/>
            </div>
          </div>
        </div>

        {/* Lista de Jovens */}
        {visualizacao === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jovensFiltrados.map((j) => {
              const statusMeta = getStatusPagamentoMeta(j)
              return (
                <div key={j.id} className={`border ${statusMeta.cor} p-4 rounded-xl shadow-sm flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{j.dadosJovem?.nome}</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <statusMeta.icon className="h-4 w-4" /> {statusMeta.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">Projeto: {j.dadosJovem?.projeto || "-"}</p>
                  <p className="text-sm text-slate-700">Curso: {j.cursoTecnico?.nomeCurso || "-"}</p>
                  <p className="text-sm text-slate-700">Parcelas restantes: {j.cursoTecnico?.quantidadeParcelas ?? 0}</p>
                  <p className="text-sm text-slate-700">Valor atual: R$ {calcularValorPagamento(j).toFixed(2).replace(".", ",")}</p>
                  <div className="flex gap-2 mt-2">
                    {statusMeta.status !== "pago" && <button onClick={() => marcarComoPago(j)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm font-medium">Marcar Pago</button>}
                    {!j.dataBoletoRecebido && <button onClick={() => receberBoleto(j)} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm font-medium">Receber Boleto</button>}
                    <button onClick={() => entrarEmContatoWhatsApp(j)} className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm font-medium">WhatsApp</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 px-3 py-2">Selecionar</th>
                  <th className="border border-slate-300 px-3 py-2">Nome</th>
                  <th className="border border-slate-300 px-3 py-2">Projeto</th>
                  <th className="border border-slate-300 px-3 py-2">Curso</th>
                  <th className="border border-slate-300 px-3 py-2">Parcelas Restantes</th>
                  <th className="border border-slate-300 px-3 py-2">Parcelas Pagas</th>
                  <th className="border border-slate-300 px-3 py-2">Valor</th>
                  <th className="border border-slate-300 px-3 py-2">Status</th>
                  <th className="border border-slate-300 px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {jovensFiltrados.map((j) => {
                  const statusMeta = getStatusPagamentoMeta(j)
                  return (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-3 py-2 text-center">
                        <input type="checkbox" checked={selecionados.includes(j.id)} onChange={() => toggleSelecionado(j.id)} />
                      </td>
                      <td className="border border-slate-300 px-3 py-2">{j.dadosJovem?.nome}</td>
                      <td className="border border-slate-300 px-3 py-2">{j.dadosJovem?.projeto || "-"}</td>
                      <td className="border border-slate-300 px-3 py-2">{j.cursoTecnico?.nomeCurso || "-"}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{j.cursoTecnico?.quantidadeParcelas ?? 0}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{j.parcelasPagas ?? 0}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right">R$ {calcularValorPagamento(j).toFixed(2).replace(".", ",")}</td>
                      <td className={`border border-slate-300 px-3 py-2 text-center font-semibold ${statusMeta.cor}`}>{statusMeta.label}</td>
                      <td className="border border-slate-300 px-3 py-2 flex gap-2 justify-center">
                        {statusMeta.status !== "pago" && <button onClick={() => marcarComoPago(j)} className="px-2 py-1 bg-emerald-600 text-white rounded">Pagar</button>}
                        {!j.dataBoletoRecebido && <button onClick={() => receberBoleto(j)} className="px-2 py-1 bg-blue-600 text-white rounded">Boleto</button>}
                        <button onClick={() => entrarEmContatoWhatsApp(j)} className="px-2 py-1 bg-green-500 text-white rounded">WhatsApp</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
