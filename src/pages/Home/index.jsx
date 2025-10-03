import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  School,
  BookOpen,
  UserPlus,
  CreditCard,
  Activity,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  BarChart3,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../firebase";

export default function Home() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const menuItems = [
    {
      label: "Cadastrar Jovens",
      path: "/cadastrojovem",
      icon: UserPlus,
      description: "Registre novos estudantes no sistema",
      category: "Cadastros",
      color: "emerald",
    },
    {
      label: "Lista de Jovens",
      path: "/listacadastrojovens",
      icon: Users,
      description: "Visualize todos os jovens cadastrados",
      category: "Consultas",
      color: "blue",
    },
    {
      label: "Boletos Pagos",
      path: "/boletos",
      icon: CreditCard,
      description: "Acompanhe pagamentos realizados",
      category: "Financeiro",
      color: "amber",
    },
  ];

  const categories = [...new Set(menuItems.map((item) => item.category))];

  const colorVariants = {
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      glow: "shadow-blue-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      glow: "shadow-purple-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      glow: "shadow-amber-500/20",
    },
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10 shadow-lg shadow-primary/5">
              <img
                src="/Reciclar_30anos_Blocado_Positivo.png"
                alt="Instituto Reciclar"
                className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
              />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse shadow-lg shadow-emerald-500/50" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Reciclar SmartFin
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Sistema de Gestão Educacional
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 sm:px-4 py-2 shadow-sm backdrop-blur-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 shadow-sm shadow-emerald-500/10">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-8 sm:mb-12 rounded-3xl border border-border/50 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5 p-6 sm:p-8 lg:p-10 shadow-xl shadow-primary/5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5">
                  <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Bem-vindo de volta
                  </span>
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3 text-balance leading-tight">
                Painel de Controle
              </h2>
              <p className="text-muted-foreground max-w-2xl text-pretty leading-relaxed text-base sm:text-lg">
                Acompanhe o desempenho do sistema, gerencie cadastros e monitore pagamentos em tempo real com insights
                inteligentes.
              </p>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats
            .filter((stat) => stat && stat.color) // 🔹 filtra objetos inválidos
            .map((stat, index) => {
              const colors = colorVariants[stat.color] || {
                bg: "bg-gray-200",
                border: "border-gray-200",
                text: "text-gray-500",
                glow: "shadow-gray-200/20",
              };

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl ${colors.glow}`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${colors.glow}`}>
                        <stat.icon className={`h-6 w-6 ${colors.text} transition-transform duration-300 group-hover:rotate-6`} />
                      </div>
                      <div
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-transform duration-300 group-hover:scale-105 ${
                          stat.isPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {stat.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {stat.trend}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                      {isLoading ? (
                        <div className="h-12 w-24 bg-muted/50 animate-pulse rounded-lg mb-2" />
                      ) : (
                        <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-2 transition-all duration-300 group-hover:scale-105">
                          {stat.value}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* MENU SECTIONS */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {categories.map((category, categoryIndex) => (
          <div
            key={category}
            className="mb-12 animate-in fade-in slide-in-from-bottom-6"
            style={{ animationDelay: `${(categoryIndex + 4) * 100}ms`, animationFillMode: "backwards" }}
          >
            <div className="mb-6 flex items-end justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-2">
                  {category}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({menuItems.filter((item) => item.category === category).length})
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {menuItems.filter((item) => item.category === category).length} módulos disponíveis
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowUpRight className="h-4 w-4" />
                Clique para acessar
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {menuItems
                .filter((item) => item.category === category)
                .map((item, index) => {
                  const IconComponent = item.icon;
                  const colors = colorVariants[item.color] || {
                    bg: "bg-gray-200",
                    border: "border-gray-200",
                    text: "text-gray-500",
                    glow: "shadow-gray-200/20",
                  };
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                      <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl ${colors.glow}`} />

                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3.5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${colors.glow}`}>
                            <IconComponent className={`h-6 w-6 ${colors.text} transition-transform duration-300 group-hover:rotate-12`} />
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground text-balance leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
                            {item.label}
                          </h3>
                          <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10 shadow-lg">
              <img
                src="/Reciclar_30anos_Blocado_Positivo.png"
                alt="Instituto Reciclar"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-foreground">Instituto Reciclar</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Educação que transforma vidas</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Instituto Reciclar. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center sm:justify-end gap-1">
              <Sparkles className="h-3 w-3" />
              SmartFin v2.0 - Sistema de Gestão Educacional
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
