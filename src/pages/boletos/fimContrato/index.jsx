import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../../../../firebase"
import { CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function FimContratoPremium() {
  const [jovens, setJovens] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalFinalizados, setTotalFinalizados] = useState(0)

  useEffect(() => {
    const fimContratoRef = ref(db, "fimContrato")
    const unsub = onValue(
      fimContratoRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const dados = Object.entries(snapshot.val())
            .map(([id, jovem]) => ({ id, ...jovem }))
            .filter((j) => Number(j.cursoTecnico?.quantidadeParcelas ?? 0) === 0)
          setJovens(dados)
          setTotalFinalizados(dados.length)
        } else {
          setJovens([])
          setTotalFinalizados(0)
        }
        setLoading(false)
      },
      (err) => {
        console.error("Erro ao buscar jovens:", err)
        setLoading(false)
      }
    )
    return () => unsub && typeof unsub === "function" && unsub()
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-700 text-lg">Carregando contratos finalizados...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      {/* Top Dashboard */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contratos Finalizados</h1>
        <p className="text-slate-600 text-lg mb-4">Visualize os jovens cujas parcelas chegaram ao fim</p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
          className="inline-block bg-white px-6 py-3 rounded-lg border border-slate-200 shadow-md"
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total de Finalizados</p>
          <motion.p
            className="text-3xl font-bold text-emerald-700 mt-1"
            initial={{ count: 0 }}
            animate={{ count: totalFinalizados }}
            transition={{ duration: 1.2 }}
          >
            {totalFinalizados}
          </motion.p>
        </motion.div>
      </div>

      {/* Lista de Jovens */}
      {jovens.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm max-w-xl mx-auto">
          <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum contrato finalizado</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Ainda não há jovens com parcelas finalizadas. Assim que houver, eles aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <AnimatePresence>
            {jovens.map((jovem, index) => (
              <motion.div
                key={jovem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
              >
                <CheckCircle className="h-14 w-14 text-emerald-600 mb-4" />
                <h2 className="text-lg font-bold text-slate-900">{jovem.dadosJovem?.nome || "-"}</h2>
                <p className="text-slate-600 mt-1">{jovem.dadosJovem?.projeto || "-"}</p>
                {jovem.cursoTecnico?.nomeCurso && (
                  <p className="text-slate-500 mt-1 text-sm">{jovem.cursoTecnico.nomeCurso}</p>
                )}
                <span className="mt-3 inline-block bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-semibold text-sm">
                  Finalizado
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
