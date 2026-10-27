import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/client";
import type { Service } from "../types";
import { useAuth } from "../context/AuthContext";

export default function ServiceDetail() {
  const { code } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/services/${code}`)
      .then((res) => setService(res.data))
      .catch((err) => setError(err.response?.data?.message || "Service introuvable."));
  }, [code]);

  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-red-600">{error}</div>;
  if (!service) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Chargement...</div>;

  const rows: [string, string][] = [
    ["Coût", service.cout],
    ["Durée estimée", service.duree_estimee],
    ["Pièces à fournir", service.pieces_a_fournir],
    ["Institution responsable", service.institution_responsable]
  ];

  return (
    <div className="w-full px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-km-navy hover:text-km-green font-medium mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Retour à l'accueil</span>
      </Link>
      <p className="text-sm text-km-green font-medium mb-1">{service.categorie_nom}</p>
      <h1 className="text-2xl font-bold text-km-navy mb-4">{service.nom}</h1>
      
      <div className="bg-gradient-to-r from-km-navy to-km-navy/80 text-white rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-100 leading-relaxed">{service.description}</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm mb-8">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 border-b last:border-0">
            <div className="col-span-1 bg-gray-50 px-4 py-3 font-medium text-sm text-gray-600">{label}</div>
            <div className="col-span-2 px-4 py-3 text-sm text-gray-800">{value}</div>
          </div>
        ))}
      </div>

      {user?.role === "citoyen" ? (
        <Link
          to={`/nouvelle-demande/${service.code}`}
          className="inline-block bg-km-green text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
        >
          Faire une demande en ligne
        </Link>
      ) : (
        <Link
          to="/connexion"
          className="inline-block bg-km-navy text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
        >
          Se connecter pour faire une demande
        </Link>
      )}
    </div>
  );
}
