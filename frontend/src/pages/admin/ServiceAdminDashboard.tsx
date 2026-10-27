import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import StatutBadge from "../../components/StatutBadge";

export default function ServiceAdminDashboard() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/mes-demandes-service").then((res) => setDemandes(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-km-navy mb-1">Tableau de bord — Admin de service</h1>
      <p className="text-gray-500 mb-6">Demandes déposées pour votre service.</p>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : demandes.length === 0 ? (
        <p className="text-gray-500 bg-white border rounded-xl p-8 text-center">Aucune demande pour le moment.</p>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">N° de suivi</th>
                <th className="text-left px-4 py-3">Usager</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Déposée le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3 font-mono">{d.numero_suivi}</td>
                  <td className="px-4 py-3">{d.prenom} {d.nom} <span className="text-gray-400">({d.email})</span></td>
                  <td className="px-4 py-3"><StatutBadge statut={d.statut} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(d.cree_le).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <Link to={`/demandes/${d.id}`} className="text-km-green hover:underline">Traiter</Link>
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
