"use client"

import { useEffect, useState } from "react"
import { ref, get, update } from "firebase/database"
import { db } from "../../../../firebase"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"
import { Search, Download, Grid3x3, Table2, Edit2, Save, X, User, MapPin, UserCheck, GraduationCap, ProjectorIcon } from "lucide-react"

const VisualizarJovensAvancado = () => {
  const [jovens, setJovens] = useState([])
  const [filteredJovens, setFilteredJovens] = useState([])
  const [selectedJovem, setSelectedJovem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filtroProjeto, setFiltroProjeto] = useState("todos")
  const [filtroContrato, setFiltroContrato] = useState("todos")
  const [filtroIdade, setFiltroIdade] = useState("todos")
  const [viewMode, setViewMode] = useState("card") // "card" or "table"
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState(null)
  const [saving, setSaving] = useState(false)

  // Busca todos os jovens
  useEffect(() => {
    const fetchJovens = async () => {
      try {setLoading(true);
        const snapshot = await get(ref(db, "jovens"))
        if (snapshot.exists()) {
          const data = snapshot.val()
          const arrayData = Object.keys(data).map((key) => ({ id: key, ...data[key] }))
          setJovens(arrayData); setFilteredJovens(arrayData)
        } else {setJovens([]); setFilteredJovens([])}
      } catch (err) {console.error(err); setError("Erro ao buscar dados dos jovens")
      } finally {setLoading(false)}
    }
    fetchJovens();
  }, [])

  // Aplica filtros e busca
  useEffect(() => {
    let temp = [...jovens]
    // Busca por nome ou CPF
    if (search.trim()) {const lowerSearch = search.toLowerCase()
      temp = temp.filter((jovem) => jovem.dadosJovem.nome.toLowerCase().includes(lowerSearch) || jovem.dadosJovem.cpf.toLowerCase().includes(lowerSearch),)
    }
    // Filtro por projeto
    if (filtroProjeto !== "todos") {temp = temp.filter((jovem) => jovem.dadosJovem.projeto === filtroProjeto)}
    // Filtro por tipo de contrato
    if (filtroContrato !== "todos") {temp = temp.filter((jovem) => jovem.cursoTecnico.tipoContrato === filtroContrato)}
    // Filtro por idade
    if (filtroIdade !== "todos") {
      if (filtroIdade === "menor18") temp = temp.filter((jovem) => Number(jovem.dadosJovem.idade) < 18)
      else if (filtroIdade === "18a25")
        temp = temp.filter((jovem) => Number(jovem.dadosJovem.idade) >= 18 && Number(jovem.dadosJovem.idade) <= 25)
      else if (filtroIdade === "maior25") temp = temp.filter((jovem) => Number(jovem.dadosJovem.idade) > 25)
    }
    setFilteredJovens(temp)
  }, [search, filtroProjeto, filtroContrato, filtroIdade, jovens])

  const formatPhone = (phone) => {if (!phone) return ""; return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
  const formatCurrency = (value) => {if (!value) return "R$ 0,00"; return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
  const formatCEP = (cep) => {if (!cep) return ""; return cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
  const handleSelectJovem = (jovem) => {setSelectedJovem(jovem); setEditedData(JSON.parse(JSON.stringify(jovem))); setIsModalOpen(true); setIsEditing(false);}
  const handleEditToggle = () => {if (isEditing) {setEditedData(JSON.parse(JSON.stringify(selectedJovem)))} setIsEditing(!isEditing);}  

  const handleSave = async () => {
    try {setSaving(true)
      const { id, ...dataToSave } = editedData; await update(ref(db, `jovens/${id}`), dataToSave)
      // Update local state
      const updatedJovens = jovens.map((j) => (j.id === id ? editedData : j))
      setJovens(updatedJovens); setSelectedJovem(editedData); setIsEditing(false); } 
    catch (err) {console.error("Erro ao salvar:", err); alert("Erro ao salvar alterações")} finally {setSaving(false)}
  }

  const updateEditedField = (section, field, value, subsection = null) => {
    setEditedData((prev) => {
      const newData = { ...prev }
      if (subsection) {
        newData[section] = {...newData[section],
        [subsection]: {...newData[section][subsection],[field]: value,},}
      } else {newData[section] = {...newData[section],[field]: value,}}
      return newData
    })
  }

  // Formata para exibição DD/MM/YYYY
  const formatDataDisplay = (data) => {
      if (!data) return "--";
      try {const d = new Date(data); const day = String(d.getUTCDate()).padStart(2, "0");
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const year = d.getUTCFullYear(); return `${day}/${month}/${year}`;} 
      catch {return "--";}
  }

  // Formata para input type="date" YYYY-MM-DD
  const formatDataInput = (data) => {
      if (!data) return "--";
      try {const d = new Date(data); const day = String(d.getUTCDate()).padStart(2, "0"); 
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const year = d.getUTCFullYear();
        return `${day}/${month}/${year}`;
      } catch {return "--";}
  }

  // Função para formatar CPF
  const formatCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, "");
   if (numbers.length !== 11) return cpf; return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  // Função para formatar data de nascimento
  const formatData = (data) => {
    if (!data) return ""
    const d = new Date(data); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  // Função para capitalizar curso técnico
  const formatCurso = (curso) => {
    if (!curso) return ""
    return curso
      .toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

const exportExcel = () => {
  const wb = XLSX.utils.book_new()

  const criarAba = (nomeProjeto) => {
    const data = jovens
      .filter((j) => nomeProjeto === "Todos" || j.dadosJovem.projeto === nomeProjeto)
      .map((j) => ({
        Nome: j.dadosJovem.nome,
        CPF: formatCPF(j.dadosJovem.cpf),
        RG: j.dadosJovem.rg,
        Telefone: j.dadosJovem.telefone,
        Email: j.dadosJovem.email,
        "Data Nascimento": formatData(j.dadosJovem.dataNascimento),
        Idade: j.dadosJovem.idade,
        Projeto: j.dadosJovem.projeto,
        Observações: j.dadosJovem.observacoes || "",
        "Curso Técnico": formatCurso(j.cursoTecnico.nomeCurso),
        "Escola Técnica": j.cursoTecnico.escolaTecnica,
        "Tipo Contrato": j.cursoTecnico.tipoContrato,
        Turno: j.cursoTecnico.turno || "",
        "Ano Início": j.cursoTecnico.anoInicio || "",
        "Ano Conclusão": j.cursoTecnico.anoConclusao || "",
        "Valor Curso": j.cursoTecnico.valorCurso || "",
        Mensalidade: j.cursoTecnico.valorMensalidade || "",
        "Dia Vencimento": j.cursoTecnico.diaVencimento || "",
        "Responsável Nome": j.dadosResponsavel.nome,
        "Responsável CPF": formatCPF(j.dadosResponsavel.cpf),
        "Responsável RG": j.dadosResponsavel.rg,
        "Responsável Telefone": j.dadosResponsavel.telefone,
        "Responsável Email": j.dadosResponsavel.email,
      }))
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, nomeProjeto)
  }; criarAba("Todos"); criarAba("CONDECA"); criarAba("INSTITUTO RECICLAR");
  XLSX.writeFile(wb, "Jovens_Cadastrados.xlsx")
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Jovens</h1>
          <p className="text-slate-600">Visualize, filtre e gerencie os dados dos jovens cadastrados</p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <Select value={filtroProjeto} onValueChange={setFiltroProjeto}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Projetos</SelectItem>
                  <SelectItem value="CONDECA">CONDECA</SelectItem>
                  <SelectItem value="INSTITUTO RECICLAR">INSTITUTO RECICLAR</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroContrato} onValueChange={setFiltroContrato}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Contratos</SelectItem>
                  <SelectItem value="bolsa">Bolsa</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroIdade} onValueChange={setFiltroIdade}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Idade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Idades</SelectItem>
                  <SelectItem value="menor18">Menor que 18</SelectItem>
                  <SelectItem value="18a25">18 a 25 anos</SelectItem>
                  <SelectItem value="maior25">Maior que 25</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className="h-9"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-9"
                >
                  <Table2 className="h-4 w-4 mr-2" />
                  Tabela
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {filteredJovens.length} {filteredJovens.length === 1 ? "jovem encontrado" : "jovens encontrados"}
                </span>
                <Button onClick={exportExcel} className="h-9 bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredJovens.length === 0 && (
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-slate-600 text-center py-8">Nenhum jovem encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        )}

        {/* Card View */}
        {!loading && filteredJovens.length > 0 && viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJovens.map((jovem) => (
              <Card
                key={jovem.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-blue-300"
                onClick={() => handleSelectJovem(jovem)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">{jovem.dadosJovem.nome}</h3>
                      <p className="text-sm text-slate-600">{formatCPF(jovem.dadosJovem.cpf)}</p>
                    </div>
                    <Badge variant={jovem.cursoTecnico.tipoContrato === "bolsa" ? "default" : "secondary"}>
                      {jovem.cursoTecnico.tipoContrato === "bolsa" ? "Bolsa" : "Pago"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-slate-600">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      {jovem.dadosJovem.idade} anos
                    </div>
                    <div className="flex items-center text-slate-600">
                      <GraduationCap className="h-4 w-4 mr-2 text-slate-400" />
                      {jovem.cursoTecnico.nomeCurso}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <ProjectorIcon className="h-4 w-4 mr-2 text-slate-400" />
                      {jovem.dadosJovem.projeto}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && filteredJovens.length > 0 && viewMode === "table" && (
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Idade</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Projeto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Curso</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contrato</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredJovens.map((jovem) => (
                      <tr key={jovem.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleSelectJovem(jovem)}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-slate-900">{jovem.dadosJovem.nome}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatCPF(jovem.dadosJovem.cpf)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{jovem.dadosJovem.idade} anos</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{jovem.dadosJovem.projeto}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{jovem.cursoTecnico.nomeCurso}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><Badge variant={jovem.cursoTecnico.tipoContrato === "bolsa" ? "default" : "secondary"}>
                          {jovem.cursoTecnico.tipoContrato === "bolsa" ? "Bolsa" : "Pago"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal for Details and Editing */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-slate-900">{isEditing ? "Editar Dados" : "Detalhes do Jovem"}</DialogTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                        <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar"}</Button>
                      <Button onClick={handleEditToggle} variant="outline"><X className="h-4 w-4 mr-2" />Cancelar</Button>
                    </> ) : (<Button onClick={handleEditToggle} variant="outline"><Edit2 className="h-4 w-4 mr-2" />Editar</Button>)}
                </div>
              </div>
            </DialogHeader>

            {selectedJovem && editedData && (
              <Tabs defaultValue="dados-jovem" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dados-jovem"><User className="h-4 w-4 mr-2" />Jovem</TabsTrigger>
                  <TabsTrigger value="endereco"><MapPin className="h-4 w-4 mr-2" />Endereço</TabsTrigger>
                  <TabsTrigger value="responsavel"><UserCheck className="h-4 w-4 mr-2" />Responsável</TabsTrigger>
                  <TabsTrigger value="curso"><GraduationCap className="h-4 w-4 mr-2" />Curso</TabsTrigger>
                </TabsList>

                {/* Dados do Jovem Tab */}
                <TabsContent value="dados-jovem" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      {isEditing ? (<Input id="nome" value={editedData.dadosJovem.nome}
                      onChange={(e) => updateEditedField("dadosJovem", "nome", e.target.value)} className="mt-1"/>
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.nome}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      {isEditing ? (<Input id="cpf" value={editedData.dadosJovem.cpf}
                      onChange={(e) => updateEditedField("dadosJovem", "cpf", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatCPF(selectedJovem.dadosJovem.cpf)}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="rg">RG</Label>
                      {isEditing ? (<Input id="rg" value={editedData.dadosJovem.rg}
                      onChange={(e) => updateEditedField("dadosJovem", "rg", e.target.value)} className="mt-1"/>
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.rg}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      {isEditing ? (<Input id="telefone" value={editedData.dadosJovem.telefone}
                      onChange={(e) => updateEditedField("dadosJovem", "telefone", e.target.value)}className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatPhone(selectedJovem.dadosJovem.telefone)}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      {isEditing ? (<Input id="email" type="email" value={editedData.dadosJovem.email}
                      onChange={(e) => updateEditedField("dadosJovem", "email", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.email}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      {isEditing ? (<Input id="dataNascimento" type="date" value={formatDataInput(editedData.dadosJovem.dataNascimento)}
                      onChange={(e) => updateEditedField("dadosJovem", "dataNascimento", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatDataDisplay(selectedJovem.dadosJovem.dataNascimento)}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="idade">Idade</Label>
                      {isEditing ? (<Input id="idade" type="number" value={editedData.dadosJovem.idade}
                      onChange={(e) => updateEditedField("dadosJovem", "idade", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.idade} anos</p>)}
                    </div>

                    <div>
                      <Label htmlFor="projeto">Projeto</Label>
                      {isEditing ? (<Select value={editedData.dadosJovem.projeto} onValueChange={(value) => updateEditedField("dadosJovem", "projeto", value)}>
                       <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONDECA">CONDECA</SelectItem>
                            <SelectItem value="INSTITUTO RECICLAR">INSTITUTO RECICLAR</SelectItem>
                          </SelectContent>
                        </Select>) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.projeto}</p>)}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      {isEditing ? (<Input id="observacoes" value={editedData.dadosJovem.observacoes || ""}
                      onChange={(e) => updateEditedField("dadosJovem", "observacoes", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.observacoes || "Nenhuma observação"}</p>)}
                    </div>
                  </div>
                </TabsContent>

                {/* Endereço Tab */}
                <TabsContent value="endereco" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      {isEditing ? (<Input id="cep" value={editedData.dadosJovem.endereco.cep}
                      onChange={(e) => updateEditedField("dadosJovem", "cep", e.target.value, "endereco")} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatCEP(selectedJovem.dadosJovem.endereco.cep)}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="rua">Rua</Label>
                      {isEditing ? (<Input id="rua" value={editedData.dadosJovem.endereco.rua}
                      onChange={(e) => updateEditedField("dadosJovem", "rua", e.target.value, "endereco")} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.endereco.rua}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="numero">Número</Label>
                      {isEditing ? (<Input id="numero" value={editedData.dadosJovem.endereco.numero}
                      onChange={(e) => updateEditedField("dadosJovem", "numero", e.target.value, "endereco")} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.endereco.numero}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      {isEditing ? (<Input id="complemento" value={editedData.dadosJovem.endereco.complemento || ""}
                      onChange={(e) => updateEditedField("dadosJovem", "complemento", e.target.value, "endereco")} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.endereco.complemento || "Nenhum"}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      {isEditing ? (
                      <Input id="cidade" value={editedData.dadosJovem.endereco.cidade}
                      onChange={(e) => updateEditedField("dadosJovem", "cidade", e.target.value, "endereco")} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.endereco.cidade}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      {isEditing ? (<Input id="estado" value={editedData.dadosJovem.endereco.estado}
                      onChange={(e) => updateEditedField("dadosJovem", "estado", e.target.value, "endereco")} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosJovem.endereco.estado}</p>)}
                    </div>
                  </div>
                </TabsContent>

                {/* Responsável Tab */}
                <TabsContent value="responsavel" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resp-nome">Nome Completo</Label>
                      {isEditing ? (
                      <Input id="resp-nome" value={editedData.dadosResponsavel.nome}
                      onChange={(e) => updateEditedField("dadosResponsavel", "nome", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosResponsavel.nome}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="resp-cpf">CPF</Label>
                      {isEditing ? (<Input id="resp-cpf" value={editedData.dadosResponsavel.cpf}
                      onChange={(e) => updateEditedField("dadosResponsavel", "cpf", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatCPF(selectedJovem.dadosResponsavel.cpf)}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="resp-rg">RG</Label>
                      {isEditing ? (<Input id="resp-rg" value={editedData.dadosResponsavel.rg}
                      onChange={(e) => updateEditedField("dadosResponsavel", "rg", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosResponsavel.rg}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="resp-telefone">Telefone</Label>
                      {isEditing ? (<Input id="resp-telefone" value={editedData.dadosResponsavel.telefone} 
                      onChange={(e) => updateEditedField("dadosResponsavel", "telefone", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatPhone(selectedJovem.dadosResponsavel.telefone)}</p>)}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="resp-email">E-mail</Label>
                      {isEditing ? (<Input id="resp-email" type="email" value={editedData.dadosResponsavel.email}
                      onChange={(e) => updateEditedField("dadosResponsavel", "email", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.dadosResponsavel.email}</p>)}
                    </div>
                  </div>
                </TabsContent>

                {/* Curso Tab */}
                <TabsContent value="curso" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomeCurso">Nome do Curso</Label>
                      {isEditing ? (<Input id="nomeCurso" value={editedData.cursoTecnico.nomeCurso}
                      onChange={(e) => updateEditedField("cursoTecnico", "nomeCurso", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.cursoTecnico.nomeCurso}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="escolaTecnica">Escola Técnica</Label>
                      {isEditing ? (<Input id="escolaTecnica" value={editedData.cursoTecnico.escolaTecnica}
                      onChange={(e) => updateEditedField("cursoTecnico", "escolaTecnica", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.cursoTecnico.escolaTecnica}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                      {isEditing ? (
                        <Select value={editedData.cursoTecnico.tipoContrato} onValueChange={(value) => updateEditedField("cursoTecnico", "tipoContrato", value)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bolsa">Bolsa</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (<p className="mt-1">
                      <Badge variant={selectedJovem.cursoTecnico.tipoContrato === "bolsa" ? "default" : "secondary"}>
                      {selectedJovem.cursoTecnico.tipoContrato === "bolsa" ? "Bolsa" : "Pago"}</Badge></p>)}
                    </div>

                    <div>
                      <Label htmlFor="turno">Turno</Label>
                      {isEditing ? (<Input id="turno" value={editedData.cursoTecnico.turno || ""}
                      onChange={(e) => updateEditedField("cursoTecnico", "turno", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{selectedJovem.cursoTecnico.turno || "Não informado"}</p>)}
                    </div>

                    {/* Ano de Início */}
                    <div>
                      <Label htmlFor="anoInicio">Ano de Início</Label>
                      {isEditing ? (<Input id="anoInicio" type="number" min="1900" max="2100" value={formatDataInput(editedData.cursoTecnico.anoInicio || "")}
                      onChange={(e) => updateEditedField("cursoTecnico", "anoInicio", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatDataDisplay(selectedJovem.cursoTecnico.anoInicio || "Não informado")}</p>)}
                    </div>

                    {/* Ano de Conclusão */}
                    <div>
                      <Label htmlFor="anoConclusao">Ano de Conclusão</Label>
                      {isEditing ? (<Input id="anoConclusao" type="number" min="1900" max="2100" value={formatDataInput(editedData.cursoTecnico.anoConclusao || "")}
                      onChange={(e) => updateEditedField("cursoTecnico", "anoConclusao", e.target.value)} className="mt-1" />
                      ) : (<p className="mt-1 text-slate-900 font-medium">{formatDataDisplay(selectedJovem.cursoTecnico.anoConclusao || "Não informado")}</p>)}
                    </div>

                    {(isEditing ? editedData.cursoTecnico.tipoContrato === "pago" : selectedJovem.cursoTecnico.tipoContrato === "pago") && (
                      <>
                        <div>
                          <Label htmlFor="valorCurso">Valor do Curso</Label>
                          {isEditing ? (<Input id="valorCurso" value={editedData.cursoTecnico.valorCurso || ""} 
                          onChange={(e) => updateEditedField("cursoTecnico", "valorCurso", e.target.value)} className="mt-1"
                          />) : (<p className="mt-1 text-slate-900 font-medium">{formatCurrency(selectedJovem.cursoTecnico.valorCurso)}</p>)}
                        </div>

                        <div>
                          <Label htmlFor="valorDesconto">Valor com Desconto</Label>
                          {isEditing ? (
                          <Input id="valorDesconto" value={editedData.cursoTecnico.valorDesconto || ""}
                          onChange={(e) => updateEditedField("cursoTecnico", "valorDesconto", e.target.value)} className="mt-1" />
                          ) : (<p className="mt-1 text-slate-900 font-medium">{formatCurrency(selectedJovem.cursoTecnico.valorDesconto)}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="valorMensalidade">Mensalidade</Label>
                          {isEditing ? (
                          <Input id="valorMensalidade" value={editedData.cursoTecnico.valorMensalidade || ""}
                          onChange={(e) => updateEditedField("cursoTecnico", "valorMensalidade", e.target.value)} className="mt-1" />
                          ) : (<p className="mt-1 text-slate-900 font-medium">{formatCurrency(selectedJovem.cursoTecnico.valorMensalidade)}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                          {isEditing ? (<Input id="diaVencimento" type="number" min="1" max="31" value={editedData.cursoTecnico.diaVencimento || ""}
                          onChange={(e) => updateEditedField("cursoTecnico", "diaVencimento", e.target.value)} className="mt-1" />
                          ) : (<p className="mt-1 text-slate-900 font-medium">Dia {selectedJovem.cursoTecnico.diaVencimento}</p>)}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default VisualizarJovensAvancado
