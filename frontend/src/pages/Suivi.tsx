import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/client";
import StatutBadge from "../components/StatutBadge";

export default function Suivi() {
  const [numero, setNumero] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "/comores-islands.png",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1920&q=80",
    "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=1920&q=80"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/demandes/suivi/${numero.trim()}`);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Numéro introuvable.");
    }
  }

  return (
    <div>
      {/* Bandeau héro avec carrousel */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-colors z-10"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-colors z-10"
        >
          <ChevronRight size={24} className="text-gray-800" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Suivre une demande
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-lg">
              Saisissez votre numéro de suivi (format KM-AAAA-XXXXXX), sans avoir besoin de vous connecter.
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="KM-2026-123456"
                className="w-full pl-14 pr-5 py-5 rounded-2xl text-gray-800 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-km-green shadow-xl border-2 border-gray-300 focus:border-km-green bg-white font-mono"
              />
              <button
                onClick={handleSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-km-green text-white px-6 py-3 rounded-xl hover:opacity-90 font-medium"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <div className="max-w-xl mx-auto px-4 py-12">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2 mb-6">{error}</p>}

        {result && (
          <div className="bg-white border rounded-xl p-5 space-y-3 shadow-lg">
            <p className="font-mono font-bold text-km-navy text-lg">{result.numero_suivi}</p>
            <p className="text-gray-600">{result.service_nom}</p>
            <StatutBadge statut={result.statut} />
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Historique</p>
              <ul className="space-y-1">
                {result.historique.map((h: any, i: number) => (
                  <li key={i} className="text-sm text-gray-500 border-l-2 border-km-green pl-3">
                    {h.statut} — {new Date(h.cree_le).toLocaleString("fr-FR")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Section informative */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-km-navy mb-6">Procédure de vérification</h2>
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <p className="text-gray-700 leading-relaxed mb-4">
              Le Portail national des services publics de l'Union des Comores permet de suivre l'état de vos demandes administratives en temps réel. Cette fonctionnalité vous permet de vérifier le statut de votre demande sans avoir besoin de vous connecter à votre espace personnel.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le numéro de suivi de votre demande est indiqué sur le reçu de dépôt ou dans l'email de confirmation que vous avez reçu lors de l'enregistrement de votre demande. Ce numéro suit le format KM-AAAA-XXXXXX où KM représente le code pays, AAAA l'année et XXXXXX un identifiant unique.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si vous avez reçu un numéro de suivi et souhaitez vérifier l'état d'avancement de votre demande, entrez ce numéro dans la zone de recherche ci-dessus. Vous pourrez alors consulter le statut actuel de votre demande, l'historique des changements de statut et les informations relatives au service demandé.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les demandes sur le portail national des services publics de l'Union des Comores sont traitées selon les délais réglementaires en vigueur. En cas de retard ou de problème, vous pouvez contacter le service concerné via les coordonnées indiquées dans votre espace personnel.
            </p>
            <div className="mt-6 p-4 bg-km-navy/5 rounded-lg border-l-4 border-km-navy">
              <p className="text-sm text-gray-600 font-medium">
                Pour toute assistance supplémentaire, n'hésitez pas à contacter notre service client par email à contact@service-public.km ou par téléphone au +269 123 456 789.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
