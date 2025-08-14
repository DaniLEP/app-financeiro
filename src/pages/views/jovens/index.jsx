"use client"

import { useEffect, useState } from "react"
import { ref, onValue, update, remove } from "firebase/database"
import { db } from "../../../../firebase"
import * as XLSX from "xlsx"
import {
  Users,
  Search,
  Download,
  ArrowLeft,
  Edit3,
  Trash2,
  Filter,
  Calendar,
  Mail,
  MapPin,
  User,
  FileText,
  Grid3X3,
  List,
} from "lucide-react"

export default function ListaJovens() {
  const [jovens, setJovens] = useState([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [editingJovem, setEditingJovem] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    const jovensRef = ref(db, "cadastrodejovens")
    onValue(jovensRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setJovens([])
        setLoading(false)
        return
      }
      const listaOrdenada = Object.keys(data)
        .map((id) => ({ id, ...data[id] }))
        .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto))
      setJovens(listaOrdenada)
      setLoading(false)
    })
  }, [])

  const handleEdit = (jovem) => {
    setEditingJovem({ ...jovem })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (editingJovem) {
      update(ref(db, `cadastrodejovens/${editingJovem.id}`), editingJovem)
      setShowEditModal(false)
      setEditingJovem(null)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      remove(ref(db, `cadastrodejovens/${id}`))
    }
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(jovens)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Jovens")
    XLSX.writeFile(wb, "Lista_de_Jovens.xlsx")
  }

  const filteredData = jovens.filter((j) => {
    const termo = filter.toLowerCase()
    return (
      j.nomeCompleto?.toLowerCase().includes(termo) ||
      j.rg?.toLowerCase().includes(termo) ||
      j.cpf?.toLowerCase().includes(termo) ||
      j.responsavelFinanceiro?.toLowerCase().includes(termo)
    )
  })

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "JV"
    )
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando jovens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Lista de Jovens</h1>
              <p className="text-blue-100">Gerencie todos os jovens cadastrados</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-2xl font-bold">{jovens.length}</span>
            <p className="text-sm text-blue-100">Total</p>
          </div>
        </div>
      </div>

      {/* Dashboard de estatísticas */}
      <div className="p-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Jovens</p>
                <p className="text-3xl font-black text-indigo-600">{jovens.length}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Jovens Filtrados</p>
                <p className="text-3xl font-black text-purple-600">{filteredData.length}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Idade Média</p>
                <p className="text-3xl font-black text-green-600">
                  {jovens.length > 0
                    ? Math.round(jovens.reduce((acc, j) => acc + calculateAge(j.dataNascimento), 0) / jovens.length)
                    : 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Com Email</p>
                <p className="text-3xl font-black text-orange-600">{jovens.filter((j) => j.emailJovem).length}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controles e filtros */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, RG, CPF ou responsável..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "cards" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Exportar Excel
              </button>

              <a
                href="/home"
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar
              </a>
            </div>
          </div>
        </div>

        {/* Visualização em Cards */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((jovem) => (
              <div
                key={jovem.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                      {getInitials(jovem.nomeCompleto)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{jovem.nomeCompleto}</h3>
                      <p className="text-gray-500 text-sm">{calculateAge(jovem.dataNascimento)} anos</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>RG: {jovem.rg}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>CPF: {jovem.cpf}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{jovem.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{jovem.emailJovem || "Sem email"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(jovem)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(jovem.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visualização em Tabela */}
        {viewMode === "table" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Jovem</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Documentos</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Contato</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Responsável</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((jovem) => (
                    <tr key={jovem.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                            {getInitials(jovem.nomeCompleto)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{jovem.nomeCompleto}</p>
                            <p className="text-sm text-gray-500">
                              {calculateAge(jovem.dataNascimento)} anos •{" "}
                              {new Date(jovem.dataNascimento).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">RG: {jovem.rg}</p>
                          <p className="text-sm text-gray-600">CPF: {jovem.cpf}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 truncate max-w-48">{jovem.emailJovem || "Sem email"}</p>
                          <p className="text-sm text-gray-500 truncate max-w-48">{jovem.endereco}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">{jovem.responsavelFinanceiro}</p>
                          <p className="text-sm text-gray-500 truncate max-w-48">{jovem.emailResponsavel}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(jovem)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all transform hover:scale-105 flex items-center gap-1"
                          >
                            <Edit3 className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(jovem.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg transition-all transform hover:scale-105 flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum jovem encontrado</p>
                <p className="text-gray-400">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingJovem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Editar Jovem</h2>
              <p className="text-indigo-100">Atualize as informações do jovem</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={editingJovem.nomeCompleto || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, nomeCompleto: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RG</label>
                  <input
                    type="text"
                    value={editingJovem.rg || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, rg: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={editingJovem.cpf || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, cpf: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editingJovem.dataNascimento || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, dataNascimento: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={editingJovem.endereco || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, endereco: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsável Financeiro</label>
                  <input
                    type="text"
                    value={editingJovem.responsavelFinanceiro || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, responsavelFinanceiro: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email do Jovem</label>
                  <input
                    type="email"
                    value={editingJovem.emailJovem || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, emailJovem: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email do Responsável</label>
                  <input
                    type="email"
                    value={editingJovem.emailResponsavel || ""}
                    onChange={(e) => setEditingJovem({ ...editingJovem, emailResponsavel: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
