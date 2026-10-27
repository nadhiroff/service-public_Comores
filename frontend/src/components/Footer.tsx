import { useState } from "react";
import { Building, Info, Mail, Heart, MessageSquare, AlertTriangle, BookOpen, FileText, Scroll, Shield, UserCheck, Accessibility, Phone } from "lucide-react";

function SocialIcon({ name, href, children }: { name: string; href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href}
      className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
      aria-label={name}
    >
      <div className="transform group-hover:rotate-12 transition-transform duration-300">
        {children}
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-km-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </a>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function Footer() {
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const modalData: Record<string, { title: string; content: string }> = {
    "Services publics": {
      title: "Services publics",
      content: "Découvrez tous les services publics disponibles sur le portail national de l'Union des Comores. Accédez aux démarches administratives en ligne pour l'état civil, les pièces d'identité, les visas, les entreprises et bien plus encore."
    },
    "À propos": {
      title: "À propos",
      content: "Le portail national des services publics de l'Union des Comores a pour mission de simplifier les démarches administratives des citoyens et des entreprises en offrant un accès unique et numérique à tous les services publics."
    },
    "Contactez-nous": {
      title: "Contactez-nous",
      content: "Notre équipe est à votre disposition pour toute question ou assistance. Contactez-nous par email à contact@service-public.km ou par téléphone au +269 123 456 789."
    },
    "Contribuer": {
      title: "Contribuer",
      content: "Vous pouvez contribuer à l'amélioration du portail en partageant vos suggestions et en participant aux enquêtes de satisfaction. Votre avis compte pour nous."
    },
    "Faire une suggestion": {
      title: "Faire une suggestion",
      content: "Nous sommes toujours à l'écoute de vos suggestions pour améliorer nos services. N'hésitez pas à nous faire part de vos idées via notre formulaire de contact."
    },
    "Signaler un problème": {
      title: "Signaler un problème",
      content: "Si vous rencontrez un problème technique ou une difficulté sur le portail, signalez-le-nous immédiatement. Notre équipe technique interviendra dans les plus brefs délais."
    },
    "En savoir plus": {
      title: "En savoir plus",
      content: "Pour en savoir plus sur le portail et ses services, consultez notre documentation complète ou contactez notre service d'information."
    },
    "Mentions légales": {
      title: "Mentions légales",
      content: "Le présent portail est édité par le Gouvernement de l'Union des Comores. Directeur de la publication : Ministère du Numérique. Hébergement : Centre de calcul national."
    },
    "CGU": {
      title: "Conditions Générales d'Utilisation",
      content: "L'utilisation de ce portail est soumise aux présentes conditions générales. En accédant à ce site, vous acceptez sans réserve ces conditions d'utilisation."
    },
    "Données personnelles": {
      title: "Données personnelles",
      content: "Nous nous engageons à protéger vos données personnelles conformément à la loi relative à la protection des données personnelles. Vos informations sont collectées et traitées de manière sécurisée."
    },
    "Exercer ses droits": {
      title: "Exercer ses droits",
      content: "Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous."
    },
    "Politique de confidentialité": {
      title: "Politique de confidentialité",
      content: "Notre politique de confidentialité définit comment nous collectons, utilisons et protégeons vos données personnelles. Nous nous engageons à respecter votre vie privée."
    },
    "Accessibilité": {
      title: "Accessibilité",
      content: "Ce portail est conçu pour être accessible à tous les utilisateurs, y compris les personnes en situation de handicap. Nous nous conformons aux normes d'accessibilité numériques."
    },
    "Contact": {
      title: "Contact",
      content: "Pour toute demande d'information ou d'assistance, contactez notre équipe : email : contact@service-public.km, téléphone : +269 123 456 789, adresse : Moroni, Union des Comores."
    }
  };

  const handleLinkClick = (linkName: string) => {
    if (modalData[linkName]) {
      setModalContent(modalData[linkName]);
    }
  };

  return (
    <>
      <footer className="bg-km-navy text-white mt-16">
        <div className="w-full px-4 py-8 grid md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2">
            <p className="font-bold text-lg mb-2">Union des Comores</p>
            <p className="text-gray-300 mb-4">Portail national des services publics — un seul point d'accès pour toutes vos démarches administratives.</p>
            <div className="flex gap-4 mt-4">
              <SocialIcon name="Twitter" href="https://twitter.com">
                <TwitterIcon />
              </SocialIcon>
              <SocialIcon name="Facebook" href="https://facebook.com">
                <FacebookIcon />
              </SocialIcon>
              <SocialIcon name="Instagram" href="https://instagram.com">
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon name="LinkedIn" href="https://linkedin.com">
                <LinkedInIcon />
              </SocialIcon>
            </div>
          </div>
          <div>
            <p className="font-bold mb-3">Navigation</p>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => handleLinkClick("Services publics")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Building size={16} /> Services publics</button></li>
              <li><button onClick={() => handleLinkClick("À propos")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Info size={16} /> À propos</button></li>
              <li><button onClick={() => handleLinkClick("Contactez-nous")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Mail size={16} /> Contactez-nous</button></li>
              <li><button onClick={() => handleLinkClick("Contribuer")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Heart size={16} /> Contribuer</button></li>
              <li><button onClick={() => handleLinkClick("Faire une suggestion")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><MessageSquare size={16} /> Faire une suggestion</button></li>
              <li><button onClick={() => handleLinkClick("Signaler un problème")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><AlertTriangle size={16} /> Signaler un problème</button></li>
              <li><button onClick={() => handleLinkClick("En savoir plus")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><BookOpen size={16} /> En savoir plus</button></li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Liens utiles</p>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => handleLinkClick("Mentions légales")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><FileText size={16} /> Mentions légales</button></li>
              <li><button onClick={() => handleLinkClick("CGU")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Scroll size={16} /> CGU</button></li>
              <li><button onClick={() => handleLinkClick("Données personnelles")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Shield size={16} /> Données personnelles</button></li>
              <li><button onClick={() => handleLinkClick("Exercer ses droits")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><UserCheck size={16} /> Exercer ses droits</button></li>
              <li><button onClick={() => handleLinkClick("Politique de confidentialité")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Shield size={16} /> Politique de confidentialité</button></li>
              <li><button onClick={() => handleLinkClick("Accessibilité")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Accessibility size={16} /> Accessibilité</button></li>
              <li><button onClick={() => handleLinkClick("Contact")} className="hover:text-km-yellow transition-colors text-left w-full flex items-center gap-2"><Phone size={16} /> Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Union des Comores — Tous droits réservés</p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-km-yellow transition-colors">Ministère de l'Intérieur</a>
              <a href="#" className="hover:text-km-yellow transition-colors">Ministère des Affaires Étrangères</a>
              <a href="#" className="hover:text-km-yellow transition-colors">Ministère de la Justice</a>
              <a href="#" className="hover:text-km-yellow transition-colors">Direction Générale des Impôts</a>
            </div>
          </div>
        </div>
      </footer>

      {modalContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-km-navy mb-4">{modalContent.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{modalContent.content}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-6 py-2 rounded-lg bg-km-navy text-white hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
