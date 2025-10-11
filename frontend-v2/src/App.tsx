import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context';
import Quote from './pages/Quote';
import Home from './pages/Home';
import { Link } from 'react-router-dom';
import Quotations from './pages/Quotations';
import AdminDashboard from './pages/admin/AdminDashBoard';

export default function App() {
  console.log("App component rendered");

  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with cargo theme */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(96, 165, 250, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* Geometric shapes for depth */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-blue-300/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Container ship silhouette in background */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20">
        <svg viewBox="0 0 1200 300" className="w-full h-full">
          <path
            d="M100 180 L200 160 L300 140 L400 130 L500 125 L600 125 L700 130 L800 140 L900 160 L1000 180 L1100 200 L1200 220 L1200 300 L0 300 Z"
            fill="url(#shipGradient)"
          />
          <defs>
            <linearGradient id="shipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#312e81', stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <Link to={"/"} className="text-blue-500/90 hover:text-blue-600 transition-colors font-bold text-2xl cursor-pointer">
                FreightQuote
              </Link>
              {isAdminPage && <Link to="/admin" className="text-gray-500 font-bold ml-2 text-sm align-super">Admin</Link>}
            </div>
            {!isAdminPage && <nav className="hidden md:flex space-x-8 text-blue-500/70">
              <a href="#" className="hover:text-blue-500 transition-colors">Services</a>
              <a href="#" className="hover:text-blue-500 transition-colors">About</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
            </nav>}
          </div>
        </header>

        {/* Hero section */}
        <main className="flex-1 flex flex-col px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/" element={<ContactForm />} /> */}
            <Route path="/quote" element={<Quote />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* <Route path="/create" element={<QuoteCreation />} /> */}
          </Routes>
        </main>

      </div>

      {/* Mobile menu overlay (hidden by default) */}
      <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 opacity-0 pointer-events-none transition-opacity">
        <div className="bg-white rounded-t-3xl absolute bottom-0 left-0 right-0 p-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <nav className="space-y-4">
            <a href="#" className="block text-gray-800 font-medium">Services</a>
            <a href="#" className="block text-gray-800 font-medium">About</a>
            <a href="#" className="block text-gray-800 font-medium">Contact</a>
          </nav>
        </div>
      </div>
    </div>
  );
}
