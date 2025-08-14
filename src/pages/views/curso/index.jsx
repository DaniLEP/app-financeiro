"use client"

import { useEffect, useState } from "react"
import { db } from "../../../../firebase" // seu firebase.js seguro
import { ref, onValue, update, remove } from "firebase/database"
import * as XLSX from "xlsx"
import {
  GraduationCap,
  School,
  Search,
  Download,
  Home,
  Edit3,
  Trash2,
  BookOpen,
  TrendingUp,
  X,
  Check,
} from "lucide-react"

export default function ListaCursosTecnicos() {
  const [cursos, setCursos] = useState([])
  const [filter, setFilter] = useState("")
  const [viewMode, setViewMode] = useState("cards")
  const [editingCurso, setEditingCurso] = useState(null)
  const [editForm, setEditForm] = useState({
    nomeCurso: "",
    escolaId: "",
    nomeEscola: "",
    enderecoEscola: "",
    cidadeEscola: "",
    estadoEscola: "",
    telefoneEscola: "",
  })

  useEffect(() => {
    const cursosRef = ref(db, "cursosTecnicos")
    const escolasRef = ref(db, "cadastrodeescolatecnica")

    const unsubscribeCursos = onValue(cursosRef, (snapshot) => {
      const cursosData = snapshot.val() || {}

      onValue(escolasRef, (snapshotEscolas) => {
        const escolasData = snapshotEscolas.val() || {}

        const dataArray = Object.keys(cursosData).map((id) => {
          const curso = cursosData[id]
          const escola = escolasData[curso.escolaId] || {}
          return {
            id,
            nomeCurso: curso.nomeCurso || "",
            escolaId: curso.escolaId || "",
            nomeEscola: escola.nomeEscola || "",
            enderecoEscola: escola.endereco || "",
            cidadeEscola: escola.cidade || "",
            estadoEscola: escola.estado || "",
            telefoneEscola: escola.telefone || "",
          }
        })

        dataArray.sort((a, b) => (a.nomeCurso || "").localeCompare(b.nomeCurso || ""))
        setCursos(dataArray)
      })
    })

    return () => unsubscribeCursos()
  }, [])

  const handleEdit = (id, field, value) => {
    update(ref(db, `cursosTecnicos/${id}`), { [field]: value })
  }

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      remove(ref(db, `cursosTecnicos/${id}`))
    }
  }

  const openEditModal = (curso) => {
    setEditingCurso(curso)
    setEditForm({ ...curso })
  }

  const saveEdit = () => {
    handleEdit(editingCurso.id, "nomeCurso", editForm.nomeCurso)
    handleEdit(editingCurso.id, "escolaId", editForm.escolaId)
    setEditingCurso(null)
  }

  const filteredCursos = cursos.filter((c) => {
    const term = filter.toLowerCase()
    return (
      (c.nomeCurso || "").toLowerCase().includes(term) ||
      (c.nomeEscola || "").toLowerCase().includes(term)
    )
  })

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCursos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "CursosTecnicos")
    XLSX.writeFile(wb, "Lista_de_Cursos_Tecnicos.xlsx")
  }

  const getEscolaColor = (escola) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-teal-500 to-teal-600",
    ]
    const name = escola || ""
    const index = name.length % colors.length
    return colors[index]
  }

  const uniqueEscolas = [...new Set(cursos.map((c) => c.nomeEscola || ""))]
  const totalCursos = filteredCursos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Cursos Técnicos</h1>
              <p className="text-sm text-gray-600">Gerencie todos os cursos cadastrados</p>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = "/home")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
          >
            <Home className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Cursos */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-sm font-medium text-gray-600">Total de Cursos</p>
            <p className="text-3xl font-black text-blue-600">{totalCursos}</p>
          </div>
          {/* Escolas */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-sm font-medium text-gray-600">Escolas Parceiras</p>
            <p className="text-3xl font-black text-green-600">{uniqueEscolas.length}</p>
          </div>
          {/* Média */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-sm font-medium text-gray-600">Média por Escola</p>
            <p className="text-3xl font-black text-purple-600">
              {uniqueEscolas.length > 0 ? Math.round(totalCursos / uniqueEscolas.length) : 0}
            </p>
          </div>
        </div>

        {/* Filtros e ações */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por curso ou escola..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === "cards" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                }`}
              >
                Tabela
              </button>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCursos.map((curso) => (
              <div key={curso.id} className="bg-white/70 rounded-2xl p-6 border">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${getEscolaColor(
                      curso.nomeEscola
                    )} rounded-xl flex items-center justify-center`}
                  >
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(curso)}>
                      <Edit3 />
                    </button>
                    <button onClick={() => handleDelete(curso.id)}>
                      <Trash2 />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{curso.nomeCurso}</h3>
                <div className="text-sm text-gray-700">
                  <p>Escola: {curso.nomeEscola}</p>
                  <p>Endereço: {curso.enderecoEscola}</p>
                  <p>Cidade: {curso.cidadeEscola}</p>
                  <p>Estado: {curso.estadoEscola}</p>
                  <p>Telefone: {curso.telefoneEscola}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 rounded-2xl border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Escola</th>
                  <th>Endereço</th>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCursos.map((curso) => (
                  <tr key={curso.id}>
                    <td>{curso.nomeCurso}</td>
                    <td>{curso.nomeEscola}</td>
                    <td>{curso.enderecoEscola}</td>
                    <td>{curso.cidadeEscola}</td>
                    <td>{curso.estadoEscola}</td>
                    <td>{curso.telefoneEscola}</td>
                    <td>
                      <button onClick={() => openEditModal(curso)}>
                        <Edit3 />
                      </button>
                      <button onClick={() => handleDelete(curso.id)}>
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingCurso && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3>Editar Curso</h3>
              <input
                type="text"
                value={editForm.nomeCurso}
                onChange={(e) => setEditForm({ ...editForm, nomeCurso: e.target.value })}
                placeholder="Nome do curso"
              />
              <input
                type="text"
                value={editForm.nomeEscola}
                onChange={(e) => setEditForm({ ...editForm, nomeEscola: e.target.value })}
                placeholder="Nome da escola"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEditingCurso(null)}>Cancelar</button>
                <button onClick={saveEdit}>Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
