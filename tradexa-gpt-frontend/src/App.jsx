import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import FloatingDisclaimer from './components/FloatingDisclaimer'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const TradexaGPT = lazy(() => import('./pages/TradexaGPT'))
const OurVision = lazy(() => import('./pages/OurVision'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Trades = lazy(() => import('./pages/Trades'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Upload = lazy(() => import('./pages/Upload'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function Fallback() {
  return (
    <div className="auth-screen">
      <p className="neutral">Loading Tradexa...</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Coming Soon Routes */}
            <Route path="/tradexa-gpt" element={<TradexaGPT />} />
            <Route path="/risk-calculator" element={<ComingSoon />} />
            <Route path="/blogs" element={<ComingSoon />} />
            <Route path="/blogs/:slug" element={<ComingSoon />} />
            <Route path="/vision" element={<OurVision />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ComingSoon />} />
            <Route path="/faq" element={<ComingSoon />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/risk-disclaimer" element={<ComingSoon />} />

            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/upload" element={<Upload />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingDisclaimer />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}






