import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    type_identite: "nin",
    numero_identite: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    confirmation_mot_de_passe: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; numero_identite?: string }>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (form.mot_de_passe !== form.confirmation_mot_de_passe) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!form.numero_identite.trim()) {
      setFieldErrors({ numero_identite: "Le numéro d'identité est requis." });
      return;
    }

    setLoading(true);
    try {
      const { confirmation_mot_de_passe, ...dataToSend } = form;
      await api.post("/auth/register", dataToSend);
      setSuccess(true);
      setTimeout(() => navigate("/connexion"), 3000);
    } catch (err: any) {
      if (err.response?.data?.field === "email") {
        setFieldErrors({ email: err.response?.data?.message || "Cet email est déjà utilisé." });
      } else if (err.response?.data?.field === "numero_identite") {
        setFieldErrors({ numero_identite: err.response?.data?.message || "Ce numéro d'identité est déjà utilisé." });
      } else {
        setError(err.response?.data?.message || "Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold text-km-navy mb-6 text-center">Créer un compte citoyen</h1>
      
      {success ? (
        <div className="bg-white border rounded-xl shadow-sm p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Compte créé avec succès !</h2>
          <p className="text-gray-600 mb-4">Vous allez être redirigé vers la page de connexion...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ animation: "progress 3s linear forwards" }}></div>
          </div>
          <p className="text-sm text-gray-500">Redirection automatique dans 3 secondes</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input required value={form.prenom} onChange={(e) => update("prenom", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input required value={form.nom} onChange={(e) => update("nom", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type d'identité</label>
          <select
            value={form.type_identite}
            onChange={(e) => update("type_identite", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green"
          >
            <option value="nin">Carte d'identité (NIN)</option>
            <option value="passport">Passeport</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {form.type_identite === "nin" ? "Numéro de carte d'identité (NIN)" : "Numéro de passeport"}
          </label>
          <input
            required
            value={form.numero_identite}
            onChange={(e) => update("numero_identite", e.target.value)}
            placeholder={form.type_identite === "nin" ? "Ex: UC12345678" : "Ex: NBE123456"}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green ${
              fieldErrors.numero_identite ? "border-red-500" : ""
            }`}
          />
          {fieldErrors.numero_identite && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle size={14} />
              <span>{fieldErrors.numero_identite}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
          />
          {fieldErrors.email && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle size={14} />
              <span>{fieldErrors.email}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input value={form.telephone} onChange={(e) => update("telephone", e.target.value)}
            placeholder="+269 ..."
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe (8 caractères min.)</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required minLength={8} 
              value={form.mot_de_passe} 
              onChange={(e) => update("mot_de_passe", e.target.value)}
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
        <div>
          <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              required minLength={8} 
              value={form.confirmation_mot_de_passe} 
              onChange={(e) => update("confirmation_mot_de_passe", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-km-green" 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button disabled={loading}
          className="w-full bg-km-green text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60">
          {loading ? "Création..." : "Créer mon compte"}
        </button>
        <p className="text-sm text-center text-gray-500">
          Déjà inscrit ? <Link to="/connexion" className="text-km-green font-medium hover:underline">Se connecter</Link>
        </p>
      </form>
      )}
    </div>
  );
}
