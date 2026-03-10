import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SalonPage from './pages/SalonPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<AdminPage />} />
      <Route path="/s/:slug" element={<SalonPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
