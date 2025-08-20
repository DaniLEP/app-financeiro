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
  Star,
  Zap,
} from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../../firebase" // ajuste o caminho

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
        const cursosSnap = await getDocs(collection(db, "cadastrodecursos"))
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
      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo + título */}
          <div className="flex flex-col lg:flex-row items-center gap-6 text-center lg:text-left">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-3 border border-white/20">
              <img src="/Reciclar_30anos_Blocado_Positivo.png" alt="Instituto Reciclar" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight">
                Reciclar SmartFin
              </h1>
              <p className="text-blue-100 text-base sm:text-lg lg:text-2xl font-semibold">Acompanhamento de Boletos - Cursos Técnicos</p>
              <p className="text-blue-200 text-xs sm:text-sm lg:text-base">Instituto Reciclar • Transformando vidas através da educação</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6 items-center">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold">Sistema Online</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Performance: 99.9%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Estatísticas */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Menu */}
      <main className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {categories.map((category) => {
          const CategoryIcon = categoryIcons[category]
          const categoryGradient = categoryColors[category]
          return (
            <div key={category} className="mb-12 sm:mb-20">
              {/* Título da categoria */}
              <div className="flex items-center justify-center mb-8 sm:mb-12">
                <div className="flex items-center gap-4 sm:gap-6 bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-3 sm:py-4 shadow-xl border border-white/50">
                  <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${categoryGradient} shadow-lg`}>
                    <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-800">{category}</h3>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">{menuItems.filter((item) => item.category === category).length} itens</span>
                </div>
              </div>

              {/* Grid de itens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {menuItems.filter((item) => item.category === category).map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <Link key={index} to={item.path} className="group relative bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-white/60 hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                      <div className="p-6 sm:p-8">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className={`p-3 sm:p-4 bg-gradient-to-br ${item.gradient} rounded-xl sm:rounded-2xl shadow-lg`}>
                            <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        </div>
                        <h4 className="font-black text-lg sm:text-xl text-gray-900 mb-2">{item.label}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src="/Reciclar_30anos_Blocado_Positivo.png" alt="Instituto Reciclar" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 object-contain" />
            <div>
              <p className="font-black text-base sm:text-lg">Instituto Reciclar</p>
              <p className="text-blue-200 text-xs sm:text-sm">Educação que transforma vidas</p>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <p className="text-gray-300 text-sm sm:text-base">&copy; {new Date().getFullYear()} Instituto Reciclar</p>
            <p className="text-gray-400 text-xs sm:text-sm">Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
