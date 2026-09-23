import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import FloatingDisclaimer from './components/FloatingDisclaimer'
import ProtectedRoute from './components/ProtectedRoute'
import RequireAdmin from './components/RequireAdmin'
import RequirePro from './components/RequirePro'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlanProvider } from './context/PlanContext'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const BlogsList = lazy(() => import('./pages/BlogsList'))
const BlogReader = lazy(() => import('./pages/BlogReader'))
const ArticlesAdmin = lazy(() => import('./pages/admin/ArticlesAdmin'))
const TradexaGPT = lazy(() => import('./pages/TradexaGPT'))
const Copilot = lazy(() => import('./pages/Copilot'))
const TradingEdgeValidator = lazy(() => import('./pages/TradingEdgeValidator'))
const IpoEvaluator = lazy(() => import('./pages/IpoEvaluator'))
const OurVision = lazy(() => import('./pages/OurVision'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const RiskDisclaimer = lazy(() => import('./pages/RiskDisclaimer'))
const Contact = lazy(() => import('./pages/Contact'))
const Faq = lazy(() => import('./pages/Faq'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Trades = lazy(() => import('./pages/Trades'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Upload = lazy(() => import('./pages/Upload'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const SubscriptionRequired = lazy(() => import('./pages/SubscriptionRequired'))

function GuestOnly({ children }) {
  const { isAuthenticated, authReady } = useAuth()
  if (!authReady) return <Fallback />
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
      <PlanProvider>
        <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Coming Soon Routes */}
            <Route path="/tradexa-gpt" element={<TradexaGPT />} />
          <Route path="/tools/edge-validator" element={<TradingEdgeValidator />} />
          <Route path="/tools/ipo-evaluator" element={<IpoEvaluator />} />
            <Route path="/blogs" element={<BlogsList />} />
            <Route path="/blogs/:slug" element={<BlogReader />} />
            <Route path="/vision" element={<OurVision />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />

            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
            <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscription-required" element={<SubscriptionRequired />} />
            
            <Route path="/admin/articles" element={<RequireAdmin><ArticlesAdmin /></RequireAdmin>} />

            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/copilot" element={<RequirePro><Copilot /></RequirePro>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingDisclaimer />
        </Suspense>
      </BrowserRouter>
      </PlanProvider>
    </AuthProvider>
  )
}








