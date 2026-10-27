import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la demande de réinitialisation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-km-navy mb-6 text-center">Mot de passe oublié</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 rounded p-2">
            Si cet emailexists, vous recevrez un lien de réinitialisation.
          </p>
        )}
        <p className="text-sm text-gray-600">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
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
        <button
          disabled={loading}
          className="w-full bg-km-green text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>
        <p className="text-sm text-center text-gray-500">
          <Link to="/connexion" className="text-km-green font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
