import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/client";
import type { Service } from "../types";

export default function NouvelleDemande() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [moyenPaiement, setMoyenPaiement] = useState("mobicash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{ numero: string; demandeId: number } | null>(null);

  useEffect(() => {
    api.get(`/services/${code}`).then((res) => setService(res.data));
  }, [code]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!service) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("service_code", service.code);
      formData.append("donnees_formulaire", JSON.stringify({ notes }));
      if (files) {
        Array.from(files).forEach((f) => formData.append("pieces", f));
      }

      const { data } = await api.post("/demandes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Paiement (simulation en mode démo — à connecter à une vraie passerelle)
      const montant = parseInt(service.cout.replace(/\D/g, "")) || 0;
      if (montant > 0) {
        await api.post("/paiements", {
          demande_id: data.demande_id,
          montant,
          moyen_paiement: moyenPaiement
        });
      }

      setConfirmation({ numero: data.numero_suivi, demandeId: data.demande_id });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du dépôt de la demande.");
    } finally {
      setLoading(false);
    }
  }

  if (!service) return <div className="max-w-2xl mx-auto px-4 py-16 text-gray-500">Chargement...</div>;

  if (confirmation) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <h1 className="text-xl font-bold text-green-800 mb-2">Demande envoyée avec succès</h1>
          <p className="text-gray-600 mb-4">Votre numéro de suivi :</p>
          <p className="font-mono text-2xl font-bold text-km-navy mb-6">{confirmation.numero}</p>
          <button
            onClick={() => navigate(`/demandes/${confirmation.demandeId}`)}
            className="bg-km-green text-white px-5 py-2.5 rounded-lg hover:opacity-90"
          >
            Voir le détail de ma demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link
        to={`/services/${code}`}
        className="inline-flex items-center gap-2 text-km-navy hover:text-km-green font-medium mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Retour au service</span>
      </Link>
      <h1 className="text-2xl font-bold text-km-navy mb-1">Nouvelle demande</h1>
      <p className="text-gray-500 mb-6">{service.nom} — {service.cout}</p>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Précisions complémentaires (optionnel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-km-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pièces à fournir : {service.pieces_a_fournir}
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Formats acceptés : PDF, JPG, PNG (8 Mo max par fichier)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Moyen de paiement</label>
          <select
            value={moyenPaiement}
            onChange={(e) => setMoyenPaiement(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="mobicash">Mobicash</option>
            <option value="holodimoney">HolodiMoney</option>
            <option value="fedapay">Carte bancaire (FedaPay)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Coût du service : {service.cout}
          </p>
        </div>

        <button
          disabled={loading}
          className="w-full bg-km-green text-white font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Envoi en cours..." : "Envoyer ma demande et payer"}
        </button>
      </form>
    </div>
  );
}
