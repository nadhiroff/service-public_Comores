import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import EspaceCitoyen from "./pages/EspaceCitoyen";
import NouvelleDemande from "./pages/NouvelleDemande";
import DemandeDetail from "./pages/DemandeDetail";
import Suivi from "./pages/Suivi";
import AdminHome from "./pages/admin/AdminHome";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services/:code" element={<ServiceDetail />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
              <Route path="/suivi" element={<Suivi />} />

              <Route
                path="/espace-citoyen"
                element={
                  <ProtectedRoute allow={["citoyen"]}>
                    <EspaceCitoyen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nouvelle-demande/:code"
                element={
                  <ProtectedRoute allow={["citoyen"]}>
                    <NouvelleDemande />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/demandes/:id"
                element={
                  <ProtectedRoute allow={["citoyen", "admin_service", "super_admin"]}>
                    <DemandeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allow={["admin_service", "super_admin"]}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
