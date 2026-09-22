import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useToast } from '../context/ToastContext';

const EditProfile: React.FC = () => {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bio, setBio] = useState('');
  const [portfolioIntro, setPortfolioIntro] = useState('');
  const [carnetIntro, setCarnetIntro] = useState('');
  const [servicesDescription, setServicesDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [blogTheme, setBlogTheme] = useState('classic');
  const [chambreNoireUrl, setChambreNoireUrl] = useState('');
  const [presentationVideo, setPresentationVideo] = useState('');
  const [hasBlog, setHasBlog] = useState(false);
  const [hasCarnet, setHasCarnet] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [currentBanner, setCurrentBanner] = useState<string>('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [servicesTab, setServicesTab] = useState<'edit' | 'preview'>('edit');
  const [bioTab, setBioTab] = useState<'edit' | 'preview'>('edit');
  const [portfolioIntroTab, setPortfolioIntroTab] = useState<'edit' | 'preview'>('edit');
  const [carnetIntroTab, setCarnetIntroTab] = useState<'edit' | 'preview'>('edit');

  const insertSnippet = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    before: string,
    after: string = ''
  ) => {
    setter(prev => (prev ? `${prev}\n${before}${after}` : `${before}${after}`));
  };

  const { theme } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/users/me');
      setIsAdmin(!!profileRes.data.isAdmin);
      setBio(profileRes.data.bio || '');
      setPortfolioIntro(profileRes.data.portfolioIntro || '');
      setCarnetIntro(profileRes.data.carnetIntro || '');
      setServicesDescription(profileRes.data.servicesDescription || '');
      setTagline(profileRes.data.tagline || '');
      setBlogTheme(profileRes.data.blogTheme || 'classic');
      setChambreNoireUrl(profileRes.data.chambreNoireUrl || '');
      setPresentationVideo(profileRes.data.presentationVideo || '');
      setHasBlog(!!profileRes.data.hasBlog);
      setHasCarnet(!!profileRes.data.hasCarnet);
      setCurrentAvatar(profileRes.data.avatar || '');
      setCurrentBanner(profileRes.data.bannerImage || '');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement du profil', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('portfolioIntro', portfolioIntro);
      formData.append('carnetIntro', carnetIntro);
      formData.append('servicesDescription', servicesDescription);
      formData.append('tagline', tagline);
      formData.append('blogTheme', blogTheme);
      formData.append('chambreNoireUrl', chambreNoireUrl);
      if (isAdmin) {
        formData.append('presentationVideo', presentationVideo);
      }
      formData.append('hasBlog', String(hasBlog));
      formData.append('hasCarnet', String(hasCarnet));
      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile);

      const res = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Profil mis à jour avec succès !', 'success');
      if (res.data) {
        updateUser(res.data);
      }
      setBannerFile(null);
      setAvatarFile(null);
      fetchData();
    } catch (error) {
      showToast('Erreur lors de la sauvegarde du profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showToast('Les nouveaux mots de passe ne correspondent pas', 'warning');
    }
    if (!currentPassword || !newPassword) {
      return showToast('Veuillez remplir tous les champs du mot de passe', 'warning');
    }
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      showToast('Mot de passe mis à jour avec succès !', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe', 'error');
    }
  };

  const shellTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subtleTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const panelClass = theme === 'dark'
    ? 'bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl'
    : 'bg-white border border-gray-100 shadow-xl shadow-gray-100/30';
  const sectionBorderClass = theme === 'dark' ? 'border-white/5' : 'border-gray-100';
  const inputClass = theme === 'dark'
    ? 'w-full bg-black/40 border border-white/10 p-3.5 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 outline-none transition duration-200'
    : 'w-full bg-gray-50/50 border border-gray-200 p-3.5 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 outline-none transition duration-200';
  const labelClass = `block text-sm font-bold tracking-wide uppercase mb-2 ${mutedTextClass}`;
  const previewBoxClass = theme === 'dark'
    ? 'rounded-xl border border-white/10 bg-black/30 p-4 overflow-auto'
    : 'rounded-xl border border-gray-200 bg-gray-50 p-4 overflow-auto';
  const previewProseClass = theme === 'dark'
    ? 'prose prose-invert max-w-none text-gray-200 text-sm'
    : 'prose max-w-none text-gray-800 text-sm';
  const tabToggleContainerClass = `flex items-center p-0.5 rounded-lg border text-[11px] ${
    theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-gray-100 border-gray-200'
  }`;
  const tabInactiveBtnClass = theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const profileCompletion = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (avatarFile || currentAvatar) score += 20;
    else missing.push('une photo de profil');

    if (bannerFile || currentBanner) score += 20;
    else missing.push('une bannière de couverture');

    if (tagline && tagline.trim().length > 0) score += 15;
    else missing.push('votre phrase choc (slogan)');

    if (bio && bio.trim().length > 0) score += 20;
    else missing.push('votre biographie');

    if (portfolioIntro && portfolioIntro.trim().length > 0) score += 15;
    else missing.push("l'introduction du portfolio");

    if ((carnetIntro && carnetIntro.trim().length > 0) || (servicesDescription && servicesDescription.trim().length > 0) || chambreNoireUrl) {
      score += 10;
    } else {
      missing.push('les services ou carnet');
    }

    return { score, missing };
  }, [avatarFile, currentAvatar, bannerFile, currentBanner, tagline, bio, portfolioIntro, carnetIntro, servicesDescription, chambreNoireUrl]);

  return (
    <div className={`w-full px-4 py-4 sm:px-8 sm:py-6 ${shellTextClass}`}>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-2 sm:top-4 z-40 bg-gray-900/90 dark:bg-gray-950/90 backdrop-blur-xl border border-white/10 dark:border-gray-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-2xl gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard"
              className={`p-2 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 flex-shrink-0 ${
                theme === 'dark'
                  ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Retour au Dashboard"
            >
              <span>←</span>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent truncate">
                Mon Profil
              </h1>
              <p className="text-[11px] text-gray-400 truncate hidden md:block">
                Identité visuelle, présentation et configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-50 text-black font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Jauge de complétion du profil */}
        <div className={`px-4 py-3 rounded-xl ${panelClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition duration-300`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-xs shadow-inner">
              {profileCompletion.score}%
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold flex items-center gap-2">
                <span>Complétion du profil</span>
                {profileCompletion.score === 100 ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 font-medium">
                    Complet
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-medium">
                    En progression
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-sm">
                {profileCompletion.missing.length > 0
                  ? `Conseil : Renseignez ${profileCompletion.missing[0]}.`
                  : 'Félicitations, votre profil est complet !'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 flex-shrink-0 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[9px] text-gray-500 font-medium px-0.5">
              <span>Visibilité</span>
              <span className="text-gray-400">{profileCompletion.score} / 100</span>
            </div>
            <div className="w-full bg-black/40 dark:bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10 mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                style={{ width: `${profileCompletion.score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            {/* COLONNE GAUCHE (40%) : VISUELS & THEMES */}
            <div className="lg:col-span-4 space-y-8">
              {/* CARD 1 : VISUELS */}
              <div className={`p-6 sm:p-8 rounded-2xl space-y-6 ${panelClass}`}>
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-yellow-500">✦</span> Identité Visuelle
                </h3>

                {/* Bannière de Couverture */}
                <div className="space-y-3">
                  <label className={labelClass}>Image de couverture (Bannière du Portfolio)</label>
                  <div className="relative group rounded-xl overflow-hidden h-44 bg-black/40 border border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-yellow-500/40">
                    {(bannerFile || currentBanner) ? (
                      <>
                        <img
                          src={bannerFile ? URL.createObjectURL(bannerFile) : `/uploads/${currentBanner}`}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition duration-300"
                          alt="Bannière"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">Changer l'image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-400 font-medium">Glisser ou cliquer pour ajouter une couverture</p>
                        <p className="text-xs text-gray-600 mt-1">Recommandé : image large (ex. 1920x1080)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setBannerFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Avatar */}
                <div className={`flex flex-col sm:flex-row gap-6 items-center border-t pt-6 ${sectionBorderClass}`}>
                  <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 bg-black/40 flex items-center justify-center cursor-pointer hover:border-yellow-500 transition duration-300">
                    {currentAvatar || avatarFile ? (
                      <>
                        <img
                          src={avatarFile ? URL.createObjectURL(avatarFile) : `/uploads/${currentAvatar}`}
                          className="absolute inset-0 w-full h-full object-cover group-hover:opacity-70 transition duration-300"
                          alt="Avatar"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                          <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">Modifier</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-3xl text-gray-400">?</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-base">Photo de profil</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Cliquez sur le cercle pour importer votre portrait.</p>
                  </div>
                </div>
              </div>

              {/* CARD MODULES & EXTENSIONS (Compacte, avant le Thème Visuel) */}
              <div className={`p-5 sm:p-6 rounded-2xl space-y-3.5 ${panelClass}`}>
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                    <span className="text-yellow-500">⚙️</span> Modules & Extensions
                  </h3>
                  <span className={`text-[11px] ${subtleTextClass}`}>
                    Navigation & outils
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Switch Blog */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${sectionBorderClass} transition duration-200 hover:border-yellow-500/30`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">✍️</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-white truncate">Module Blog</div>
                        <div className={`text-[11px] ${subtleTextClass} truncate`}>Articles & commentaires</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasBlog(!hasBlog)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        hasBlog ? 'bg-amber-500' : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          hasBlog ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Switch Carnet */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${sectionBorderClass} transition duration-200 hover:border-yellow-500/30`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">🎞️</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-white truncate">Chambre Noire</div>
                        <div className={`text-[11px] ${subtleTextClass} truncate`}>Carnet de création & labo</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasCarnet(!hasCarnet)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        hasCarnet ? 'bg-teal-500' : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          hasCarnet ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2 : STYLE & DESIGN (Accordéon) */}
              <div className={`p-5 sm:p-6 rounded-2xl ${panelClass} transition duration-200`}>
                <button
                  type="button"
                  onClick={() => setIsThemeOpen(!isThemeOpen)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-yellow-500 text-base">✦</span>
                    <span className={`font-bold text-sm sm:text-base transition ${theme === 'dark' ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-600'}`}>
                      Thème Visuel
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border transition transform ${theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-500'} ${isThemeOpen ? 'rotate-180 text-yellow-500' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isThemeOpen && (
                  <div className="space-y-6 pt-4 mt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="space-y-4">
                      <label className={labelClass}>Choix de la mise en page globale</label>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setBlogTheme('classic')}
                      className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition duration-300 ${
                        blogTheme === 'classic'
                          ? 'border-yellow-500 bg-yellow-500/[0.04]'
                          : theme === 'dark' ? 'border-white/15 bg-black/20 hover:border-white/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-2">
                        <span className="font-bold text-sm">Hélioscope (Classic)</span>
                        {blogTheme === 'classic' && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">Design clair et ambré, avec menu supérieur fluide. Idéal pour une galerie lumineuse, ouverte et épurée.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBlogTheme('portfolio')}
                      className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition duration-300 ${
                        blogTheme === 'portfolio'
                          ? 'border-yellow-500 bg-yellow-500/[0.04]'
                          : theme === 'dark' ? 'border-white/15 bg-black/20 hover:border-white/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-2">
                        <span className="font-bold text-sm">Artfolio (Éditorial)</span>
                        {blogTheme === 'portfolio' && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">Design sombre et doré, avec menu latéral fixe. Inclut les Séries et Expositions.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBlogTheme('portfolio-galeries')}
                      className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition duration-300 ${
                        blogTheme === 'portfolio-galeries'
                          ? 'border-yellow-500 bg-yellow-500/[0.04]'
                          : theme === 'dark' ? 'border-white/15 bg-black/20 hover:border-white/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Artfolio (Galeries)</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">Classique</span>
                        </div>
                        {blogTheme === 'portfolio-galeries' && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">Même design que Artfolio, mais centré uniquement sur vos Galeries (sans Séries ni Expositions).</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBlogTheme('grimoire')}
                      className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition duration-300 ${
                        blogTheme === 'grimoire'
                          ? 'border-yellow-500 bg-yellow-500/[0.04]'
                          : theme === 'dark' ? 'border-white/15 bg-black/20 hover:border-white/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Grimoire (Felipe Dana)</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">100% Galeries</span>
                        </div>
                        {blogTheme === 'grimoire' && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">Design cinématique immersif plein écran. Survol interactif de vos photographies HD et présentation épurée de vos galeries virtuelles sans passer par les pages.</p>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div>
                    <label className={labelClass}>Lien Chambre Noire</label>
                    <p className="text-xs text-gray-500 mb-2">Saisissez l'URL de votre Chambre Noire (carnet de route) pour l'intégrer au menu du blog.</p>
                    <input
                      type="url"
                      placeholder="https://chambrenoire.fr/mon-carnet"
                      value={chambreNoireUrl}
                      onChange={(e) => setChambreNoireUrl(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                  </div>
                )}
              </div>

              {/* CARD 6 : SÉCURITÉ (Accordéon rétractable) */}
              <div className={`p-5 sm:p-6 rounded-2xl ${panelClass} transition duration-200`}>
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-yellow-500 text-base">🔒</span>
                    <span className="font-bold text-sm sm:text-base text-white group-hover:text-yellow-400 transition">
                      Modifier mon mot de passe
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-400 transition transform ${isPasswordOpen ? 'rotate-180 text-yellow-400' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {isPasswordOpen && (
                  <div className="space-y-4 pt-4 mt-4 border-t border-white/10">
                    <div>
                      <label className={labelClass}>Mot de passe actuel</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Votre mot de passe actuel"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Nouveau mot de passe (min 6 caractères)"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Confirmez le nouveau mot de passe"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handlePasswordSubmit}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-sm shadow hover:shadow-lg transition duration-200 active:scale-95"
                    >
                      Enregistrer le nouveau mot de passe
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COLONNE DROITE (60%) : FORMULAIRES TEXTES HAUTS */}
            <div className="lg:col-span-6 space-y-8">
              {/* CARD 3 : IDENTITÉ & TEXTES */}
              <div className={`p-6 sm:p-8 rounded-2xl space-y-6 ${panelClass}`}>
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-yellow-500">✦</span> Informations & Textes de présentation
                </h3>

                <div>
                  <label className={labelClass}>Phrase choc (Slogan)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className={inputClass}
                    placeholder="Ex. Capturer l'essence de l'instant..."
                  />
                </div>

                {isAdmin && (
                  <div>
                    <label className={labelClass}>🎬 Vidéo de présentation (Administrateur uniquement)</label>
                    <input
                      type="text"
                      value={presentationVideo}
                      onChange={e => setPresentationVideo(e.target.value)}
                      className={inputClass}
                      placeholder="Ex. presentation.mp4 (Laissez vide pour masquer le bouton vidéo)"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Saisissez le nom du fichier vidéo situé dans /uploads (ex. presentation.mp4). Champ réservé à l'administrateur du système.
                    </p>
                  </div>
                )}

                {/* Biographie */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass} style={{ marginBottom: 0 }}>Biographie (À propos)</label>
                    <div className={tabToggleContainerClass}>
                      <button
                        type="button"
                        onClick={() => setBioTab('edit')}
                        className={`px-2.5 py-0.5 rounded font-medium transition ${
                          bioTab === 'edit'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : tabInactiveBtnClass
                        }`}
                      >
                        Édition
                      </button>
                      <button
                        type="button"
                        onClick={() => setBioTab('preview')}
                        className={`px-2.5 py-0.5 rounded font-medium transition ${
                          bioTab === 'preview'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : tabInactiveBtnClass
                        }`}
                      >
                        Aperçu
                      </button>
                    </div>
                  </div>
                  {bioTab === 'edit' ? (
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={8}
                      className={inputClass}
                      placeholder="Racontez votre parcours, votre passion... Markdown & HTML supportés."
                    />
                  ) : (
                    <div className={`${previewBoxClass} min-h-[160px]`}>
                      {bio ? (
                        <div className={previewProseClass}>
                          <MarkdownRenderer>{bio}</MarkdownRenderer>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-xs">Aucune biographie rédigée.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Introduction Portfolio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass} style={{ marginBottom: 0 }}>Introduction du Portfolio</label>
                    <div className={tabToggleContainerClass}>
                      <button
                        type="button"
                        onClick={() => setPortfolioIntroTab('edit')}
                        className={`px-2.5 py-0.5 rounded font-medium transition ${
                          portfolioIntroTab === 'edit'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : tabInactiveBtnClass
                        }`}
                      >
                        Édition
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortfolioIntroTab('preview')}
                        className={`px-2.5 py-0.5 rounded font-medium transition ${
                          portfolioIntroTab === 'preview'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : tabInactiveBtnClass
                        }`}
                      >
                        Aperçu
                      </button>
                    </div>
                  </div>
                  {portfolioIntroTab === 'edit' ? (
                    <textarea
                      value={portfolioIntro}
                      onChange={e => setPortfolioIntro(e.target.value)}
                      rows={4}
                      className={inputClass}
                      placeholder="Un court message de bienvenue en haut de la page principale... Markdown & HTML supportés."
                    />
                  ) : (
                    <div className={`${previewBoxClass} min-h-[100px]`}>
                      {portfolioIntro ? (
                        <div className={previewProseClass}>
                          <MarkdownRenderer>{portfolioIntro}</MarkdownRenderer>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-xs">Aucune introduction renseignée.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Introduction Carnet de Routes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass} style={{ marginBottom: 0 }}>Introduction du Carnet de Routes</label>
                    <div className={tabToggleContainerClass}>
                      <button
                        type="button"
                        onClick={() => setCarnetIntroTab('edit')}
                        className={`px-2.5 py-0.5 rounded font-medium transition ${
                          carnetIntroTab === 'edit'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : tabInactiveBtnClass
                        }`}
                      >
                        Édition
                      </button>
                      <button
                        type="button"
                        onClick={() => setCarnetIntroTab('preview')}
                        className={`px-2.5 py-0.5 rounded font-medium transition ${
                          carnetIntroTab === 'preview'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : tabInactiveBtnClass
                        }`}
                      >
                        Aperçu
                      </button>
                    </div>
                  </div>
                  {carnetIntroTab === 'edit' ? (
                    <textarea
                      value={carnetIntro}
                      onChange={e => setCarnetIntro(e.target.value)}
                      rows={4}
                      className={inputClass}
                      placeholder="Saisissez un message d'introduction pour les visiteurs de votre carnet de routes... Markdown & HTML supportés."
                    />
                  ) : (
                    <div className={`${previewBoxClass} min-h-[100px]`}>
                      {carnetIntro ? (
                        <div className={previewProseClass}>
                          <MarkdownRenderer>{carnetIntro}</MarkdownRenderer>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-xs">Aucune introduction renseignée.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 4 : OFFRES & PRESTATIONS / PROJETS & SERVICES (Accordéon) */}
              <div className={`p-5 sm:p-6 rounded-2xl ${panelClass} transition duration-200`}>
                <button
                  type="button"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-yellow-500 text-base">✦</span>
                    <span className={`font-bold text-sm sm:text-base transition ${theme === 'dark' ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-600'}`}>
                      Projets & Services
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border transition transform ${theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-500'} ${isServicesOpen ? 'rotate-180 text-yellow-500' : ''}`}>
                    ▼
                  </span>
                </button>

                {isServicesOpen && (
                  <>
                  <div className="space-y-6 pt-4 mt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setServicesTab('edit')}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        servicesTab === 'edit'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : tabInactiveBtnClass
                      }`}
                    >
                      ✏️ Édition
                    </button>
                    <button
                      type="button"
                      onClick={() => setServicesTab('preview')}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        servicesTab === 'preview'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : tabInactiveBtnClass
                      }`}
                    >
                      👁️ Aperçu rendu
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className={labelClass} style={{ marginBottom: 0 }}>
                      Description des Prestations & Projets
                    </label>
                    <span className="text-[11px] text-yellow-500/90 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                      Markdown complet + HTML + Images
                    </span>
                  </div>

                  {servicesTab === 'edit' ? (
                    <div className="space-y-3">
                      {/* Barre d'outils rapide */}
                      <div className={`flex flex-wrap gap-1.5 p-2 rounded-lg border text-xs ${
                        theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-gray-100 border-gray-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '**', '**')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                          title="Gras"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '*', '*')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 italic"
                          title="Italique"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '### Titre')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title="Titre H3"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '- ')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title="Liste à puces"
                        >
                          • Liste
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '[Texte du lien](https://example.com)')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title="Lien"
                        >
                          🔗 Lien
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '![Description](https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80)')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-yellow-400/90 font-medium"
                          title="Image Markdown"
                        >
                          🖼️ Image (MD)
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '<img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80" alt="Description" style="max-width:100%; border-radius:12px; margin: 12px 0;" />')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-yellow-400/90 font-medium"
                          title="Image HTML"
                        >
                          💻 Image (HTML)
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '| Service | Tarif | Détails |\n|---|---|---|\n| Séance Portrait | 150 € | 1h de shooting + 10 photos retouchées |')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300"
                          title="Tableau Markdown"
                        >
                          📊 Tableau
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet(setServicesDescription, '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 12px 0;">\n  <h4 style="color: #facc15; margin: 0 0 8px 0;">Offre Spéciale</h4>\n  <p style="margin: 0; color: #d1d5db;">Votre texte ici...</p>\n</div>')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-400/90 font-mono text-[11px]"
                          title="Bloc HTML personnalisé"
                        >
                          &lt;div&gt;
                        </button>
                      </div>

                      <textarea
                        value={servicesDescription}
                        onChange={e => setServicesDescription(e.target.value)}
                        rows={12}
                        className={inputClass}
                        placeholder="Décrivez vos offres, tarifs, séances, projets... Le Markdown standard, les balises HTML (<p>, <div>, <img>, etc.) et les images sont intégralement supportés."
                      />
                      <p className="text-[11px] text-gray-400">
                        💡 Astuce : Vous pouvez insérer des images via Markdown <code>![titre](url)</code> ou via HTML <code>&lt;img src="url" style="width:100%" /&gt;</code>, ainsi que des tableaux, listes et blocs HTML stylisés.
                      </p>
                    </div>
                  ) : (
                    <div className={`${previewBoxClass} min-h-[280px]`}>
                      {servicesDescription ? (
                        <div className={previewProseClass}>
                          <MarkdownRenderer>{servicesDescription}</MarkdownRenderer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <p className="text-sm italic mb-2">Aucun contenu renseigné pour le moment.</p>
                          <button
                            type="button"
                            onClick={() => setServicesTab('edit')}
                            className="text-xs text-yellow-400 hover:underline"
                          >
                            Cliquez ici pour rédiger votre contenu
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-4 rounded-xl text-lg shadow-lg hover:scale-[1.01] hover:shadow-yellow-500/10 active:scale-[0.99] transition duration-200"
          >
            Enregistrer les modifications du Profil
          </button>
          <p className={`text-center text-xs mt-3 ${subtleTextClass}`}>
            Vos modifications sont publiées instantanément sur vos pages publiques.
          </p>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
