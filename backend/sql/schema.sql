-- =========================================================
-- service-public.km — Schéma de base de données MySQL
-- =========================================================
CREATE DATABASE IF NOT EXISTS service_public_km CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE service_public_km;

-- ---------------------------------------------------------
-- Rôles et utilisateurs
-- ---------------------------------------------------------
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL UNIQUE   -- citoyen | admin_service | super_admin
);

INSERT INTO roles (nom) VALUES ('citoyen'), ('admin_service'), ('super_admin');

CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telephone VARCHAR(30),
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL DEFAULT 1,
  service_id INT NULL,              -- renseigné si role = admin_service
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ---------------------------------------------------------
-- Catégories et services (catalogue piloté par la base)
-- ---------------------------------------------------------
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,     -- ex: etat_civil, identite, visa...
  nom VARCHAR(150) NOT NULL,
  icone VARCHAR(50),
  ordre INT DEFAULT 0
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categorie_id INT NOT NULL,
  code VARCHAR(80) NOT NULL UNIQUE,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  cout VARCHAR(150),
  duree_estimee VARCHAR(150),
  pieces_a_fournir TEXT,
  institution_responsable VARCHAR(200),
  actif BOOLEAN NOT NULL DEFAULT TRUE,   -- bascule Super Admin
  FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- ---------------------------------------------------------
-- Demandes (dossiers déposés par les citoyens)
-- ---------------------------------------------------------
CREATE TABLE demandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_suivi VARCHAR(20) NOT NULL UNIQUE,
  utilisateur_id INT NOT NULL,
  service_id INT NOT NULL,
  statut ENUM('recue','en_attente_pieces','en_cours','validee','rejetee') NOT NULL DEFAULT 'recue',
  motif_rejet TEXT NULL,
  donnees_formulaire JSON NULL,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  maj_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE demande_historique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demande_id INT NOT NULL,
  statut ENUM('recue','en_attente_pieces','en_cours','validee','rejetee') NOT NULL,
  commentaire TEXT,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demande_id INT NOT NULL,
  nom_original VARCHAR(255) NOT NULL,
  chemin_fichier VARCHAR(500) NOT NULL,
  type_mime VARCHAR(100),
  taille_octets INT,
  televerse_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

CREATE TABLE paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demande_id INT NOT NULL,
  montant DECIMAL(12,2) NOT NULL,
  devise VARCHAR(10) DEFAULT 'KMF',
  moyen_paiement VARCHAR(50),          -- mobicash | holodimoney | fedapay | carte
  reference_transaction VARCHAR(150),
  statut ENUM('en_attente','reussi','echoue') DEFAULT 'en_attente',
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demande_id INT NOT NULL,
  expediteur_id INT NOT NULL,
  contenu TEXT NOT NULL,
  envoye_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
  FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
);

-- ---------------------------------------------------------
-- Journaux d'activité et paramètres globaux
-- ---------------------------------------------------------
CREATE TABLE journaux_activite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  niveau ENUM('info','avertissement','erreur') DEFAULT 'info',
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parametres (
  cle VARCHAR(100) PRIMARY KEY,
  valeur TEXT
);

INSERT INTO parametres (cle, valeur) VALUES
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'Le portail est actuellement en maintenance. Merci de revenir plus tard.');

CREATE TABLE maintenance_historique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action ENUM('active', 'desactive') NOT NULL,
  message TEXT,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
);

CREATE TABLE emails_masse_historique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  sujet VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  destinataires_count INT DEFAULT 0,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
);

-- =========================================================
-- Données de référence : catégories
-- =========================================================
INSERT INTO categories (code, nom, icone, ordre) VALUES
 ('etat_civil','État civil','file-text',1),
 ('identite','Pièces d''identité','id-card',2),
 ('visa','Visa et immigration','plane',3),
 ('entreprises','Entreprises et commerce','briefcase',4),
 ('fiscalite','Fiscalité','receipt',5),
 ('marches_publics','Marchés publics','gavel',6),
 ('justice','Justice et droit','scale',7),
 ('autres','Autres services','layers',8);

-- =========================================================
-- Données de référence : services (issus du cahier des charges)
-- =========================================================
INSERT INTO services (categorie_id, code, nom, description, cout, duree_estimee, pieces_a_fournir, institution_responsable) VALUES
(1,'acte_naissance','Acte de naissance','Délivrance d''une copie intégrale ou d''un extrait d''acte de naissance.','1 000 - 2 000 KMF','24 à 72 heures','Pièce d''identité, numéro/année de l''acte, justificatif de lien de parenté si tiers','Ministère de l''Intérieur — Direction Générale de l''État Civil'),
(1,'acte_mariage','Acte de mariage','Délivrance de la copie ou de l''extrait d''acte de mariage.','1 500 KMF','48 à 72 heures','Pièces d''identité des époux, date et lieu du mariage','Ministère de l''Intérieur — Direction Générale de l''État Civil'),
(1,'acte_deces','Acte de décès','Délivrance de la copie d''acte de décès.','1 000 KMF','24 à 48 heures','Pièce d''identité du demandeur, informations sur le défunt','Ministère de l''Intérieur — Direction Générale de l''État Civil'),
(2,'cni','Carte Nationale d''Identité','Établissement ou renouvellement de la CNI biométrique.','5 000 - 7 500 KMF','5 à 10 jours ouvrés','Acte de naissance récent, 2 photos, justificatif de domicile','Direction Générale de la Sécurité Publique'),
(2,'passeport','Passeport comorien','Établissement, renouvellement ou remplacement du passeport biométrique.','50 000 - 90 000 KMF','10 jours (72h en accéléré)','CNI valide, acte de naissance, 2 photos, ancien passeport','Direction Générale de la Sécurité Publique / Police des Frontières'),
(3,'evisa','e-Visa Union des Comores','Demande de visa électronique pour étrangers.','30 à 90 USD','48 à 96 heures','Passeport valide, photo, billet retour, justificatif d''hébergement','Ministère des Affaires Étrangères — Affaires Consulaires'),
(4,'immatriculation','Immatriculation d''entreprise','Création et immatriculation via le guichet unique.','À partir de 25 000 KMF','3 à 5 jours ouvrés','Statuts, pièce d''identité du gérant, justificatif de siège','ANPI — Guichet Unique'),
(4,'extrait_rccm','Extrait RCCM','Extrait du registre du commerce et du crédit mobilier.','3 000 KMF','24 à 48 heures','Numéro RCCM ou raison sociale, pièce d''identité','Greffe du Tribunal de Commerce / ANPI'),
(5,'declaration_fiscale','Déclaration et paiement de taxes','Télédéclaration et paiement en ligne des impôts et taxes.','Selon barème','Immédiat, validation sous 48h','NIF, justificatifs comptables','Direction Générale des Impôts et des Domaines'),
(5,'attestation_fiscale','Attestation fiscale','Attestation de non-redevance fiscale.','2 000 KMF','48 heures','NIF, dernière quittance, pièce d''identité','Direction Générale des Impôts et des Domaines'),
(6,'consultation_marches','Consultation des marchés publics','Accès aux avis d''appel d''offres.','Gratuit','Immédiat','Aucune','Commission Nationale des Marchés Publics'),
(6,'soumission_marche','Soumission électronique d''offre','Dépôt en ligne d''une offre pour un marché public.','Gratuit','Selon délai de l''AO','Dossier administratif, offre technique et financière','Commission Nationale des Marchés Publics'),
(7,'portail_juridique','Portail juridique','Accès au Journal Officiel, codes et jurisprudence.','Gratuit','Immédiat','Aucune','Ministère de la Justice'),
(8,'certificat_residence','Certificat de résidence','Attestation officielle du lieu de résidence.','1 000 KMF','24 à 48 heures','Pièce d''identité, justificatif de domicile','Mairie / Commissariat local'),
(8,'permis_conduire','Permis de conduire','Établissement, renouvellement ou conversion du permis.','5 000 - 10 000 KMF','7 à 10 jours ouvrés','CNI, certificat médical, 2 photos','Direction Générale de la Sécurité Publique');

-- =========================================================
-- Compte Super Admin par défaut
-- Le mot de passe est défini via le script Node dédié après
-- l'exécution de ce script SQL — voir README (npm run seed:admin).
-- Ne pas insérer de hash ici pour éviter un mot de passe connu en dur.
-- =========================================================
-- Ajouter les colonnes d'identité (d'abord sans contrainte NOT NULL pour les données existantes)
ALTER TABLE utilisateurs 
ADD COLUMN type_identite ENUM('nin', 'passport') DEFAULT 'nin' AFTER prenom,
ADD COLUMN numero_identite VARCHAR(50) AFTER type_identite;

-- Mettre à jour les enregistrements existants avec des valeurs uniques
UPDATE utilisateurs SET numero_identite = CONCAT('TEMP_', id, '_', UNIX_TIMESTAMP()) WHERE numero_identite IS NULL OR numero_identite = '';
UPDATE utilisateurs SET type_identite = 'nin' WHERE type_identite IS NULL;

-- Maintenant rendre les colonnes NOT NULL
ALTER TABLE utilisateurs 
MODIFY COLUMN type_identite ENUM('nin', 'passport') NOT NULL DEFAULT 'nin',
MODIFY COLUMN numero_identite VARCHAR(50) NOT NULL;

-- Créer l'index unique après avoir mis à jour les données
ALTER TABLE utilisateurs 
ADD UNIQUE INDEX idx_numero_identite (numero_identite);