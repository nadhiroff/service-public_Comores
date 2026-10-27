import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCircle, LogOut, LayoutDashboard, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setShowLogoutModal(false);
  }

  const isAdmin = user?.role === "admin_service" || user?.role === "super_admin";

  return (
    <>
      <header className="bg-km-navy text-white shadow-md">
        <div className="w-full flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/comores-flag.png" 
              alt="Drapeau des Comores" 
              className="h-8 w-auto rounded shadow-sm"
            />
            <div>
              <p className="font-bold leading-tight">Service Public</p>
              <p className="text-xs text-km-yellow leading-tight">Union des Comores</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {!isAdmin && (
              <>
                <Link to="/" className={`hover:text-km-yellow ${location.pathname === "/" ? "text-km-yellow" : ""}`}>Accueil</Link>
                <Link to="/suivi" className={`hover:text-km-yellow ${location.pathname === "/suivi" ? "text-km-yellow" : ""}`}>Suivre une demande</Link>
              </>
            )}
            {user?.role === "citoyen" && (
              <Link to="/espace-citoyen" className={`hover:text-km-yellow ${location.pathname === "/espace-citoyen" ? "text-km-yellow" : ""}`}>Espace citoyen</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`hover:text-km-yellow flex items-center gap-1 ${location.pathname === "/admin" ? "text-km-yellow" : ""}`}>
                <LayoutDashboard size={16} /> Back-office
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:flex items-center gap-1 text-sm">
                  <UserCircle size={18} /> {user.prenom}
                </span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-1 text-sm bg-km-red px-3 py-1.5 rounded hover:opacity-90"
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/connexion" className="text-sm px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1 transition-colors">
                  <LogIn size={14} /> Connexion
                </Link>
                <Link to="/inscription" className="text-sm bg-km-green px-3 py-1.5 rounded hover:opacity-90">
                  Créer un compte
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-white/20 py-4 px-4">
            <div className="flex flex-col gap-3 text-sm font-medium">
              {!isAdmin && (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`hover:text-km-yellow ${location.pathname === "/" ? "text-km-yellow" : ""}`}>Accueil</Link>
                  <Link to="/suivi" onClick={() => setMobileMenuOpen(false)} className={`hover:text-km-yellow ${location.pathname === "/suivi" ? "text-km-yellow" : ""}`}>Suivre une demande</Link>
                </>
              )}
              {user?.role === "citoyen" && (
                <Link to="/espace-citoyen" onClick={() => setMobileMenuOpen(false)} className={`hover:text-km-yellow ${location.pathname === "/espace-citoyen" ? "text-km-yellow" : ""}`}>Espace citoyen</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`hover:text-km-yellow flex items-center gap-1 ${location.pathname === "/admin" ? "text-km-yellow" : ""}`}>
                  <LayoutDashboard size={16} /> Back-office
                </Link>
              )}
              {user && (
                <div className="flex items-center gap-1 text-sm pt-2 border-t border-white/20">
                  <UserCircle size={18} /> {user.prenom}
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-km-navy mb-2">Confirmation de déconnexion</h3>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-km-red text-white hover:opacity-90"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
