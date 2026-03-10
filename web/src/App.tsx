import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SalonPage from './pages/SalonPage'
import AdminPage from './pages/AdminPage'
import CreateSalonPage from './pages/CreateSalonPage'
import SalonBookingPage from './pages/SalonBookingPage'
import SalonConfirmedPage from './pages/SalonConfirmedPage'
import SalonProfilePage from './pages/SalonProfilePage'
import AdminAgendaPage from './pages/AdminAgendaPage'
import AdminServicesPage from './pages/AdminServicesPage'
import AdminStaffPage from './pages/AdminStaffPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import AdminAppearancePage from './pages/AdminAppearancePage'
import AdminConfigPage from './pages/AdminConfigPage'
import AdminSupportPage from './pages/AdminSupportPage'
import GestorPage from './pages/GestorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<AdminPage />} />
      <Route path="/app/novo" element={<CreateSalonPage />} />
      <Route path="/app/agenda" element={<AdminAgendaPage />} />
      <Route path="/app/servicos" element={<AdminServicesPage />} />
      <Route path="/app/equipe" element={<AdminStaffPage />} />
      <Route path="/app/clientes" element={<AdminCustomersPage />} />
      <Route path="/app/aparencia" element={<AdminAppearancePage />} />
      <Route path="/app/config" element={<AdminConfigPage />} />
      <Route path="/app/suporte/:slug" element={<AdminSupportPage />} />
      <Route path="/app/gestor" element={<GestorPage />} />
      <Route path="/s/:slug" element={<SalonPage />} />
      <Route path="/s/:slug/agendar" element={<SalonBookingPage />} />
      <Route path="/s/:slug/confirmado" element={<SalonConfirmedPage />} />
      <Route path="/s/:slug/perfil" element={<SalonProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
