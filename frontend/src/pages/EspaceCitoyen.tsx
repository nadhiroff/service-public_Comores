import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import type { Demande } from "../types";
import StatutBadge from "../components/StatutBadge";
import { useAuth } from "../context/AuthContext";

export default function EspaceCitoyen() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/demandes/mes-demandes").then((res) => setDemandes(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-km-navy mb-1">Espace citoyen</h1>
      <p className="text-gray-500 mb-8">Bienvenue {user?.prenom}, voici l'état de vos démarches.</p>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : demandes.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
          <p className="mb-4">Vous n'avez encore déposé aucune demande.</p>
          <Link to="/" className="text-km-green font-medium hover:underline">
            Parcourir les services disponibles
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">N° de suivi</th>
                <th className="text-left px-4 py-3">Service</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Déposée le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3 font-mono">{d.numero_suivi}</td>
                  <td className="px-4 py-3">{d.service_nom}</td>
                  <td className="px-4 py-3"><StatutBadge statut={d.statut} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(d.cree_le).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <Link to={`/demandes/${d.id}`} className="text-km-green hover:underline">Voir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
