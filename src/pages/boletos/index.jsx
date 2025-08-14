"use client"

import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../../../firebase"
import * as XLSX from "xlsx"
import {
  Search,
  Calendar,
  Download,
  ArrowLeft,
  Filter,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  School,
} from "lucide-react"

export default function TabelaBoletos() {
  const [boletos, setBoletos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroUnificado, setFiltroUnificado] = useState("")
  const [vencInicio, setVencInicio] = useState("")
  const [vencFim, setVencFim] = useState("")
  const [recInicio, setRecInicio] = useState("")
  const [recFim, setRecFim] = useState("")
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    const boletosRef = ref(db, "boletos")
    onValue(
      boletosRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const dados = Object.values(snapshot.val())
          setBoletos(dados)
        } else {
          setBoletos([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Erro ao buscar boletos:", error)
        setLoading(false)
      },
    )
  }, [])

  const formatarData = (data) => {
    if (!data) return "N/A"
    const d = new Date(data)
    return d.toLocaleDateString("pt-BR")
  }

  const formatarValor = (valor) => {
    if (valor === undefined) return "N/A"
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const getStatusBoleto = (vencimento, recebimento) => {
    if (recebimento) return { status: "pago", cor: "text-green-600 bg-green-50", label: "Pago" }

    const hoje = new Date()
    const dataVenc = new Date(vencimento)

    if (dataVenc < hoje) return { status: "vencido", cor: "text-red-600 bg-red-50", label: "Vencido" }

    const diasRestantes = Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24))
    if (diasRestantes <= 7) return { status: "vencendo", cor: "text-yellow-600 bg-yellow-50", label: "Vence em breve" }

    return { status: "pendente", cor: "text-blue-600 bg-blue-50", label: "Pendente" }
  }

  const exportarParaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(boletosFiltrados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Boletos")
    XLSX.writeFile(wb, "boletos.xlsx")
  }

  const boletosFiltrados = boletos.filter((b) => {
    const termo = filtroUnificado.toLowerCase()
    const vencimento = new Date(b.dataVencimento)
    const recebimento = new Date(b.dataRecebimento)

    return (
      (b.nomeJovem?.toLowerCase().includes(termo) ||
        b.turma?.toLowerCase().includes(termo) ||
        b.escolaTecnica?.toLowerCase().includes(termo) ||
        b.cursoTecnico?.toLowerCase().includes(termo) ||
        b.projeto?.toLowerCase().includes(termo) ||
        b.emailResponsavel?.toLowerCase().includes(termo)) &&
      (!vencInicio || vencimento >= new Date(vencInicio)) &&
      (!vencFim || vencimento <= new Date(vencFim)) &&
      (!recInicio || recebimento >= new Date(recInicio)) &&
      (!recFim || recebimento <= new Date(recFim))
    )
  })

  const estatisticas = {
    total: boletosFiltrados.length,
    pagos: boletosFiltrados.filter((b) => b.dataRecebimento).length,
    vencidos: boletosFiltrados.filter((b) => !b.dataRecebimento && new Date(b.dataVencimento) < new Date()).length,
    valorTotal: boletosFiltrados.reduce((acc, b) => acc + (Number(b.valorParcela) || 0), 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando boletos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Boletos</h1>
                <p className="text-gray-600">Controle e acompanhamento de pagamentos</p>
              </div>
            </div>
            <a
              href="/home"
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Boletos</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.pagos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.vencidos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-purple-600">{formatarValor(estatisticas.valorTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              </div>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {mostrarFiltros ? "Ocultar" : "Mostrar"} Filtros
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Filtro Principal */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, turma, escola, curso, projeto ou email..."
                value={filtroUnificado}
                onChange={(e) => setFiltroUnificado(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtros Avançados */}
            {mostrarFiltros && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Vencimento - Início
                  </label>
                  <input
                    type="date"
                    value={vencInicio}
                    onChange={(e) => setVencInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Vencimento - Fim
                  </label>
                  <input
                    type="date"
                    value={vencFim}
                    onChange={(e) => setVencFim(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Recebimento - Início
                  </label>
                  <input
                    type="date"
                    value={recInicio}
                    onChange={(e) => setRecInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Recebimento - Fim
                  </label>
                  <input
                    type="date"
                    value={recFim}
                    onChange={(e) => setRecFim(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={exportarParaExcel}
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {boletosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Escola
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Recebimento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Projeto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {boletosFiltrados.map((boleto, index) => {
                    const status = getStatusBoleto(boleto.dataVencimento, boleto.dataRecebimento)
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cor}`}
                          >
                            {status.status === "pago" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {status.status === "vencido" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {status.status === "vencendo" && <Clock className="h-3 w-3 mr-1" />}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {boleto.nomeJovem?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{boleto.nomeJovem}</div>
                              <div className="text-sm text-gray-500">{formatarData(boleto.dataNascimento)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{boleto.turma}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <School className="h-4 w-4 mr-2 text-gray-400" />
                            {boleto.escolaTecnica}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{boleto.cursoTecnico}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatarValor(boleto.valorParcela)}</div>
                          <div className="text-sm text-gray-500">{boleto.totalParcelas} parcelas</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(boleto.dataVencimento)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {boleto.dataRecebimento ? formatarData(boleto.dataRecebimento) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{boleto.projeto}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum boleto encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros para encontrar os boletos desejados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
