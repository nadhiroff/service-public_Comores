import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";
import { useAuth } from "../context/AuthContext";

interface DetailDemande {
  id: number;
  numero_suivi: string;
  statut: any;
  service_nom: string;
  motif_rejet?: string;
  utilisateur_prenom?: string;
  utilisateur_nom?: string;
  documents: { id: number; nom_original: string; chemin_fichier: string }[];
  historique: { statut: string; commentaire?: string; cree_le: string }[];
  messages: { contenu: string; envoye_le: string; prenom: string; nom: string; role: string }[];
}

export default function DemandeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [demande, setDemande] = useState<DetailDemande | null>(null);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [statutChoisi, setStatutChoisi] = useState("");
  const [commentaireStatut, setCommentaireStatut] = useState("");

  function reload() {
    api.get(`/demandes/${id}`).then((res) => setDemande(res.data));
  }

  useEffect(() => {
    reload();
  }, [id]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!nouveauMessage.trim()) return;
    await api.post(`/demandes/${id}/messages`, { contenu: nouveauMessage });
    setNouveauMessage("");
    reload();
  }

  async function changerStatut(e: FormEvent) {
    e.preventDefault();
    await api.patch(`/demandes/${id}/statut`, { statut: statutChoisi, commentaire: commentaireStatut });
    setCommentaireStatut("");
    setStatutChoisi("");
    reload();
  }

  async function downloadDocument(doc: any) {
    try {
      const response = await api.get(`/demandes/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const prenom = demande?.utilisateur_prenom || '';
      const nom = demande?.utilisateur_nom || '';
      const numero = demande?.numero_suivi || '';
      const extension = doc.nom_original.split('.').pop();
      const filename = `${prenom}_${nom}_${numero}.${extension}`;
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  }

  function previewDocument(doc: any) {
    window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${doc.chemin_fichier}`, '_blank');
  }

  if (!demande) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">Chargement...</div>;

  const isAdmin = user?.role === "admin_service" || user?.role === "super_admin";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <p className="text-sm text-gray-500">Numéro de suivi</p>
        <h1 className="text-xl font-mono font-bold text-km-navy">{demande.numero_suivi}</h1>
        <p className="text-gray-600 mt-1">{demande.service_nom}</p>
        <div className="mt-2"><StatutBadge statut={demande.statut} /></div>
        {demande.motif_rejet && (
          <p className="text-sm text-red-600 mt-2">Motif du rejet : {demande.motif_rejet}</p>
        )}
      </div>

      {isAdmin && (
        <form onSubmit={changerStatut} className="bg-white border rounded-xl p-4 space-y-3">
          <p className="font-medium text-sm">Changer le statut (admin)</p>
          <select
            required
            value={statutChoisi}
            onChange={(e) => setStatutChoisi(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">-- Choisir un statut --</option>
            <option value="en_attente_pieces">En attente de pièces</option>
            <option value="en_cours">En cours d'instruction</option>
            <option value="validee">Validée</option>
            <option value="rejetee">Rejetée</option>
          </select>
          <textarea
            placeholder="Commentaire (obligatoire en cas de rejet)"
            value={commentaireStatut}
            onChange={(e) => setCommentaireStatut(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button className="bg-km-navy text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
            Mettre à jour
          </button>
        </form>
      )}

      <div className="bg-white border rounded-xl p-4">
        <p className="font-medium text-sm mb-3">Historique</p>
        <ul className="space-y-2">
          {demande.historique.map((h, i) => (
            <li key={i} className="text-sm text-gray-600 border-l-2 border-km-green pl-3">
              <span className="font-medium">{h.statut}</span> — {new Date(h.cree_le).toLocaleString("fr-FR")}
              {h.commentaire && <p className="text-gray-500">{h.commentaire}</p>}
            </li>
          ))}
        </ul>
      </div>

      {demande.documents.length > 0 && (
        <div className="bg-white border rounded-xl p-4">
          <p className="font-medium text-sm mb-3">Pièces jointes</p>
          <ul className="space-y-2">
            {demande.documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                <span className="text-gray-700">{d.nom_original}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => previewDocument(d)}
                    className="text-km-green hover:underline text-xs font-medium"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => downloadDocument(d)}
                    className="text-km-navy hover:underline text-xs font-medium"
                  >
                    Télécharger
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border rounded-xl p-4">
        <p className="font-medium text-sm mb-3">Messages</p>
        <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
          {demande.messages.map((m, i) => (
            <div key={i} className="text-sm bg-gray-50 rounded-lg p-2">
              <p className="font-medium">{m.prenom} {m.nom} <span className="text-xs text-gray-400">({m.role})</span></p>
              <p>{m.contenu}</p>
            </div>
          ))}
          {demande.messages.length === 0 && <p className="text-sm text-gray-400">Aucun message pour le moment.</p>}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={nouveauMessage}
            onChange={(e) => setNouveauMessage(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button className="bg-km-green text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">Envoyer</button>
        </form>
      </div>
    </div>
  );
}
