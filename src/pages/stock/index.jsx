// "use client"

// import { useEffect, useState } from "react"
// import { db } from "../../../firebase"
// import { ref, onValue } from "firebase/database"
// import * as XLSX from "xlsx"
// import {
//   Search,
//   Download,
//   Users,
//   GraduationCap,
//   Calendar,
//   DollarSign,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   Filter,
//   Grid,
//   List,
// } from "lucide-react"

// export default function JovensTableImproved() {
//   const [jovens, setJovens] = useState([])
//   const [filtro, setFiltro] = useState("")
//   const [filtroTurma, setFiltroTurma] = useState("")
//   const [filtroEscola, setFiltroEscola] = useState("")
//   const [viewMode, setViewMode] = useState("table")
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const jovensRef = ref(db, "estoqueJovens")
//     onValue(jovensRef, (snapshot) => {
//       const dados = snapshot.val()
//       if (!dados) {
//         setJovens([])
//         setLoading(false)
//         return
//       }
//       const lista = Object.entries(dados)
//         .map(([key, jovem]) => ({ id: key, ...jovem }))
//         .sort((a, b) => (a.nomeJovem || "").localeCompare(b.nomeJovem || "", "pt-BR"))
//       setJovens(lista)
//       setLoading(false)
//     })
//   }, [])

//   const formatarData = (data) => {
//     if (!data) return "-"
//     return new Date(data).toLocaleDateString("pt-BR")
//   }

//   const formatarMoeda = (valor) =>
//     new Intl.NumberFormat("pt-BR", {
//       style: "currency",
//       currency: "BRL",
//     }).format(valor)

//   const isProximoVencimento = (dataVencimento) => {
//     const hoje = new Date()
//     const vencimento = new Date(dataVencimento)
//     const diffDias = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24))
//     return diffDias <= 5 && diffDias >= 0
//   }

//   const isVencido = (dataVencimento) => {
//     const hoje = new Date()
//     const vencimento = new Date(dataVencimento)
//     return vencimento < hoje
//   }

//   const getStatusVencimento = (dataVencimento) => {
//     if (isVencido(dataVencimento)) return { status: "vencido", color: "red", icon: AlertTriangle }
//     if (isProximoVencimento(dataVencimento)) return { status: "proximo", color: "yellow", icon: Clock }
//     return { status: "ok", color: "green", icon: CheckCircle }
//   }

//   const exportarParaExcel = () => {
//     if (jovens.length === 0) {
//       alert("Não há dados para exportar.")
//       return
//     }
//     const dados = jovens.map((j) => ({
//       Nome: j.nomeJovem,
//       Turma: j.turma,
//       Escola: j.escolaTecnica,
//       Curso: j.cursoTecnico,
//       Nascimento: formatarData(j.dataNascimento),
//       Valor: formatarMoeda(j.valorCurso),
//       "Valor Desconto": formatarMoeda(j.valorDesconto),
//       Parcelas: j.numeroParcelas,
//       Vencimento: formatarData(j.vencimentoBoleto),
//       Email: j.emailResponsavel,
//     }))
//     const ws = XLSX.utils.json_to_sheet(dados)
//     const wb = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(wb, ws, "Jovens")
//     XLSX.writeFile(wb, `Jovens_${new Date().toLocaleDateString("pt-BR")}.xlsx`)
//   }

//   const jovensFiltrados = jovens.filter((j) => {
//     const termo = filtro.toLowerCase()
//     const matchNome =
//       j.nomeJovem?.toLowerCase().includes(termo) ||
//       j.status?.toLowerCase().includes(termo) ||
//       j.projeto?.toLowerCase().includes(termo)
//     const matchTurma = !filtroTurma || j.turma === filtroTurma
//     const matchEscola = !filtroEscola || j.escolaTecnica === filtroEscola
//     return matchNome && matchTurma && matchEscola
//   })

//   const turmasUnicas = [...new Set(jovens.map((j) => j.turma).filter(Boolean))]
//   const escolasUnicas = [...new Set(jovens.map((j) => j.escolaTecnica).filter(Boolean))]

//   const estatisticas = {
//     total: jovens.length,
//     vencidos: jovens.filter((j) => isVencido(j.vencimentoBoleto)).length,
//     proximoVencimento: jovens.filter((j) => isProximoVencimento(j.vencimentoBoleto)).length,
//     valorTotal: jovens.reduce((acc, j) => acc + (j.valorCurso || 0), 0),
//   }

//   const getInitials = (nome) => {
//     if (!nome) return "?"
//     return nome
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .substring(0, 2)
//       .toUpperCase()
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Carregando dados dos jovens...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
//       {/* Header com Estatísticas */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-black text-gray-900 mb-2">Gestão de Jovens</h1>
//             <p className="text-gray-600">Acompanhe o progresso e informações dos jovens cadastrados</p>
//           </div>
//           <div className="flex items-center gap-2 mt-4 md:mt-0">
//             <button
//               onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               {viewMode === "table" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
//               {viewMode === "table" ? "Cards" : "Tabela"}
//             </button>
//             <button
//               onClick={exportarParaExcel}
//               className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
//             >
//               <Download className="w-4 h-4" />
//               Exportar Excel
//             </button>
//           </div>
//         </div>

//         {/* Cards de Estatísticas */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total de Jovens</p>
//                 <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-full">
//                 <Users className="w-6 h-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Vencidos</p>
//                 <p className="text-2xl font-bold text-red-600">{estatisticas.vencidos}</p>
//               </div>
//               <div className="p-3 bg-red-100 rounded-full">
//                 <AlertTriangle className="w-6 h-6 text-red-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Próx. Vencimento</p>
//                 <p className="text-2xl font-bold text-yellow-600">{estatisticas.proximoVencimento}</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-full">
//                 <Clock className="w-6 h-6 text-yellow-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Valor Total</p>
//                 <p className="text-2xl font-bold text-green-600">{formatarMoeda(estatisticas.valorTotal)}</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-full">
//                 <DollarSign className="w-6 h-6 text-green-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filtros Avançados */}
//         <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Filter className="w-5 h-5 text-gray-600" />
//             <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Buscar por nome, status ou projeto..."
//                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 value={filtro}
//                 onChange={(e) => setFiltro(e.target.value)}
//               />
//             </div>
//             <select
//               className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               value={filtroTurma}
//               onChange={(e) => setFiltroTurma(e.target.value)}
//             >
//               <option value="">Todas as Turmas</option>
//               {turmasUnicas.map((turma) => (
//                 <option key={turma} value={turma}>
//                   {turma}
//                 </option>
//               ))}
//             </select>
//             <select
//               className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               value={filtroEscola}
//               onChange={(e) => setFiltroEscola(e.target.value)}
//             >
//               <option value="">Todas as Escolas</option>
//               {escolasUnicas.map((escola) => (
//                 <option key={escola} value={escola}>
//                   {escola}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Conteúdo Principal */}
//       {viewMode === "cards" ? (
//         // View em Cards
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {jovensFiltrados.length === 0 ? (
//             <div className="col-span-full text-center py-12">
//               <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg">Nenhum jovem encontrado</p>
//             </div>
//           ) : (
//             jovensFiltrados.map((jovem) => {
//               const statusVenc = getStatusVencimento(jovem.vencimentoBoleto)
//               const StatusIcon = statusVenc.icon

//               return (
//                 <div
//                   key={jovem.id}
//                   className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
//                         {getInitials(jovem.nomeJovem)}
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-gray-900">{jovem.nomeJovem || "Nome não informado"}</h3>
//                         <p className="text-sm text-gray-600">{jovem.turma || "Turma não informada"}</p>
//                       </div>
//                     </div>
//                     <div className={`p-2 rounded-full bg-${statusVenc.color}-100`}>
//                       <StatusIcon className={`w-4 h-4 text-${statusVenc.color}-600`} />
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex items-center gap-2">
//                       <GraduationCap className="w-4 h-4 text-gray-400" />
//                       <span className="text-sm text-gray-600">{jovem.escolaTecnica || "Escola não informada"}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       <span className="text-sm text-gray-600">Venc: {formatarData(jovem.vencimentoBoleto)}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <DollarSign className="w-4 h-4 text-gray-400" />
//                       <span className="text-sm text-gray-600">{formatarMoeda(jovem.valorCurso)}</span>
//                     </div>
//                   </div>

//                   <div className="mt-4 pt-4 border-t border-gray-100">
//                     <div className="flex justify-between text-xs text-gray-500">
//                       <span>Parcelas: {jovem.numeroParcelas || "N/A"}</span>
//                       <span>Curso: {jovem.cursoTecnico || "N/A"}</span>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })
//           )}
//         </div>
//       ) : (
//         // View em Tabela
//         <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                 <tr>
//                   {[
//                     "Jovem",
//                     "Turma",
//                     "Escola",
//                     "Curso",
//                     "Nascimento",
//                     "Valor",
//                     "Valor c/ Desconto",
//                     "Parcelas",
//                     "Vencimento",
//                     "Email",
//                   ].map((head) => (
//                     <th
//                       key={head}
//                       className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
//                     >
//                       {head}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {jovensFiltrados.length === 0 ? (
//                   <tr>
//                     <td colSpan="10" className="text-center py-12">
//                       <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                       <p className="text-gray-500 text-lg">Nenhum registro encontrado</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   jovensFiltrados.map((jovem) => {
//                     const statusVenc = getStatusVencimento(jovem.vencimentoBoleto)
//                     const StatusIcon = statusVenc.icon

//                     return (
//                       <tr
//                         key={jovem.id}
//                         className={`hover:bg-gray-50 transition-colors ${
//                           statusVenc.status === "vencido"
//                             ? "bg-red-50"
//                             : statusVenc.status === "proximo"
//                               ? "bg-yellow-50"
//                               : ""
//                         }`}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                               {getInitials(jovem.nomeJovem)}
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">{jovem.nomeJovem || "-"}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{jovem.turma || "-"}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                           {jovem.escolaTecnica || "-"}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                           {jovem.cursoTecnico || "-"}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                           {formatarData(jovem.dataNascimento)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {formatarMoeda(jovem.valorCurso)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
//                           {formatarMoeda(jovem.valorDesconto)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                           {jovem.numeroParcelas || "-"}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <StatusIcon className={`w-4 h-4 text-${statusVenc.color}-600`} />
//                             <span className="text-sm text-gray-600">{formatarData(jovem.vencimentoBoleto)}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                           {jovem.emailResponsavel || "-"}
//                         </td>
//                       </tr>
//                     )
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
