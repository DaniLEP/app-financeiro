"use client"

import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import { ref, onValue, update, remove } from "firebase/database"
import * as XLSX from "xlsx"
import {
  Building2,
  Search,
  Download,
  Home,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  FileText,
  Filter,
  Grid3X3,
  List,
  Eye,
  X,
  Check,
} from "lucide-react"

export default function ListaEscolasTecnicasImproved() {
  const [escolas, setEscolas] = useState([])
  const [filter, setFilter] = useState("")
  const [viewMode, setViewMode] = useState("cards")
  const [editingSchool, setEditingSchool] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    const escolasRef = ref(db, "cadastrodeescolatecnica")
    onValue(escolasRef, (snapshot) => {
      const data = snapshot.val() || {}
      const dataArray = Object.keys(data).map((id) => ({ id, ...data[id] }))
      dataArray.sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial))
      setEscolas(dataArray)
    })
  }, [])

  const handleEdit = (escola) => {
    setEditingSchool(escola)
    setEditForm(escola)
    setShowEditModal(true)
  }

  const saveEdit = () => {
    update(ref(db, `cadastrodeescolatecnica/${editingSchool.id}`), editForm)
    setShowEditModal(false)
    setEditingSchool(null)
  }

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta escola?")) {
      remove(ref(db, `cadastrodeescolatecnica/${id}`))
    }
  }

  const filteredEscolas = escolas.filter((e) => {
    const term = filter.toLowerCase()
    return (
      e.cnpj?.toLowerCase().includes(term) ||
      e.razaoSocial?.toLowerCase().includes(term) ||
      e.nomeFantasia?.toLowerCase().includes(term) ||
      e.endereco?.toLowerCase().includes(term)
    )
  })

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEscolas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "EscolasTecnicas")
    XLSX.writeFile(wb, "Lista_de_Escolas_Tecnicas.xlsx")
  }

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "ES"
    )
  }

  const formatCNPJ = (cnpj) => {
    return cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") || cnpj
  }

  const formatPhone = (phone) => {
    return phone?.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3") || phone
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Escolas Técnicas</h1>
                <p className="text-sm text-gray-600">Gerencie as escolas cadastradas</p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/home")}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Escolas</p>
                <p className="text-3xl font-black text-blue-600">{escolas.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtradas</p>
                <p className="text-3xl font-black text-green-600">{filteredEscolas.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualização</p>
                <p className="text-lg font-bold text-purple-600 capitalize">{viewMode}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                {viewMode === "cards" ? (
                  <Grid3X3 className="w-6 h-6 text-purple-600" />
                ) : (
                  <List className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold text-emerald-600">Ativo</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por CNPJ, Razão Social, Nome Fantasia ou Endereço..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === "cards" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Tabela</span>
                </button>
              </div>

              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEscolas.map((escola) => (
              <div
                key={escola.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {getInitials(escola.razaoSocial)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {escola.nomeFantasia || escola.razaoSocial}
                      </h3>
                      <p className="text-sm text-gray-600">{formatCNPJ(escola.cnpj)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{escola.razaoSocial}</span>
                  </div>

                  {escola.endereco && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{escola.endereco}</span>
                    </div>
                  )}

                  {escola.telefone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{formatPhone(escola.telefone)}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(escola)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(escola.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Escola</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">CNPJ</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Razão Social</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Endereço</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Telefone</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEscolas.map((escola) => (
                    <tr key={escola.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(escola.razaoSocial)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{escola.nomeFantasia}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCNPJ(escola.cnpj)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{escola.razaoSocial}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{escola.endereco}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatPhone(escola.telefone)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(escola)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(escola.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900">Editar Escola</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={editForm.cnpj || ""}
                    onChange={(e) => setEditForm({ ...editForm, cnpj: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social</label>
                  <input
                    type="text"
                    value={editForm.razaoSocial || ""}
                    onChange={(e) => setEditForm({ ...editForm, razaoSocial: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia</label>
                  <input
                    type="text"
                    value={editForm.nomeFantasia || ""}
                    onChange={(e) => setEditForm({ ...editForm, nomeFantasia: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={editForm.endereco || ""}
                    onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={editForm.telefone || ""}
                    onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
