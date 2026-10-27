import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../../api/client";

type Tab = "stats" | "utilisateurs" | "maintenance" | "email" | "logs";

interface DeleteModal {
  show: boolean;
  type: string;
  id: number;
  onConfirm: () => void;
}

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState<Tab>("stats");
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ show: false, type: "", id: 0, onConfirm: () => {} });

  function showDeleteModal(type: string, id: number, onConfirm: () => void) {
    setDeleteModal({ show: true, type, id, onConfirm });
  }

  function handleDeleteConfirm() {
    deleteModal.onConfirm();
    setDeleteModal({ show: false, type: "", id: 0, onConfirm: () => {} });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-km-navy mb-1">Tableau de bord — Super Admin</h1>
      <p className="text-gray-500 mb-6">Pilotage global du portail national des services publics.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["stats", "utilisateurs", "maintenance", "email", "logs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t ? "bg-km-navy text-white" : "bg-white border text-gray-600"
            }`}
          >
            {t === "stats" && "Statistiques"}
            {t === "utilisateurs" && "Utilisateurs"}
            {t === "maintenance" && "Mode maintenance"}
            {t === "email" && "Email de masse"}
            {t === "logs" && "Journaux"}
          </button>
        ))}
      </div>

      {tab === "stats" && <StatsPanel />}
      {tab === "utilisateurs" && <UsersPanel showDeleteModal={showDeleteModal} />}
      {tab === "maintenance" && <MaintenancePanel showDeleteModal={showDeleteModal} />}
      {tab === "email" && <BroadcastPanel showDeleteModal={showDeleteModal} />}
      {tab === "logs" && <LogsPanel />}

      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-km-navy mb-2">Confirmation de suppression</h3>
            <p className="text-gray-600 mb-6">
              {deleteModal.type === "user" && "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"}
              {deleteModal.type === "maintenance" && "Êtes-vous sûr de vouloir supprimer cet historique de maintenance ?"}
              {deleteModal.type === "email" && "Êtes-vous sûr de vouloir supprimer cet historique d'email ?"}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, type: "", id: 0, onConfirm: () => {} })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-km-red text-white hover:opacity-90"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);
  if (!stats) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Usagers inscrits</p>
        <p className="text-3xl font-bold text-km-navy">{stats.total_utilisateurs}</p>
      </div>
      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Demandes totales</p>
        <p className="text-3xl font-bold text-km-navy">{stats.total_demandes}</p>
      </div>
      <div className="bg-white border rounded-xl p-5 md:col-span-2">
        <p className="text-sm font-medium mb-3">Répartition par statut</p>
        <ul className="space-y-1 text-sm">
          {stats.parStatut.map((s: any) => (
            <li key={s.statut} className="flex justify-between border-b py-1">
              <span>{s.statut}</span><span className="font-medium">{s.total}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white border rounded-xl p-5 md:col-span-2">
        <p className="text-sm font-medium mb-3">Demandes par service</p>
        <ul className="space-y-1 text-sm">
          {stats.parService.map((s: any) => (
            <li key={s.nom} className="flex justify-between border-b py-1">
              <span>{s.nom}</span><span className="font-medium">{s.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UsersPanel({ showDeleteModal }: { showDeleteModal: (type: string, id: number, onConfirm: () => void) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  function reload() {
    api.get("/admin/utilisateurs").then((res) => setUsers(res.data));
  }
  useEffect(reload, []);

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-3">Nom</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Rôle</th>
            <th className="text-left px-4 py-3">Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-3">{u.prenom} {u.nom}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">{u.actif ? "Actif" : "Désactivé"}</td>
              <td className="px-4 py-3 space-x-3">
                <button
                  onClick={() => api.patch(`/admin/utilisateurs/${u.id}/toggle`).then(reload)}
                  className="text-km-navy hover:underline"
                >
                  {u.actif ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => showDeleteModal("user", u.id, () => api.delete(`/admin/utilisateurs/${u.id}`).then(reload))}
                  className="text-km-red hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaintenancePanel({ showDeleteModal }: { showDeleteModal: (type: string, id: number, onConfirm: () => void) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  async function loadCurrentState() {
    try {
      const res = await api.get("/admin/maintenance");
      setEnabled(res.data.enabled);
      setMessage(res.data.message || "");
    } catch (error) {
      console.error("Erreur lors du chargement de l'état maintenance:", error);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post("/admin/maintenance", { enabled, message });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadHistory();
    loadCurrentState();
  }

  function loadHistory() {
    api.get("/admin/maintenance-historique").then((res) => setHistory(res.data));
  }

  useEffect(() => {
    loadCurrentState();
    loadHistory();
  }, []);

  function deleteHistoryItem(id: number) {
    showDeleteModal("maintenance", id, async () => {
      await api.delete(`/admin/maintenance-historique/${id}`);
      loadHistory();
    });
  }

  async function toggleMaintenanceFromHistory(id: number) {
    await api.patch(`/admin/maintenance-historique/${id}/toggle`);
    loadHistory();
    loadCurrentState();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 max-w-lg space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span className="text-sm font-medium">Activer le mode maintenance</span>
        </label>
        <textarea
          placeholder="Message personnalisé affiché aux usagers"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={3}
        />
        <button className="bg-km-navy text-white px-4 py-2 rounded-lg text-sm">Enregistrer</button>
        {saved && <p className="text-sm text-green-600">Paramètre mis à jour.</p>}
      </form>

      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-medium text-sm mb-3">Historique des maintenances</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun historique.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                <div>
                  <span className={`font-medium ${h.action === 'active' ? 'text-km-red' : 'text-km-green'}`}>
                    {h.action === 'active' ? 'Activé' : 'Désactivé'}
                  </span>
                  <span className="text-gray-500 ml-2">
                    par {h.prenom} {h.nom} - {new Date(h.cree_le).toLocaleString('fr-FR')}
                  </span>
                  {h.message && <p className="text-gray-600 text-xs mt-1">{h.message}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMaintenanceFromHistory(h.id)}
                    className="text-km-navy hover:underline text-xs"
                  >
                    {h.action === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(h.id)}
                    className="text-km-red hover:underline text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BroadcastPanel({ showDeleteModal }: { showDeleteModal: (type: string, id: number, onConfirm: () => void) => void }) {
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/admin/broadcast-email", { sujet, contenu });
      setResult(data.message);
      setSujet("");
      setContenu("");
      loadHistory();
    } catch (error) {
      setResult("Erreur lors de l'envoi de l'email.");
    } finally {
      setSending(false);
    }
  }

  function loadHistory() {
    api.get("/admin/email-historique").then((res) => setHistory(res.data));
  }

  useEffect(loadHistory, []);

  function deleteHistoryItem(id: number) {
    showDeleteModal("email", id, async () => {
      await api.delete(`/admin/email-historique/${id}`);
      loadHistory();
    });
  }

  async function resendEmailFromHistory(id: number) {
    setSending(true);
    try {
      const { data } = await api.post(`/admin/email-historique/${id}/resend`);
      setResult(data.message);
    } catch (error) {
      setResult("Erreur lors du renvoi de l'email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 max-w-lg space-y-4">
        <input
          placeholder="Sujet de l'email"
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Contenu (HTML autorisé)"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          rows={5}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <button 
          disabled={sending}
          className="bg-km-navy text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Envoi en cours..." : "Envoyer à tous les inscrits"}
        </button>
        {result && <p className="text-sm text-green-600">{result}</p>}
      </form>

      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-medium text-sm mb-3">Historique des emails de masse</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun historique.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium">{h.sujet}</p>
                  <p className="text-gray-500 text-xs">
                    par {h.prenom} {h.nom} - {new Date(h.cree_le).toLocaleString('fr-FR')} - {h.destinataires_count} destinataires
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => resendEmailFromHistory(h.id)}
                    disabled={sending}
                    className="text-km-navy hover:underline text-xs disabled:opacity-50"
                  >
                    Renvoyer
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(h.id)}
                    className="text-km-red hover:underline text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    api.get("/admin/logs").then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="bg-white border rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 sticky top-0">
          <tr>
            <th className="text-left px-4 py-2">Date</th>
            <th className="text-left px-4 py-2">Action</th>
            <th className="text-left px-4 py-2">Détails</th>
            <th className="text-left px-4 py-2">Niveau</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="px-4 py-2 text-gray-500">{new Date(l.cree_le).toLocaleString("fr-FR")}</td>
              <td className="px-4 py-2">{l.action}</td>
              <td className="px-4 py-2 text-gray-500">{l.details}</td>
              <td className="px-4 py-2">{l.niveau}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
