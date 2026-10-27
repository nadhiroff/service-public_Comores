export type Role = "citoyen" | "admin_service" | "super_admin";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  service_id?: number | null;
}

export interface Service {
  id: number;
  code: string;
  nom: string;
  description: string;
  cout: string;
  duree_estimee: string;
  pieces_a_fournir: string;
  institution_responsable: string;
  actif: boolean;
  categorie_id: number;
  categorie_nom?: string;
}

export interface Categorie {
  id: number;
  code: string;
  nom: string;
  icone: string;
  services: Service[];
}

export type Statut = "recue" | "en_attente_pieces" | "en_cours" | "validee" | "rejetee";

export interface Demande {
  id: number;
  numero_suivi: string;
  statut: Statut;
  cree_le: string;
  maj_le: string;
  service_nom: string;
  service_code?: string;
}
