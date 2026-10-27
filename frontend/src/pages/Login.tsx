import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, motDePasse);
      const userStr = localStorage.getItem("spk_user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.role === "admin_service" || user?.role === "super_admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de connexion.");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-km-navy hover:text-km-green font-medium mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Retour à l'accueil</span>
      </Link>
      <h1 className="text-2xl font-bold text-km-navy mb-6 text-center">Connexion</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-km-green"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          disabled={loading}
          className="w-full bg-km-green text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/mot-de-passe-oublie" className="text-km-green hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <p className="text-sm text-center text-gray-500">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-km-green font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
