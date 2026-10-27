import type { Statut } from "../types";

const STYLES: Record<Statut, { label: string; classes: string }> = {
  recue: { label: "Reçue", classes: "bg-blue-100 text-blue-800" },
  en_attente_pieces: { label: "En attente de pièces", classes: "bg-amber-100 text-amber-800" },
  en_cours: { label: "En cours d'instruction", classes: "bg-indigo-100 text-indigo-800" },
  validee: { label: "Validée", classes: "bg-green-100 text-green-800" },
  rejetee: { label: "Rejetée", classes: "bg-red-100 text-red-800" }
};

export default function StatutBadge({ statut }: { statut: Statut }) {
  const s = STYLES[statut] || STYLES.recue;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${s.classes}`}>
      {s.label}
    </span>
  );
}
