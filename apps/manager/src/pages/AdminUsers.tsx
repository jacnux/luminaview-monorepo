import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserAlbums, setSelectedUserAlbums] = useState<any[] | null>(null);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [viewingAlbum, setViewingAlbum] = useState<any | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [editingQuotaUser, setEditingQuotaUser] = useState<any | null>(null);
  const [newQuota, setNewQuota] = useState<string>('');
  const [editingEmailUser, setEditingEmailUser] = useState<any | null>(null);
  const [newEmail, setNewEmail] = useState<string>('');

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTab, setBroadcastTab] = useState<'edit' | 'preview'>('edit');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (user?.isAdmin) fetchUsers();
  }, [user]);

  const verifiedUsersCount = users.filter(u => u.isEmailVerified !== false).length;

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      alert("Veuillez renseigner le sujet et le message.");
      return;
    }

    if (!window.confirm(`Confirmer l'envoi de cet email à ${verifiedUsersCount} utilisateur(s) vérifié(s) ?`)) {
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await api.post('/admin/broadcast-email', {
        subject: broadcastSubject.trim(),
        message: broadcastMessage.trim(),
      });
      alert(res.data.message || 'Message envoyé avec succès !');
      setBroadcastModalOpen(false);
      setBroadcastSubject('');
      setBroadcastMessage('');
      setBroadcastTab('edit');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur lors de l'envoi du message.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const renderMarkdownToHtml = (markdown: string) => {
    if (!markdown) return '<p class="text-gray-400 italic">Aucun contenu rédigé.</p>';

    let html = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">$1</h1>');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-500 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');

    const paragraphs = html.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    return paragraphs.map(p => `<p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3">${p.replace(/\n/g, '<br/>')}</p>`).join('');
  };

  const handleViewAlbums = async (userId: string) => {
    setLoadingAlbums(true);
    setSelectedUserAlbums(null);
    setViewingAlbum(null);
    try {
      const res = await api.get(`/users/admin/${userId}/albums`);
      setSelectedUserAlbums(res.data);
    } catch (err) {
      alert('Impossible de charger les albums');
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleViewAlbumPhotos = async (album: any) => {
    setViewingAlbum(album);
    setLoadingPhotos(true);
    setAlbumPhotos([]);
    try {
      const res = await api.get(`/albums/photos/${album._id}`);
      setAlbumPhotos(res.data);
    } catch (err) {
      alert('Impossible de charger les photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const openQuotaModal = (u: any) => {
    setEditingQuotaUser(u);
    setNewQuota((u.quotaLimit / 1024 / 1024).toFixed(0));
  };

  const handleSaveQuota = async () => {
    if (!editingQuotaUser) return;
    try {
      const quotaInBytes = parseFloat(newQuota) * 1024 * 1024;
      await api.put(`/admin/users/${editingQuotaUser._id}`, { quotaLimit: quotaInBytes });
      alert('Quota mis à jour !');
      setEditingQuotaUser(null);
      fetchUsers();
    } catch (err) {
      alert('Erreur lors de la mise à jour du quota');
    }
  };

  const openEmailModal = (u: any) => {
    setEditingEmailUser(u);
    setNewEmail(u.email || '');
  };

  const handleSaveEmail = async () => {
    if (!editingEmailUser || !newEmail) return;
    try {
      await api.put(`/admin/users/${editingEmailUser._id}`, { email: newEmail });
      alert('Email mis à jour !');
      setEditingEmailUser(null);
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la mise à jour de l'email");
    }
  };

  const handleResetPassword = async (u: any) => {
    if (!window.confirm(`Réinitialiser le mot de passe pour ${u.name} ?`)) return;
    try {
      const res = await api.post(`/admin/users/${u._id}/reset-password`);
      alert(`Mot de passe réinitialisé !\n\nNouveau mot de passe temporaire : ${res.data.newPassword}`);
    } catch (err) {
      alert('Erreur lors de la réinitialisation');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Supprimer cet utilisateur et toutes ses données ?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const modalPanelClass = theme === 'dark'
    ? 'bg-gray-900 border-white/10 text-white'
    : 'bg-white border-gray-200 text-gray-900';
  const shellTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardClass = theme === 'dark'
    ? 'bg-gray-900/70 border border-white/10 backdrop-blur-xl'
    : 'bg-white/90 border border-gray-200 shadow-sm';
  const inputClass = theme === 'dark'
    ? 'w-full bg-black/30 p-3 rounded border border-white/10 text-white'
    : 'w-full bg-gray-50 p-3 rounded border border-gray-300 text-gray-900';

  if (!user?.isAdmin) {
    return <div className="p-8 text-red-500 text-center">Accès interdit</div>;
  }

  return (
    <div className={`w-full px-4 py-6 sm:px-6 sm:py-8 ${shellTextClass}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-yellow-500">Gestion des Utilisateurs</h1>
            <p className={`text-xs mt-1 ${mutedTextClass}`}>{users.length} utilisateur(s) inscrit(s) dont {verifiedUsersCount} vérifié(s)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-amber-500/10 flex items-center gap-2"
            >
              📧 Message collectif
            </button>
            <Link
              to="/dashboard"
              className={`text-sm transition ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              ← Retour
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {users.map(u => (
            <div
              key={u._id}
              className={`rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${cardClass}`}
            >
              <div>
                <p className="font-bold">
                  {u.name}{' '}
                  <span className={`text-xs ml-2 ${mutedTextClass}`}>{u.email}</span>
                </p>
                <p className={`text-xs mt-1 ${mutedTextClass}`}>
                  Espace : {((u.quotaUsed || 0) / 1024 / 1024).toFixed(2)} Mo / {((u.quotaLimit || 0) / 1024 / 1024).toFixed(0)} Mo
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openEmailModal(u)} className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs font-bold transition">Modifier Email</button>
                <button onClick={() => openQuotaModal(u)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-bold transition">Modifier Quota</button>
                <button onClick={() => handleResetPassword(u)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-bold transition">Reset MDP</button>
                <button onClick={() => handleViewAlbums(u._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold transition">Voir albums</button>
                <button onClick={() => handleDeleteUser(u._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition">Supprimer</button>
              </div>
            </div>
          ))}
        </div>

        {(loadingAlbums || selectedUserAlbums) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { setSelectedUserAlbums(null); setViewingAlbum(null); }}>
            <div className={`rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto border ${modalPanelClass}`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {viewingAlbum ? `Album : ${viewingAlbum.title}` : "Albums de l'utilisateur"}
                </h3>
                <button onClick={() => { setSelectedUserAlbums(null); setViewingAlbum(null); }} className={theme === 'dark' ? 'text-gray-400 hover:text-white text-2xl' : 'text-gray-500 hover:text-gray-900 text-2xl'}>&times;</button>
              </div>

              {loadingAlbums ? <p>Chargement...</p> : (
                <>
                  {viewingAlbum ? (
                    <div>
                      <button onClick={() => setViewingAlbum(null)} className="mb-4 text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">← Retour aux albums</button>
                      {loadingPhotos ? <p>Chargement des photos...</p> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {albumPhotos.length === 0 && <p className="col-span-full text-gray-500 text-center py-8">Aucune photo.</p>}
                          {albumPhotos.map(p => (
                            <div key={p._id} className="aspect-square bg-black/20 rounded overflow-hidden group relative">
                              <img src={`/uploads/${p.filename}`} className="w-full h-full object-cover" alt="Photo" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
                                <span className="text-[9px] text-white truncate w-full text-center">{p.title || 'Sans titre'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedUserAlbums && selectedUserAlbums.length === 0 && <p className="col-span-3 text-gray-500 text-center py-8">Aucun album.</p>}
                      {selectedUserAlbums?.map(album => (
                        <div key={album._id} className={`rounded-lg overflow-hidden border transition cursor-pointer ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400'}`} onClick={() => handleViewAlbumPhotos(album)}>
                          <div className="aspect-square bg-black/10">
                            {album.coverImage ? <img src={`/uploads/${album.coverImage}`} className="w-full h-full object-cover" alt="cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>}
                          </div>
                          <div className="p-2 text-xs">
                            <p className="font-bold truncate">{album.title}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className={`text-[10px] px-1 rounded ${album.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{album.isPublic ? 'Public' : 'Privé'}</span>
                              <span className="text-blue-500 hover:underline text-[10px]">Voir photos →</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {editingQuotaUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className={`rounded-xl p-6 max-w-sm w-full border ${theme === 'dark' ? 'bg-gray-900 border-yellow-500/30 text-white' : 'bg-white border-yellow-200 text-gray-900'}`}>
              <h3 className="text-xl font-bold text-yellow-500 mb-4">Modifier le Quota</h3>
              <p className={`text-sm mb-4 ${mutedTextClass}`}>
                Utilisateur : <span className={theme === 'dark' ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{editingQuotaUser.name}</span>
              </p>
              <div className="mb-4">
                <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nouveau quota (en Mo)</label>
                <input type="number" value={newQuota} onChange={(e) => setNewQuota(e.target.value)} className={inputClass} placeholder="Ex: 500" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingQuotaUser(null)} className={theme === 'dark' ? 'px-4 py-2 text-sm text-gray-400 hover:text-white' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-900'}>Annuler</button>
                <button onClick={handleSaveQuota} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-bold transition">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {editingEmailUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className={`rounded-xl p-6 max-w-sm w-full border ${theme === 'dark' ? 'bg-gray-900 border-teal-500/30 text-white' : 'bg-white border-teal-200 text-gray-900'}`}>
              <h3 className="text-xl font-bold text-teal-500 mb-4">Modifier l'Email</h3>
              <p className={`text-sm mb-4 ${mutedTextClass}`}>
                Utilisateur : <span className={theme === 'dark' ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{editingEmailUser.name}</span>
              </p>
              <div className="mb-4">
                <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nouvel email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} placeholder="email@exemple.com" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingEmailUser(null)} className={theme === 'dark' ? 'px-4 py-2 text-sm text-gray-400 hover:text-white' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-900'}>Annuler</button>
                <button onClick={handleSaveEmail} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-bold transition">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {broadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col border shadow-2xl ${theme === 'dark' ? 'bg-gray-900 border-amber-500/30 text-white' : 'bg-white border-amber-200 text-gray-900'}`}>
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-700/40">
                <div>
                  <h3 className="text-xl font-bold text-amber-500 flex items-center gap-2">
                    📧 Message Général aux Utilisateurs
                  </h3>
                  <p className={`text-xs mt-0.5 ${mutedTextClass}`}>
                    Destinataires : <span className="font-bold text-amber-400">{verifiedUsersCount} utilisateur(s) vérifié(s)</span> (les comptes non vérifiés sont automatiquement exclus)
                  </p>
                </div>
                <button onClick={() => setBroadcastModalOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-700/40">
                <button
                  type="button"
                  onClick={() => setBroadcastTab('edit')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition ${broadcastTab === 'edit' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  ✏️ Rédiger (Markdown)
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastTab('preview')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition ${broadcastTab === 'preview' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  👁️ Aperçu de l'Email
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {broadcastTab === 'edit' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-amber-400">Objet de l'email *</label>
                      <input
                        type="text"
                        value={broadcastSubject}
                        onChange={(e) => setBroadcastSubject(e.target.value)}
                        className={inputClass}
                        placeholder="Ex: Information importante - Nouvelle mise à jour LuminaView"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">Corps du message (Markdown) *</label>
                        <span className="text-[11px] text-gray-400">Supporte **gras**, *italique*, [liens](url), # titres</span>
                      </div>
                      <textarea
                        rows={8}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className={`${inputClass} font-mono text-sm leading-relaxed`}
                        placeholder={`Bonjour à tous,

Nous avons le plaisir de vous annoncer les nouvelles fonctionnalités de **LuminaView** :
- Optimisations de vitesse
- Support du format WebP

A bientôt,
L'équipe LuminaView`}
                      />
                    </div>
                  </>
                ) : (
                  /* Email Live Preview Container */
                  <div className="bg-slate-100 text-slate-900 rounded-lg p-4 border border-slate-300">
                    <div className="text-xs text-slate-500 mb-3 border-b border-slate-300 pb-2">
                      <p><strong>De :</strong> LuminaView Administration &lt;noreply@luminaview.fr&gt;</p>
                      <p><strong>À :</strong> {verifiedUsersCount} utilisateur(s) vérifié(s)</p>
                      <p><strong>Objet :</strong> <span className="text-slate-900 font-bold">{broadcastSubject || '(Aucun objet renseigné)'}</span></p>
                    </div>
                    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-900 p-4 text-center">
                        <h1 className="text-amber-500 font-bold text-lg m-0">LuminaView Studio</h1>
                        <p className="text-slate-400 text-xs m-0">Message officiel de l'administration</p>
                      </div>
                      <div className="p-6">
                        <p className="text-sm font-bold text-slate-900 mb-3">Bonjour [Nom Utilisateur],</p>
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(broadcastMessage) }} />
                      </div>
                      <div className="bg-slate-50 p-3 border-t border-slate-200 text-center">
                        <p className="text-xs text-slate-500 m-0">Ce message vous a été envoyé par l'administrateur de LuminaView.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end border-t pt-4 border-gray-700/40">
                <button
                  onClick={() => setBroadcastModalOpen(false)}
                  className={theme === 'dark' ? 'px-4 py-2 text-sm text-gray-400 hover:text-white' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-900'}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendBroadcast}
                  disabled={sendingBroadcast || !broadcastSubject.trim() || !broadcastMessage.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {sendingBroadcast ? 'Envoi en cours...' : `🚀 Envoyer (${verifiedUsersCount} destinataires)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
