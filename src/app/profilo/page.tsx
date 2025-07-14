"use client";
import React, { useState } from "react";
import { Plus, Info, KeyRound, Eye, EyeOff, X, User, Building2, Hash } from "lucide-react";
import supabase, { getCurrentUser } from "@/lib/supabase/client";
import { ENTITY_TYPES } from "@/lib/supabase/entityTypes";

// Definizione dei tipi
interface User {
  id: string;
  nome?: string;
  email?: string;
}

interface Entity {
  id: string;
  name: string;
  body?: {
    partita_iva: string;
    tipo: string;
  };
}

async function fetchUserEntities() {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const res = await fetch("/api/entities", {
    headers: {
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.entities || [];
}

export default function ProfilePage() {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entitiesLoading, setEntitiesLoading] = useState(true);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [addEntityLoading, setAddEntityLoading] = useState(false);
  const [addEntityError, setAddEntityError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', partita_iva: '', tipo: ENTITY_TYPES[0] });

  const [showEditEntityModal, setShowEditEntityModal] = useState(false);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [editForm, setEditForm] = useState({ name: '', partita_iva: '', tipo: ENTITY_TYPES[0] });
  const [editEntityLoading, setEditEntityLoading] = useState(false);
  const [editEntityError, setEditEntityError] = useState<string | null>(null);

  React.useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
    fetchUserEntities().then((ents) => {
      setEntities(ents);
      setEntitiesLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400">Utente non autenticato</p>
        </div>
      </div>
    );
  }

  async function handleAddEntity(e: React.FormEvent) {
    e.preventDefault();
    setAddEntityLoading(true);
    setAddEntityError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const res = await fetch('/api/entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setAddEntityError(data.error || 'Errore creazione entità');
      setAddEntityLoading(false);
      return;
    }
    setAddEntityLoading(false);
    setForm({ name: '', partita_iva: '', tipo: ENTITY_TYPES[0] });
    setShowAddEntityModal(false);
    setEntitiesLoading(true);
    fetchUserEntities().then((ents) => {
      setEntities(ents);
      setEntitiesLoading(false);
    });
  }

  function handleEditClick(entity: Entity) {
    setEditEntity(entity);
    setEditForm({
      name: entity.name || '',
      partita_iva: entity.body?.partita_iva || '',
      tipo: entity.body?.tipo || ENTITY_TYPES[0],
    });
    setShowEditEntityModal(true);
  }

  async function handleEditEntity(e: React.FormEvent) {
    e.preventDefault();
    if (!editEntity) return;
    
    setEditEntityLoading(true);
    setEditEntityError(null);
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const res = await fetch('/api/entities', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        entity_id: editEntity.id,
        name: editForm.name,
        partita_iva: editForm.partita_iva,
        tipo: editForm.tipo,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setEditEntityError(data.error || 'Errore modifica entità');
      setEditEntityLoading(false);
      return;
    }
    setEditEntityLoading(false);
    setShowEditEntityModal(false);
    setEditEntity(null);
    setEntitiesLoading(true);
    fetchUserEntities().then((ents) => {
      setEntities(ents);
      setEntitiesLoading(false);
    });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    const { newPassword, confirmPassword } = passwordForm;
    
    // Validazione
    if (!newPassword || !confirmPassword) {
      setPasswordError('Compilare tutti i campi');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('La password deve essere di almeno 6 caratteri');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Le password non corrispondono');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setPasswordError(error.message);
        setPasswordLoading(false);
        return;
      }
      
      setPasswordSuccess(true);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setPasswordLoading(false);
      
      // Chiudi il modal dopo 2 secondi
      setTimeout(() => {
        setShowModal(false);
        setPasswordSuccess(false);
      }, 2000);
      
    } catch {
      setPasswordError('Errore durante il cambio password');
      setPasswordLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-thin text-gray-900 dark:text-white mb-2">
            Profilo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-light">
            Gestisci le tue informazioni personali e le entità fiscali
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nome || "Non specificato"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all duration-200 shadow-sm"
              onClick={() => {
                setShowModal(true);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
            >
              <KeyRound size={20} />
              Cambia password
            </button>
          </div>
        </div>

        {/* Entities Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                  Entità fiscali
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gestisci le tue entità fiscali collegate
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
                onClick={() => setShowAddEntityModal(true)}
              >
                <Plus size={20} />
                Aggiungi entità
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entità
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P.IVA / CF
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entitiesLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                        <p className="text-gray-500 dark:text-gray-400">Caricamento entità...</p>
                      </div>
                    </td>
                  </tr>
                ) : entities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">Nessuna entità collegata</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Aggiungi la tua prima entità fiscale
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entities.map((e) => (
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {e.name}
                            </div>
                            {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {e.id}
                            </div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-900 dark:text-white">
                            {e.body?.partita_iva}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {e.body?.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                          onClick={() => handleEditClick(e)}
                        >
                          <Info size={16} />
                          Modifica
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Password Change Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setPasswordForm({ newPassword: '', confirmPassword: '' });
                  setPasswordError(null);
                  setPasswordSuccess(false);
                }}
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
                Cambia password
              </h2>
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nuova password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showRepeat ? "text" : "password"}
                    placeholder="Ripeti nuova password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowRepeat((v) => !v)}
                    tabIndex={-1}
                  >
                    {showRepeat ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {passwordError && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    Password cambiata con successo!
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setShowModal(false);
                      setPasswordForm({ newPassword: '', confirmPassword: '' });
                      setPasswordError(null);
                      setPasswordSuccess(false);
                    }}
                    disabled={passwordLoading}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Cambio password...' : 'Salva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Entity Modal */}
        {showAddEntityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowAddEntityModal(false)}
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
                Aggiungi entità fiscale
              </h2>
              <form className="space-y-4" onSubmit={handleAddEntity}>
                <input
                  type="text"
                  placeholder="Ragione sociale"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Partita IVA / CF"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={form.partita_iva}
                  onChange={e => setForm(f => ({ ...f, partita_iva: e.target.value }))}
                  required
                />
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  required
                >
                  {ENTITY_TYPES.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                {addEntityError && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    {addEntityError}
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setShowAddEntityModal(false)}
                    disabled={addEntityLoading}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={addEntityLoading}
                  >
                    {addEntityLoading ? 'Salvataggio...' : 'Salva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Entity Modal */}
        {showEditEntityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowEditEntityModal(false)}
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
                Modifica entità fiscale
              </h2>
              <form className="space-y-4" onSubmit={handleEditEntity}>
                <input
                  type="text"
                  placeholder="Ragione sociale"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Partita IVA / CF"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editForm.partita_iva}
                  onChange={e => setEditForm(f => ({ ...f, partita_iva: e.target.value }))}
                  required
                />
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editForm.tipo}
                  onChange={e => setEditForm(f => ({ ...f, tipo: e.target.value }))}
                  required
                >
                  {ENTITY_TYPES.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                {editEntityError && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    {editEntityError}
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setShowEditEntityModal(false)}
                    disabled={editEntityLoading}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={editEntityLoading}
                  >
                    {editEntityLoading ? 'Salvataggio...' : 'Salva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 