import React, { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import RegistroUser from './pages/Login/register_auth'
import JovensTable from './pages/stock'
import EntradaJovem from './pages/entradaJovens'
import CadastroEscolaTecnica from './pages/register/escola'
import CadastroJovem from './pages/register/jovem'
import ListaEscolasTecnicas from './pages/views/escola'
import ListaCursosTecnicos from './pages/views/curso'
import TabelaBoletos from './pages/boletos'
import CadastroCursoTecnico from './pages/register/curso'
import Home from './pages/Home'
import VisualizarJovensAvancado from './pages/views/jovens'

const App = lazy(() => import('./App.jsx'))
const Login = lazy(() => import('./pages/Login/index'))
// const Home = lazy(() => import ('./pages/Home/index'))
const ErrorPage = lazy(() => import('./components/errorpage/index'))

// Componente fallback com spinner simples
function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
    }}>
      <div style={{
        border: '8px solid #ddd',
        borderTop: '8px solid #4f46e5', // roxo (tailwind indigo-600)
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Login /> },
      { path: 'Home', element: <Home /> },
      { path: 'Register', element: <RegistroUser /> },
      { path: 'cadastrocursotecnico', element: < CadastroCursoTecnico /> },
      { path: 'cadastroescolatecnica', element: <CadastroEscolaTecnica /> },
      { path: 'cadastrojovem', element: <CadastroJovem /> },
      { path: 'listacadastrojovens', element: <VisualizarJovensAvancado /> },
      { path: 'listacursotecnico', element: <ListaCursosTecnicos /> },
      { path: 'listadeescolatecnica', element: <ListaEscolasTecnicas /> },
      { path: 'entradajovens', element: <EntradaJovem /> },
      { path: 'estoque', element: <JovensTable /> },
      { path: 'boletos', element: <TabelaBoletos /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
)
