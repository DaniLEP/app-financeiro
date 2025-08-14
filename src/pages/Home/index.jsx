import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  GraduationCap,
  Users,
  School,
  BookOpen,
  UserPlus,
  List,
  LogIn,
  FileText,
  CreditCard,
  ChevronRight,
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Zap,
} from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../../firebase" // Ajuste para o caminho do seu arquivo de configuração

export default function Home() {
  const [stats, setStats] = useState([
    { label: "Jovens Cadastrados", value: "0", icon: Users, color: "from-blue-500 to-cyan-500", change: "+0%", trend: "up" },
    { label: "Cursos Ativos", value: "0", icon: BookOpen, color: "from-emerald-500 to-teal-500", change: "+0", trend: "up" },
    { label: "Escolas Parceiras", value: "0", icon: School, color: "from-purple-500 to-pink-500", change: "+0", trend: "up" },
    { label: "Boletos Processados", value: "0", icon: Activity, color: "from-orange-500 to-red-500", change: "+0%", trend: "up" },
  ])

  const menuItems = [
    { label: "Cadastro de Escola Técnica", path: "/cadastroescolatecnica", icon: School, description: "Registre novas instituições de ensino técnico", category: "Cadastros", priority: "high", gradient: "from-blue-500 to-cyan-500" },
    { label: "Cadastro de Curso Técnico", path: "/cadastrocursotecnico", icon: BookOpen, description: "Adicione novos cursos técnicos disponíveis", category: "Cadastros", priority: "high", gradient: "from-purple-500 to-pink-500" },
    { label: "Cadastrar Jovens", path: "/cadastrojovem", icon: UserPlus, description: "Registre novos estudantes no sistema", category: "Cadastros", priority: "high", gradient: "from-emerald-500 to-teal-500" },
    { label: "Lista de Jovens", path: "/listacadastrojovens", icon: Users, description: "Visualize todos os jovens cadastrados", category: "Consultas", priority: "medium", gradient: "from-orange-500 to-red-500" },
    { label: "Lista de Curso Técnico", path: "/listacursotecnico", icon: List, description: "Consulte cursos técnicos disponíveis", category: "Consultas", priority: "medium", gradient: "from-indigo-500 to-purple-500" },
    { label: "Lista de Escolas Técnicas", path: "/listadeescolatecnica", icon: GraduationCap, description: "Visualize escolas técnicas cadastradas", category: "Consultas", priority: "medium", gradient: "from-green-500 to-emerald-500" },
    { label: "Entrada de Jovens", path: "/entradajovens", icon: LogIn, description: "Registre entrada de estudantes", category: "Operações", priority: "high", gradient: "from-yellow-500 to-orange-500" },
    { label: "Lista de Jovens e Boletos", path: "/estoque", icon: FileText, description: "Gerencie boletos e estudantes", category: "Operações", priority: "medium", gradient: "from-pink-500 to-rose-500" },
    { label: "Boletos Pagos", path: "/boletos", icon: CreditCard, description: "Acompanhe pagamentos realizados", category: "Financeiro", priority: "high", gradient: "from-cyan-500 to-blue-500" },
  ]

  const categories = [...new Set(menuItems.map((item) => item.category))]

  const categoryIcons = { Cadastros: UserPlus, Consultas: List, Operações: Zap, Financeiro: CreditCard }
  const categoryColors = { Cadastros: "from-emerald-500 to-teal-500", Consultas: "from-blue-500 to-cyan-500", Operações: "from-purple-500 to-pink-500", Financeiro: "from-orange-500 to-red-500" }

  useEffect(() => {
    async function fetchStats() {
      try {
        const jovensSnap = await getDocs(collection(db, "estoqueJovens"))
        const escolasSnap = await getDocs(collection(db, "cadastrodeescolatecnica"))
        const cursosSnap = await getDocs(collection(db, "cadastrodecursos")) // Supondo que você tenha uma coleção separada de cursos
        const boletosSnap = await getDocs(collection(db, "boletos"))

        setStats([
          { label: "Jovens Cadastrados", value: jovensSnap.size.toString(), icon: Users, color: "from-blue-500 to-cyan-500", change: "+0%", trend: "up" },
          { label: "Cursos Ativos", value: cursosSnap.size.toString(), icon: BookOpen, color: "from-emerald-500 to-teal-500", change: "+0", trend: "up" },
          { label: "Escolas Parceiras", value: escolasSnap.size.toString(), icon: School, color: "from-purple-500 to-pink-500", change: "+0", trend: "up" },
          { label: "Boletos Processados", value: boletosSnap.size.toString(), icon: Activity, color: "from-orange-500 to-red-500", change: "+0%", trend: "up" },
        ])
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20">
                <img src="/Reciclar_30anos_Blocado_Positivo.png" alt="Instituto Reciclar" className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight">Sistema de Gestão</h1>
              <p className="text-blue-100 text-xl lg:text-2xl font-semibold mb-2">Acompanhamento de Boletos - Cursos Técnicos</p>
              <p className="text-blue-200 text-sm lg:text-base">Instituto Reciclar • Transformando vidas através da educação</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold">Sistema Online</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Performance: 99.9%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <section className="relative max-w-7xl mx-auto px-6 -mt-5 z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-semibold mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
              </div>
              <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Menu Principal */}
      <main className="relative flex-1 max-w-7xl mx-auto px-6 py-16">
        {categories.map((category) => {
          const CategoryIcon = categoryIcons[category]
          const categoryGradient = categoryColors[category]

          return (
            <div key={category} className="mb-20">
              <div className="flex items-center justify-center mb-12">
                <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md rounded-3xl px-8 py-4 shadow-xl border border-white/50">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${categoryGradient} shadow-lg`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">{category}</h3>
                  <span className="text-sm font-semibold text-gray-600">{menuItems.filter((item) => item.category === category).length} itens</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuItems.filter((item) => item.category === category).map((item, index) => {
                  const IconComponent = item.icon
                  const isHighPriority = item.priority === "high"
                  return (
                    <Link key={index} to={item.path} className="group relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl border border-white/60 hover:border-white/80 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
                      {isHighPriority && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            PRIORITY
                          </div>
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                      <div className="relative p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                            <div className={`relative p-4 bg-gradient-to-br ${item.gradient} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                              <IconComponent className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-xl text-gray-900 group-hover:text-gray-700 transition-colors duration-300 leading-tight">{item.label}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{item.description}</p>
                        </div>
                      </div>
                      <div className={`h-1 bg-gradient-to-r ${item.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                <img src="/Reciclar_30anos_Blocado_Positivo.png" alt="Instituto Reciclar" className="w-20 h-20 lg:w-28 lg:h-28 object-contain drop-shadow-2xl" />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-black text-lg mb-1">Instituto Reciclar</p>
              <p className="text-blue-200 text-sm">Educação que transforma vidas</p>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <p className="text-gray-300 font-semibold mb-1">&copy; {new Date().getFullYear()} Instituto Reciclar</p>
            <p className="text-gray-400 text-sm mb-2">Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
