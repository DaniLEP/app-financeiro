// "use client"

// import { useState } from "react"
// import { ref, push } from "firebase/database"
// import * as XLSX from "xlsx"
// import { db } from "../../../firebase"
// import {
//   User,
//   GraduationCap,
//   BookOpen,
//   Users,
//   Calendar,
//   DollarSign,
//   CreditCard,
//   Mail,
//   Upload,
//   CheckCircle,
//   AlertCircle,
//   Home,
//   FileSpreadsheet,
// } from "lucide-react"

// export default function EntradaJovem() {
//   const [formData, setFormData] = useState({
//     nomeCompleto: "",
//     escolaTecnica: "",
//     cursoTecnico: "",
//     turma: "",
//     dataNascimento: "",
//     valorCurso: "",
//     valorDesconto: "",
//     numeroParcelas: "",
//     vencimentoBoleto: "",
//     emailResponsavel: "",
//   })

//   const [file, setFile] = useState(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isImporting, setIsImporting] = useState(false)
//   const [currentStep, setCurrentStep] = useState(1)
//   const [validationErrors, setValidationErrors] = useState({})

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))

//     // Clear validation error when user starts typing
//     if (validationErrors[name]) {
//       setValidationErrors((prev) => ({ ...prev, [name]: "" }))
//     }
//   }

//   const validateForm = () => {
//     const errors = {}

//     if (!formData.nomeCompleto.trim()) errors.nomeCompleto = "Nome é obrigatório"
//     if (!formData.escolaTecnica.trim()) errors.escolaTecnica = "Escola é obrigatória"
//     if (!formData.cursoTecnico.trim()) errors.cursoTecnico = "Curso é obrigatório"
//     if (!formData.emailResponsavel.includes("@")) errors.emailResponsavel = "Email inválido"

//     setValidationErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!validateForm()) return

//     setIsSubmitting(true)

//     try {
//       const novoJovemRef = ref(db, "estoqueJovens")
//       await push(novoJovemRef, formData)

//       // Success animation
//       const successDiv = document.createElement("div")
//       successDiv.className =
//         "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce"
//       successDiv.innerHTML =
//         '<div class="flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Cadastro realizado com sucesso!</div>'
//       document.body.appendChild(successDiv)

//       setTimeout(() => {
//         document.body.removeChild(successDiv)
//       }, 3000)

//       setFormData({
//         nomeCompleto: "",
//         escolaTecnica: "",
//         cursoTecnico: "",
//         turma: "",
//         dataNascimento: "",
//         valorCurso: "",
//         valorDesconto: "",
//         numeroParcelas: "",
//         vencimentoBoleto: "",
//         emailResponsavel: "",
//       })
//       setCurrentStep(1)
//     } catch (error) {
//       console.error("Erro ao cadastrar jovem:", error)

//       // Error animation
//       const errorDiv = document.createElement("div")
//       errorDiv.className = "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse"
//       errorDiv.innerHTML =
//         '<div class="flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>Erro ao cadastrar. Tente novamente.</div>'
//       document.body.appendChild(errorDiv)

//       setTimeout(() => {
//         document.body.removeChild(errorDiv)
//       }, 3000)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0])
//   }

//   const handleImportExcel = async () => {
//     if (!file) {
//       alert("Selecione um arquivo Excel primeiro.")
//       return
//     }

//     setIsImporting(true)

//     const reader = new FileReader()
//     reader.onload = async (evt) => {
//       try {
//         const data = new Uint8Array(evt.target.result)
//         const workbook = XLSX.read(data, { type: "array" })
//         const sheetName = workbook.SheetNames[0]
//         const sheet = workbook.Sheets[sheetName]
//         const jsonData = XLSX.utils.sheet_to_json(sheet)

//         for (const jovem of jsonData) {
//           const novoJovemRef = ref(db, "estoqueJovens")
//           await push(novoJovemRef, jovem)
//         }

//         // Success notification
//         const successDiv = document.createElement("div")
//         successDiv.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
//         successDiv.innerHTML = `<div class="flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Importação de ${jsonData.length} registros concluída!</div>`
//         document.body.appendChild(successDiv)

//         setTimeout(() => {
//           document.body.removeChild(successDiv)
//         }, 4000)

//         setFile(null)
//         document.getElementById("excelFile").value = ""
//       } catch (error) {
//         console.error("Erro ao importar:", error)
//         alert("Erro na importação. Verifique o formato do arquivo.")
//       } finally {
//         setIsImporting(false)
//       }
//     }
//     reader.readAsArrayBuffer(file)
//   }

//   const formFields = [
//     // Step 1: Dados Pessoais
//     [
//       {
//         label: "Nome Completo",
//         name: "nomeCompleto",
//         type: "text",
//         icon: User,
//         placeholder: "Digite o nome completo do jovem",
//       },
//       { label: "Data de Nascimento", name: "dataNascimento", type: "date", icon: Calendar },
//       {
//         label: "Email do Responsável",
//         name: "emailResponsavel",
//         type: "email",
//         icon: Mail,
//         placeholder: "email@exemplo.com",
//       },
//     ],
//     // Step 2: Dados Acadêmicos
//     [
//       {
//         label: "Escola Técnica",
//         name: "escolaTecnica",
//         type: "text",
//         icon: GraduationCap,
//         placeholder: "Nome da escola técnica",
//       },
//       {
//         label: "Curso Técnico",
//         name: "cursoTecnico",
//         type: "text",
//         icon: BookOpen,
//         placeholder: "Nome do curso técnico",
//       },
//       { label: "Turma", name: "turma", type: "text", icon: Users, placeholder: "Identificação da turma" },
//     ],
//     // Step 3: Dados Financeiros
//     [
//       {
//         label: "Valor do Curso",
//         name: "valorCurso",
//         type: "number",
//         step: "0.01",
//         icon: DollarSign,
//         placeholder: "0.00",
//       },
//       {
//         label: "Valor com Desconto",
//         name: "valorDesconto",
//         type: "number",
//         step: "0.01",
//         icon: DollarSign,
//         placeholder: "0.00",
//       },
//       { label: "Número de Parcelas", name: "numeroParcelas", type: "number", icon: CreditCard, placeholder: "Ex: 12" },
//       { label: "Vencimento do Boleto", name: "vencimentoBoleto", type: "date", icon: Calendar },
//     ],
//   ]

//   const stepTitles = ["Dados Pessoais", "Dados Acadêmicos", "Dados Financeiros"]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
//       {/* Header */}
//       <div className="max-w-4xl mx-auto">
//         <header className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
//             <GraduationCap className="w-10 h-10 text-white" />
//           </div>
//           <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
//             ENTRADA DE JOVENS
//           </h1>
//           <p className="text-gray-600 text-lg">Sistema de cadastro e gestão de jovens</p>
//         </header>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Form */}
//           <div className="lg:col-span-2">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
//               {/* Progress Steps */}
//               <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
//                 <div className="flex items-center justify-between">
//                   {stepTitles.map((title, index) => (
//                     <div key={index} className="flex items-center">
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
//                           currentStep > index + 1
//                             ? "bg-green-500 text-white"
//                             : currentStep === index + 1
//                               ? "bg-white text-blue-600 shadow-lg scale-110"
//                               : "bg-white/30 text-white/70"
//                         }`}
//                       >
//                         {currentStep > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
//                       </div>
//                       {index < stepTitles.length - 1 && (
//                         <div
//                           className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
//                             currentStep > index + 1 ? "bg-green-500" : "bg-white/30"
//                           }`}
//                         />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-4">
//                   <h3 className="text-white text-xl font-bold">{stepTitles[currentStep - 1]}</h3>
//                   <p className="text-white/80">
//                     Passo {currentStep} de {stepTitles.length}
//                   </p>
//                 </div>
//               </div>

//               {/* Form Content */}
//               <form onSubmit={handleSubmit} className="p-8">
//                 <div className="grid gap-6">
//                   {formFields[currentStep - 1]?.map((field) => {
//                     const Icon = field.icon
//                     return (
//                       <div key={field.name} className="group">
//                         <label className="flex items-center gap-2 mb-2 font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
//                           <Icon className="w-5 h-5" />
//                           {field.label}
//                         </label>
//                         <div className="relative">
//                           <input
//                             type={field.type}
//                             name={field.name}
//                             step={field.step}
//                             value={formData[field.name]}
//                             onChange={handleChange}
//                             placeholder={field.placeholder}
//                             required
//                             className={`w-full border-2 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
//                               validationErrors[field.name]
//                                 ? "border-red-500 bg-red-50"
//                                 : "border-gray-200 hover:border-blue-300"
//                             }`}
//                           />
//                           <Icon
//                             className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
//                               validationErrors[field.name] ? "text-red-500" : "text-gray-400 group-hover:text-blue-500"
//                             }`}
//                           />
//                           {validationErrors[field.name] && (
//                             <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
//                               <AlertCircle className="w-4 h-4" />
//                               {validationErrors[field.name]}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>

//                 {/* Navigation Buttons */}
//                 <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//                     disabled={currentStep === 1}
//                     className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     ← Anterior
//                   </button>

//                   {currentStep < stepTitles.length ? (
//                     <button
//                       type="button"
//                       onClick={() => setCurrentStep(Math.min(stepTitles.length, currentStep + 1))}
//                       className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
//                     >
//                       Próximo →
//                     </button>
//                   ) : (
//                     <button
//                       type="submit"
//                       disabled={isSubmitting}
//                       className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                           Cadastrando...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle className="w-5 h-5" />
//                           Finalizar Cadastro
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </form>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Import Section */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
//                   <FileSpreadsheet className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-800">Importação em Lote</h3>
//                   <p className="text-gray-600 text-sm">Importe múltiplos registros via Excel</p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="relative">
//                   <input
//                     type="file"
//                     id="excelFile"
//                     accept=".xlsx, .xls"
//                     onChange={handleFileChange}
//                     className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-8 text-center hover:border-green-400 transition-colors cursor-pointer file:hidden"
//                   />
//                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                     <Upload className="w-8 h-8 text-gray-400 mb-2" />
//                     <p className="text-gray-600 font-medium">{file ? file.name : "Clique para selecionar arquivo"}</p>
//                     <p className="text-gray-400 text-sm mt-1">Formatos: .xlsx, .xls</p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleImportExcel}
//                   disabled={!file || isImporting}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                 >
//                   {isImporting ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Importando...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-5 h-5" />
//                       Importar Excel
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Navigation */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
//               <button
//                 type="button"
//                 onClick={() => (window.location.href = "/home")}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
//               >
//                 <Home className="w-5 h-5" />
//                 Voltar para Home
//               </button>
//             </div>

//             {/* Tips */}
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
//               <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
//                 <AlertCircle className="w-5 h-5" />
//                 Dicas Importantes
//               </h4>
//               <ul className="text-blue-700 text-sm space-y-2">
//                 <li>• Preencha todos os campos obrigatórios</li>
//                 <li>• Verifique o email do responsável</li>
//                 <li>• Valores devem ser em formato decimal (0.00)</li>
//                 <li>• Para importação, use planilhas Excel (.xlsx)</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
