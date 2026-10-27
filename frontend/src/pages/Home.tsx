import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/client";
import type { Categorie, Service } from "../types";

export default function Home() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "/comores-islands.png",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1920&q=80",
    "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=1920&q=80"
  ];

  useEffect(() => {
    api.get("/services").then((res) => setCategories(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      api.get(`/services/search`, { params: { q: query } }).then((res) => setResults(res.data));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div>
      {/* Bandeau héro */}
      <section className="relative h-[700px] pb-40 overflow-visible">
        {/* Carousel */}
        <div className="absolute inset-0 overflow-hidden">
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
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white overflow-visible">
          <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Toutes vos démarches administratives, en un seul endroit
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-lg">
              Portail national des services publics de l'Union des Comores — état civil, identité,
              entreprises, fiscalité, marchés publics et bien plus.
            </p>

            <div className="relative max-w-xl mx-auto z-50" id="search-container">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un service (ex : passeport, acte de naissance...)"
                className="w-full pl-14 pr-5 py-5 rounded-2xl text-gray-800 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-km-yellow shadow-xl border-2 border-gray-300 focus:border-km-yellow bg-white"
              />
              {results.length > 0 && (
                <div className="fixed w-full max-w-xl bg-white rounded-lg shadow-lg text-left max-h-96 overflow-y-auto z-[100] left-1/2 -translate-x-1/2 mt-2">
                  {results.map((s) => (
                    <Link
                      key={s.id}
                      to={`/services/${s.code}`}
                      className="block px-4 py-3 hover:bg-gray-50 border-b last:border-0 text-gray-800"
                    >
                      <p className="font-medium">{s.nom}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{s.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="w-full px-4 py-12">
        <h2 className="text-xl font-bold mb-6 text-km-navy">Catégories de services</h2>
        {loading ? (
          <p className="text-gray-500">Chargement des services...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-km-green/10 text-km-green flex items-center justify-center font-bold mb-3">
                  {cat.nom.charAt(0)}
                </div>
                <h3 className="font-semibold mb-2 text-km-navy">{cat.nom}</h3>
                <ul className="space-y-1">
                  {cat.services.map((s) => (
                    <li key={s.id}>
                      <Link to={`/services/${s.code}`} className="block">
                        <p className="text-sm text-gray-600 hover:text-km-green font-medium">{s.nom}</p>
                        <p className="text-xs text-gray-500 line-clamp-5 leading-relaxed">{s.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
