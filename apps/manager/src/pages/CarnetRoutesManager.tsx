import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EditPhotoModal from '../components/EditPhotoModal';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { parseDevTime } from '@luminaview/utils';

type TabType = 'ideas' | 'projects' | 'photos' | 'gear' | 'films';

const CarnetRoutesManager: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('ideas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Listes ---
  const [projects, setProjects] = useState<any[]>([]);
  const [gear, setGear] = useState<any[]>([]);
  const [films, setFilms] = useState<any[]>([]);
  const [myPhotos, setMyPhotos] = useState<any[]>([]); // Toutes les photos de l'utilisateur pour association
  const [userAlbums, setUserAlbums] = useState<any[]>([]);

  // --- Modals et Formulaires ---
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddGear, setShowAddGear] = useState(false);
  const [showAddFilm, setShowAddFilm] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingIdea, setEditingIdea] = useState<any>(null);
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [selectedFilmRoll, setSelectedFilmRoll] = useState<any | null>(null); // Pour afficher la planche-contact
  const [showPhotoPickerForSlot, setShowPhotoPickerForSlot] = useState<number | null>(null); // Slot en attente d'association
  const [shareItem, setShareItem] = useState<{ type: 'project' | 'photo'; title: string; url: string; embedUrl?: string; htmlCode: string } | null>(null);
  const [pickerTab, setPickerTab] = useState<'gallery' | 'upload'>('gallery');
  const [selectedUploadAlbumId, setSelectedUploadAlbumId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Modal Concrétiser une idée & Visualiser une idée grand format
  const [showConcretizeModal, setShowConcretizeModal] = useState(false);
  const [concretizeIdeaItem, setConcretizeIdeaItem] = useState<any | null>(null);
  const [viewingIdea, setViewingIdea] = useState<any | null>(null);
  const [concretizeMedium, setConcretizeMedium] = useState<'DIGITAL' | 'ANALOG' | 'HYBRID'>('DIGITAL');
  const [concretizeStatus, setConcretizeStatus] = useState<'PREPARATION' | 'IN_PROGRESS'>('IN_PROGRESS');
  const [concretizeTargetDate, setConcretizeTargetDate] = useState('');

  // --- Form States ---
  // Boîte à Idées
  const [ideaName, setIdeaName] = useState('');
  const [ideaNotesMarkdown, setIdeaNotesMarkdown] = useState('');
  const [ideaTags, setIdeaTags] = useState('');
  const [ideaTargetDate, setIdeaTargetDate] = useState('');
  const [ideaCover, setIdeaCover] = useState('');
  const [ideaPreviewMarkdown, setIdeaPreviewMarkdown] = useState(false);
  const [ideaUploadingImage, setIdeaUploadingImage] = useState(false);
  const [searchIdeaQuery, setSearchIdeaQuery] = useState('');
  const [filterIdeaTag, setFilterIdeaTag] = useState('');

  // Projet Multi-Médiums
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStatus, setProjectStatus] = useState<'PREPARATION' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'>('IN_PROGRESS');
  const [projectMedium, setProjectMedium] = useState<'DIGITAL' | 'ANALOG' | 'HYBRID'>('ANALOG');
  const [projectTags, setProjectTags] = useState('');
  const [projectTargetDate, setProjectTargetDate] = useState('');
  const [projectPublished, setProjectPublished] = useState(false);
  const [projectCover, setProjectCover] = useState('');
  const [projectMakingOf, setProjectMakingOf] = useState('');
  const [projectMakingOfPreview, setProjectMakingOfPreview] = useState(false);
  const [projectMakingOfUploading, setProjectMakingOfUploading] = useState(false);
  const [searchProjectQuery, setSearchProjectQuery] = useState('');
  const [filterProjectStatus, setFilterProjectStatus] = useState<string>('ALL');
  const [filterProjectMedium, setFilterProjectMedium] = useState<string>('ALL');

  // Matériel
  const [gearType, setGearType] = useState<'camera' | 'lens' | 'eclairage'>('camera');
  const [gearSubType, setGearSubType] = useState<'continuous' | 'flash'>('continuous');
  const [gearBrand, setGearBrand] = useState('');
  const [gearModel, setGearModel] = useState('');
  const [gearFormat, setGearFormat] = useState('35mm');
  const [gearMaxPowerWatts, setGearMaxPowerWatts] = useState<string>('');
  const [gearSerial, setGearSerial] = useState('');
  const [gearNotes, setGearNotes] = useState('');

  // Pellicule
  const [filmName, setFilmName] = useState('');
  const [filmBrand, setFilmBrand] = useState('');
  const [filmType, setFilmType] = useState('');
  const [filmIso, setFilmIso] = useState<number>(400);
  const [filmFormat, setFilmFormat] = useState<string>('135');
  const [filmMaxViews, setFilmMaxViews] = useState<number>(36);
  const [filmTypeColor, setFilmTypeColor] = useState<'BW' | 'color' | 'slide'>('BW');
  const [filmGearCameraId, setFilmGearCameraId] = useState('');
  const [filmGearLensId, setFilmGearLensId] = useState('');
  const [filmDefaultSpeed, setFilmDefaultSpeed] = useState('');
  const [filmDefaultAperture, setFilmDefaultAperture] = useState('');
  const [filmDefaultFilter, setFilmDefaultFilter] = useState('Aucun');
  const [filmDefaultNdFilter, setFilmDefaultNdFilter] = useState('Aucun');
  const [filmDefaultLensHood, setFilmDefaultLensHood] = useState(false);
  const [filmNotes, setFilmNotes] = useState('');

  // Rechercher/Filtrer dans le picker de photo
  const [pickerSearch, setPickerSearch] = useState('');
  const [searchPhotoQuery, setSearchPhotoQuery] = useState('');
  const [searchFilmQuery, setSearchFilmQuery] = useState('');
  const [filterByCameraTag, setFilterByCameraTag] = useState(false);

  // Pellicule - Développement
  const [devDeveloper, setDevDeveloper] = useState('');
  const [devDilution, setDevDilution] = useState('');
  const [devTimeMin, setDevTimeMin] = useState(0);
  const [devTimeSec, setDevTimeSec] = useState(0);
  const [devTemperature, setDevTemperature] = useState('');
  const [devAgitation, setDevAgitation] = useState('');
  const [devPushPull, setDevPushPull] = useState('');
  const [filmIsoUsed, setFilmIsoUsed] = useState('');
  const [devFixerBrand, setDevFixerBrand] = useState('');
  const [devFixerDilution, setDevFixerDilution] = useState('1+4');
  const [devFixerTime, setDevFixerTime] = useState('5mn');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, gearRes, filmRes, photosRes, albumsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/gears'),
        api.get('/films'),
        api.get('/photos/my/photos?appContext=CHAMBRE_NOIRE'),
        api.get('/albums/my/albums?appContext=CHAMBRE_NOIRE')
      ]);
      setProjects(projRes.data);
      setGear(gearRes.data);
      setFilms(filmRes.data);
      setMyPhotos(photosRes.data);
      setUserAlbums(albumsRes.data);
      if (albumsRes.data.length > 0 && !selectedUploadAlbumId) {
        setSelectedUploadAlbumId(albumsRes.data[0]._id);
      }

      // Si on visualise une planche-contact, rafraîchir son objet
      if (selectedFilmRoll) {
        const updatedRoll = filmRes.data.find((f: any) => f._id === selectedFilmRoll._id);
        setSelectedFilmRoll(updatedRoll || null);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données du carnet de route.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ajustement auto du maxViews en fonction du format
  useEffect(() => {
    if (filmFormat === 'plan-film') {
      setFilmMaxViews(1);
    } else if (filmFormat === '120') {
      setFilmMaxViews(12);
    } else if (filmFormat === '135') {
      setFilmMaxViews(36);
    }
  }, [filmFormat]);

  // --- Actions CRUD Boîte à Idées ---
  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaName) return alert('Le nom de l\'idée est requis');

    try {
      const payload = {
        name: ideaName,
        status: 'IDEA',
        medium: 'UNDECIDED',
        tags: ideaTags ? ideaTags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        notesMarkdown: ideaNotesMarkdown,
        targetDate: ideaTargetDate ? ideaTargetDate : undefined,
        coverImage: ideaCover,
        isPublished: false
      };

      if (editingIdea) {
        await api.put(`/projects/${editingIdea._id}`, payload);
      } else {
        await api.post('/projects', payload);
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde de l\'idée');
    }
  };

  const handleEditIdea = (idea: any) => {
    setEditingIdea(idea);
    setIdeaName(idea.name || '');
    setIdeaNotesMarkdown(idea.notesMarkdown || idea.description || '');
    setIdeaTags(Array.isArray(idea.tags) ? idea.tags.join(', ') : '');
    setIdeaTargetDate(idea.targetDate ? idea.targetDate.split('T')[0] : '');
    setIdeaCover(idea.coverImage || '');
    setShowAddIdea(true);
  };

  const handleDeleteIdea = async (id: string) => {
    if (!window.confirm('Supprimer cette idée de votre boîte à idées ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression de l\'idée');
    }
  };

  const handleOpenConcretizeModal = (idea: any) => {
    setConcretizeIdeaItem(idea);
    setConcretizeMedium('DIGITAL');
    setConcretizeStatus('IN_PROGRESS');
    setConcretizeTargetDate(idea.targetDate ? idea.targetDate.split('T')[0] : '');
    setShowConcretizeModal(true);
  };

  const handleExecuteConcretize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concretizeIdeaItem) return;

    try {
      await api.post(`/projects/${concretizeIdeaItem._id}/concretize`, {
        medium: concretizeMedium,
        status: concretizeStatus,
        targetDate: concretizeTargetDate || undefined
      });

      setShowConcretizeModal(false);
      setConcretizeIdeaItem(null);
      setActiveTab('projects');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la concrétisation du projet');
    }
  };

  // --- Actions CRUD Projets ---
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return alert('Le nom du projet est requis');

    try {
      const payload = {
        name: projectName,
        description: projectDesc,
        status: projectStatus,
        medium: projectMedium,
        tags: projectTags ? projectTags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        targetDate: projectTargetDate ? projectTargetDate : undefined,
        isPublished: projectPublished,
        coverImage: projectCover,
        makingOf: projectMakingOf
      };

      if (editingItem) {
        await api.put(`/projects/${editingItem._id}`, payload);
      } else {
        await api.post('/projects', payload);
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde du projet');
    }
  };

  const handleEditProject = (project: any) => {
    setEditingItem(project);
    setProjectName(project.name);
    setProjectDesc(project.description || '');
    setProjectStatus(project.status || 'IN_PROGRESS');
    setProjectMedium(project.medium || 'ANALOG');
    setProjectTags(Array.isArray(project.tags) ? project.tags.join(', ') : '');
    setProjectTargetDate(project.targetDate ? project.targetDate.split('T')[0] : '');
    setProjectPublished(project.isPublished || false);
    setProjectCover(project.coverImage || '');
    setProjectMakingOf(project.makingOf || '');
    setShowAddProject(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Supprimer ce projet ? Les photos associées ne seront pas supprimées mais seront détachées du projet.')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  // --- Actions CRUD Matériel ---
  const handleSaveGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gearBrand || !gearModel) return alert('Veuillez remplir la marque et le modèle/nom');
    if (gearType !== 'eclairage' && !gearFormat) return alert('Veuillez indiquer le format');
    if (gearType === 'eclairage' && !gearSubType) return alert("Veuillez sélectionner le type d'éclairage (Lumière continue ou Flash)");

    try {
      const payload: any = {
        type: gearType,
        brand: gearBrand,
        model: gearModel,
        format: gearType === 'eclairage' ? 'N/A' : gearFormat,
        serialNumber: gearSerial,
        notes: gearNotes
      };

      if (gearType === 'eclairage') {
        payload.subType = gearSubType;
        payload.maxPowerWatts = gearMaxPowerWatts ? Number(gearMaxPowerWatts) : undefined;
      }

      if (editingItem) {
        await api.put(`/gears/${editingItem._id}`, payload);
      } else {
        await api.post('/gears', payload);
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde du matériel');
    }
  };

  const handleEditGear = (g: any) => {
    setEditingItem(g);
    setGearType(g.type || 'camera');
    setGearSubType(g.subType || 'continuous');
    setGearBrand(g.brand || '');
    setGearModel(g.model || '');
    setGearFormat(g.format || '35mm');
    setGearMaxPowerWatts(g.maxPowerWatts !== undefined && g.maxPowerWatts !== null ? String(g.maxPowerWatts) : '');
    setGearSerial(g.serialNumber || '');
    setGearNotes(g.notes || '');
    setShowAddGear(true);
  };

  const handleDeleteGear = async (id: string) => {
    if (!window.confirm('Supprimer ce matériel de votre inventaire ?')) return;
    try {
      await api.delete(`/gears/${id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  // --- Actions CRUD Pellicules ---
  const handleSaveFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmName || !filmBrand || !filmType || !filmIso) {
      return alert('Veuillez remplir les champs obligatoires');
    }

    try {
      const payload = {
        name: filmName,
        brand: filmBrand,
        filmType: filmType,
        iso: Number(filmIso),
        isoUsed: filmIsoUsed ? Number(filmIsoUsed) : null,
        format: filmFormat,
        maxViews: Number(filmMaxViews),
        type: filmTypeColor,
        gearCameraId: filmGearCameraId || null,
        gearLensId: filmGearLensId || null,
        defaultExposureSettings: {
          aperture: filmDefaultAperture || '',
          shutterSpeed: filmDefaultSpeed || '',
          filter: filmDefaultFilter || 'Aucun',
          ndFilter: filmDefaultNdFilter || 'Aucun',
          lensHood: filmDefaultLensHood
        },
        developmentSettings: {
          developer: devDeveloper,
          dilution: devDilution,
          time: devTimeMin || devTimeSec ? `${devTimeMin}mn ${devTimeSec}s` : '',
          temperature: devTemperature,
          agitation: devAgitation,
          pushPull: devPushPull,
          fixerBrand: devFixerBrand,
          fixerDilution: devFixerDilution,
          fixerTime: devFixerTime
        },
        notes: filmNotes
      };

      if (editingItem) {
        await api.put(`/films/${editingItem._id}`, payload);
      } else {
        await api.post('/films', payload);
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde de la pellicule');
    }
  };

  const handleEditFilm = (f: any) => {
    setEditingItem(f);
    setFilmName(f.name);
    setFilmBrand(f.brand);
    setFilmType(f.filmType);
    setFilmIso(f.iso);
    setFilmIsoUsed(f.isoUsed || '');
    setFilmFormat(f.format);
    setFilmMaxViews(f.maxViews);
    setFilmTypeColor(f.type);
    setFilmGearCameraId(f.gearCameraId?._id || f.gearCameraId || '');
    setFilmGearLensId(f.gearLensId?._id || f.gearLensId || '');
    setFilmDefaultAperture(f.defaultExposureSettings?.aperture || '');
    setFilmDefaultSpeed(f.defaultExposureSettings?.shutterSpeed || '');
    setFilmDefaultFilter(f.defaultExposureSettings?.filter || 'Aucun');
    setFilmDefaultNdFilter(f.defaultExposureSettings?.ndFilter || 'Aucun');
    setFilmDefaultLensHood(f.defaultExposureSettings?.lensHood || false);
    setFilmNotes(f.notes || '');

    setDevDeveloper(f.developmentSettings?.developer || '');
    setDevDilution(f.developmentSettings?.dilution || '');
    const parsedTime = parseDevTime(f.developmentSettings?.time || '');
    setDevTimeMin(parsedTime.min);
    setDevTimeSec(parsedTime.sec);
    setDevTemperature(f.developmentSettings?.temperature || '');
    setDevAgitation(f.developmentSettings?.agitation || '');
    setDevPushPull(f.developmentSettings?.pushPull || '');
    setDevFixerBrand(f.developmentSettings?.fixerBrand || '');
    setDevFixerDilution(f.developmentSettings?.fixerDilution || '1+4');
    setDevFixerTime(f.developmentSettings?.fixerTime || '5mn');

    setShowAddFilm(true);
  };

  const handleDeleteFilm = async (id: string) => {
    if (!window.confirm('Supprimer ce rouleau de pellicule ? Les photos liées ne seront pas supprimées mais détachées de ce rouleau.')) return;
    try {
      await api.delete(`/films/${id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicateFilm = async (film: any) => {
    const newName = window.prompt("Nom de la copie de la pellicule / châssis :", `${film.name} (Copie)`);
    if (!newName || !newName.trim()) return;
    try {
      await api.post('/films', {
        name: newName.trim(),
        brand: film.brand,
        filmType: film.filmType,
        iso: film.iso,
        isoUsed: film.isoUsed,
        format: film.format,
        maxViews: film.maxViews,
        type: film.type,
        gearCameraId: film.gearCameraId?._id || film.gearCameraId || null,
        gearLensId: film.gearLensId?._id || film.gearLensId || null,
        defaultExposureSettings: film.defaultExposureSettings,
        developmentSettings: film.developmentSettings,
        notes: film.notes
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la duplication de la pellicule.");
    }
  };

  // --- Gestion Planche-Contact ---
  const handleDirectUploadToSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilmRoll || showPhotoPickerForSlot === null || !selectedUploadAlbumId || !uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('photos', uploadFile);
    formData.append('albumId', selectedUploadAlbumId);
    
    const meta = [{
      index: 0,
      title: uploadFile.name.split('.').slice(0, -1).join('.') || 'Sans titre',
      description: `Importé via la pellicule ${selectedFilmRoll.name}`,
      isCover: false,
      originalName: uploadFile.name,
      tag: '',
      applyWatermark: false,
      watermarkText: '',
      filmId: selectedFilmRoll._id,
      filmFrameNumber: showPhotoPickerForSlot,
      isAnalog: true
    }];
    formData.append('metadata', JSON.stringify(meta));

    try {
      await api.post('/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadFile(null);
      setShowPhotoPickerForSlot(null);
      setPickerTab('gallery');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Erreur lors du téléversement : ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleLinkPhotoToSlot = async (photoId: string) => {
    if (!selectedFilmRoll || showPhotoPickerForSlot === null) return;
    try {
      await api.put(`/photos/${photoId}`, {
        filmId: selectedFilmRoll._id,
        filmFrameNumber: showPhotoPickerForSlot,
        isAnalog: true
      });
      setShowPhotoPickerForSlot(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur d'association de la photo.");
    }
  };

  const handleUnlinkPhotoFromSlot = async (photoId: string) => {
    if (!window.confirm('Détacher cette photo de la vue ?')) return;
    try {
      await api.put(`/photos/${photoId}`, {
        filmId: null,
        filmFrameNumber: null
      });
      fetchData();
    } catch (err) {
      alert('Erreur de modification.');
    }
  };

  const handleToggleProjectPublish = async (project: any) => {
    try {
      await api.put(`/projects/${project._id}`, { isPublished: !project.isPublished });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la mise à jour du projet.");
    }
  };

  const handleTogglePhotoShowOnBlog = async (photo: any) => {
    try {
      await api.put(`/photos/${photo._id}`, { showOnBlog: !photo.showOnBlog });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la mise à jour du statut de la photo.");
    }
  };

  const handleSavePhoto = async (updatedData: any) => {
    if (!editingPhoto) return;
    try {
      await api.put(`/photos/${editingPhoto._id}`, updatedData);
      setEditingPhoto(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la sauvegarde de la photo.");
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Supprimer définitivement cette photo ?")) return;
    try {
      await api.delete(`/photos/${photoId}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la suppression de la photo.");
    }
  };

  const getProjectPublicUrl = (project: any) => {
    const name = (user?.name || 'jac').toLowerCase();
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return `http://localhost:7082/project/${project.slug}?user=${name}`;
    }
    return `https://${name}-carnet.helioscope.fr/project/${project.slug}`;
  };

  const getProjectEmbedUrl = (project: any) => {
    const name = (user?.name || 'jac').toLowerCase();
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return `http://localhost:7082/embed/project/${project.slug}?user=${name}`;
    }
    return `https://${name}-carnet.helioscope.fr/embed/project/${project.slug}`;
  };

  const resetForm = () => {
    setEditingItem(null);
    setEditingIdea(null);
    setShowAddIdea(false);
    setShowAddProject(false);
    setShowAddGear(false);
    setShowAddFilm(false);
    setShowConcretizeModal(false);
    setConcretizeIdeaItem(null);
    setViewingIdea(null);

    // Boîte à idées
    setIdeaName('');
    setIdeaNotesMarkdown('');
    setIdeaTags('');
    setIdeaTargetDate('');
    setIdeaCover('');
    setIdeaPreviewMarkdown(false);
    setIdeaUploadingImage(false);

    // Projet
    setProjectName('');
    setProjectDesc('');
    setProjectStatus('IN_PROGRESS');
    setProjectMedium('ANALOG');
    setProjectTags('');
    setProjectTargetDate('');
    setProjectPublished(false);
    setProjectCover('');
    setProjectMakingOf('');
    setProjectMakingOfPreview(false);
    setProjectMakingOfUploading(false);

    // Matériel
    setGearType('camera');
    setGearSubType('continuous');
    setGearBrand('');
    setGearModel('');
    setGearFormat('35mm');
    setGearMaxPowerWatts('');
    setGearSerial('');
    setGearNotes('');

    // Pellicule
    setFilmName('');
    setFilmBrand('');
    setFilmType('');
    setFilmIso(400);
    setFilmFormat('135');
    setFilmMaxViews(36);
    setFilmTypeColor('BW');
    setFilmGearCameraId('');
    setFilmGearLensId('');
    setFilmDefaultSpeed('');
    setFilmDefaultAperture('');
    setFilmDefaultFilter('Aucun');
    setFilmDefaultNdFilter('Aucun');
    setFilmDefaultLensHood(false);
    setFilmNotes('');

    setFilmIsoUsed('');
    setDevDeveloper('');
    setDevDilution('');
    setDevTimeMin(0);
    setDevTimeSec(0);
    setDevTemperature('');
    setDevAgitation('');
    setDevPushPull('');
    setDevFixerBrand('');
    setDevFixerDilution('1+4');
    setDevFixerTime('5mn');
  };

  const ideasList = projects.filter(p => p.status === 'IDEA');
  const activeProjectsList = projects.filter(p => p.status !== 'IDEA');

  // Collecter tous les tags d'idées pour filtre rapide
  const allIdeaTags = Array.from(
    new Set(
      ideasList
        .flatMap(i => (Array.isArray(i.tags) ? i.tags : []))
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  return (
    <div className={`space-y-8 px-4 py-8 sm:px-8 sm:py-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end pb-5 border-b gap-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Chambre Noire & Carnet
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Gérez vos idées créatives, vos projets multi-médiums, vos boîtiers et vos pellicules.
          </p>
        </div>
        <Link
          to="/dashboard"
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition ${
            isDark
              ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          ← Dashboard
        </Link>
      </div>

      {/* Tabs Selector */}
      <div className={`flex border-b gap-2 overflow-x-auto pb-1 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button
          onClick={() => { setActiveTab('ideas'); resetForm(); setSelectedFilmRoll(null); }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ideas' && !selectedFilmRoll
              ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
              : isDark
              ? 'border-transparent text-gray-400 hover:text-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💡 Boîte à Idées
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'ideas' && !selectedFilmRoll
              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
              : isDark
              ? 'bg-white/10 text-gray-400'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {ideasList.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('projects'); resetForm(); setSelectedFilmRoll(null); }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'projects' && !selectedFilmRoll
              ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
              : isDark
              ? 'border-transparent text-gray-400 hover:text-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📂 Projets
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'projects' && !selectedFilmRoll
              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
              : isDark
              ? 'bg-white/10 text-gray-400'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {activeProjectsList.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('photos'); resetForm(); setSelectedFilmRoll(null); }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'photos' && !selectedFilmRoll
              ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
              : isDark
              ? 'border-transparent text-gray-400 hover:text-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🖼️ Photos
        </button>
        <button
          onClick={() => { setActiveTab('gear'); resetForm(); setSelectedFilmRoll(null); }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'gear' && !selectedFilmRoll
              ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
              : isDark
              ? 'border-transparent text-gray-400 hover:text-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📷 Matériel Photo
        </button>
        <button
          onClick={() => { setActiveTab('films'); resetForm(); }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'films' || selectedFilmRoll
              ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold'
              : isDark
              ? 'border-transparent text-gray-400 hover:text-white'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🎞️ Pellicules {selectedFilmRoll && `(${selectedFilmRoll.name})`}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : selectedFilmRoll ? (
        /* ========================================================================= */
        /* VIEW: PLANCHE-CONTACT (VISUALISATION DU ROULEAU FILME) */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl p-5 border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div>
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">
                PLANCHE-CONTACT ARGENTIQUE
              </span>
              <h2 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedFilmRoll.name}</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Film: {selectedFilmRoll.brand} {selectedFilmRoll.filmType} (ISO {selectedFilmRoll.iso}) | Format:{' '}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ml-2 ${
                selectedFilmRoll.format?.toLowerCase().includes('4x5') || selectedFilmRoll.format?.toLowerCase().includes('9x12') || selectedFilmRoll.format === 'plan-film'
                  ? 'bg-purple-600/30 text-purple-700 dark:text-purple-300'
                  : selectedFilmRoll.format === '120'
                  ? 'bg-blue-600/30 text-blue-700 dark:text-blue-300'
                  : 'bg-green-600/30 text-green-700 dark:text-green-300'
              }`}>
                {selectedFilmRoll.format === '135' ? '35mm' : selectedFilmRoll.format}
              </span>
              </p>
              {selectedFilmRoll.gearCameraId && (
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Boîtier : {selectedFilmRoll.gearCameraId.brand} {selectedFilmRoll.gearCameraId.model}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilmRoll(null)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  isDark ? 'bg-white/10 hover:bg-white/20 text-white border-transparent' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                }`}
              >
                &larr; Retour aux Pellicules
              </button>
            </div>
          </div>

          {/* Guide d'aide rapide */}
          <div className={`border rounded-2xl p-4 text-xs space-y-2 ${
            isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-gray-300' : 'bg-amber-50 border-amber-200 text-gray-700'
          }`}>
            <h4 className="font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-1.5">
              💡 Guide de saisie des photos argentiques
            </h4>
            <p>
              Chaque case ci-dessous représente une vue (ou plan-film) de votre pellicule. 
              Pour ajouter une image à une vue, cliquez sur <strong>"Associer"</strong>. Vous pourrez alors :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Choisir une photo existante depuis votre <strong>Galerie</strong>.</li>
              <li>Ou utiliser l'onglet <strong>"Téléverser une image"</strong> pour importer une nouvelle photo directement pour cette case.</li>
            </ul>
            <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Les paramètres par défaut de la pellicule (boîtier, objectifs, réglages d'exposition, etc.) seront automatiquement appliqués aux photos associées.
            </p>
          </div>

          {/* Grille planche-contact */}
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: selectedFilmRoll.maxViews }).map((_, idx) => {
              const viewNum = idx + 1;
              const associatedPhoto = myPhotos.find(
                p => p.filmId === selectedFilmRoll._id && p.filmFrameNumber === viewNum
              );

              return (
                <div
                  key={viewNum}
                  className={`rounded-xl overflow-hidden flex flex-col justify-between aspect-[3/4] relative group transition border ${
                    isDark
                      ? 'bg-black/30 border-white/10 hover:border-yellow-500/40'
                      : 'bg-white border-gray-200 shadow-sm hover:border-yellow-500/60 hover:shadow-md'
                  }`}
                >
                  <div className={`absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-black/60 backdrop-blur text-yellow-500' : 'bg-white/90 shadow text-yellow-700'
                  }`}>
                    {selectedFilmRoll.format === 'plan-film' ? 'Plan-film' : `Vue ${viewNum}`}
                  </div>

                  {associatedPhoto ? (
                    <>
                      <div className="flex-1 w-full bg-black/50 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={`/uploads/thumb-${associatedPhoto.filename}`}
                          alt={associatedPhoto.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay au hover */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition duration-200 text-white">
                          <p className="text-xs font-bold text-center px-2 line-clamp-2">{associatedPhoto.title}</p>
                          {associatedPhoto.exposureSettings?.aperture && (
                            <p className="text-[10px] text-gray-300 font-mono">
                              {associatedPhoto.exposureSettings.aperture} | {associatedPhoto.exposureSettings.shutterSpeed}
                            </p>
                          )}
                          <div className="flex gap-1.5 mt-2">
                            <button
                              onClick={() => handleUnlinkPhotoFromSlot(associatedPhoto._id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded p-1 text-[10px] font-bold uppercase transition"
                              title="Détacher la photo"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-3xl opacity-20">🎞️</span>
                      <button
                        onClick={() => setShowPhotoPickerForSlot(viewNum)}
                        className={`mt-3 border rounded-lg py-1 px-2 text-[10px] font-bold transition uppercase tracking-wider ${
                          isDark
                            ? 'bg-white/5 hover:bg-yellow-500 hover:text-black border-white/10'
                            : 'bg-gray-100 hover:bg-yellow-500 hover:text-black border-gray-200 text-gray-700'
                        }`}
                      >
                        Associer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sub-modal: Photo Picker */}
          {showPhotoPickerForSlot !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[80vh] flex flex-col border ${
                isDark ? 'bg-gray-900 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}>
                <button
                  onClick={() => {
                    setShowPhotoPickerForSlot(null);
                    setPickerSearch('');
                    setFilterByCameraTag(false);
                    setPickerTab('gallery');
                    setUploadFile(null);
                  }}
                  className={`absolute top-4 right-4 text-2xl ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  &times;
                </button>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Associer une photo au{' '}
                  {selectedFilmRoll.format === 'plan-film'
                    ? 'Plan-film'
                    : `Vue #${showPhotoPickerForSlot}`}
                </h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choisissez une photo de votre galerie ou téléversez-la directement.</p>

                <div className={`flex border-b mb-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setPickerTab('gallery')}
                    className={`flex-1 text-center py-2 text-xs font-semibold transition ${
                      pickerTab === 'gallery'
                        ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Choisir depuis la galerie
                  </button>
                  <button
                    onClick={() => setPickerTab('upload')}
                    className={`flex-1 text-center py-2 text-xs font-semibold transition ${
                      pickerTab === 'upload'
                        ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Téléverser directement
                  </button>
                </div>

                {pickerTab === 'gallery' && (
                  <>
                    {/* Filtre / Recherche */}
                    <div className={`flex flex-col sm:flex-row gap-2 mb-4 p-3 rounded-lg border ${
                      isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <input
                        type="text"
                        placeholder="Filtrer par titre ou tag..."
                        value={pickerSearch}
                        onChange={e => setPickerSearch(e.target.value)}
                        className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <label className={`flex items-center gap-1.5 text-xs select-none cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <input
                          type="checkbox"
                          checked={filterByCameraTag}
                          onChange={e => setFilterByCameraTag(e.target.checked)}
                          className="w-3.5 h-3.5 text-yellow-500 rounded bg-transparent border-gray-400 focus:ring-0 cursor-pointer"
                        />
                        Uniquement tag 'camera'
                      </label>
                    </div>
                  </>
                )}

                {pickerTab === 'gallery' && (
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 flex-1">
                    {myPhotos
                      .filter(p => {
                        if (p.filmId) return false;
                        if (pickerSearch) {
                          const q = pickerSearch.toLowerCase();
                          const matchTitle = p.title?.toLowerCase().includes(q);
                          const matchTags = p.tags?.some((t: string) => t.toLowerCase().includes(q));
                          if (!matchTitle && !matchTags) return false;
                        }
                        if (filterByCameraTag) {
                          const hasCameraTag = p.tags?.some((t: string) => {
                            const lt = t.toLowerCase();
                            return lt === 'camera' || lt === 'camara';
                          });
                          if (!hasCameraTag) return false;
                        }
                        return true;
                      })
                      .map(p => (
                        <div
                          key={p._id}
                          onClick={() => {
                            handleLinkPhotoToSlot(p._id);
                            setPickerSearch('');
                            setFilterByCameraTag(false);
                          }}
                          className="bg-black/40 rounded-lg overflow-hidden aspect-square border border-white/5 hover:border-yellow-500 cursor-pointer relative group"
                        >
                          <img src={`/uploads/thumb-${p.filename}`} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-1.5 transition duration-150">
                            <p className="text-[9px] truncate w-full text-white font-medium">{p.title}</p>
                            {p.tags && p.tags.length > 0 && (
                              <p className="text-[7px] truncate w-full text-yellow-400">{p.tags.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      ))}

                    {myPhotos.filter(p => !p.filmId).length === 0 ? (
                      <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
                        Toutes vos photos importées ont déjà été assignées à un rouleau.
                      </div>
                    ) : (
                      myPhotos.filter(p => {
                        if (p.filmId) return false;
                        if (pickerSearch) {
                          const q = pickerSearch.toLowerCase();
                          const matchTitle = p.title?.toLowerCase().includes(q);
                          const matchTags = p.tags?.some((t: string) => t.toLowerCase().includes(q));
                          if (!matchTitle && !matchTags) return false;
                        }
                        if (filterByCameraTag) {
                          const hasCameraTag = p.tags?.some((t: string) => {
                            const lt = t.toLowerCase();
                            return lt === 'camera' || lt === 'camara';
                          });
                          if (!hasCameraTag) return false;
                        }
                        return true;
                      }).length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
                          Aucune photo ne correspond aux filtres.
                        </div>
                      )
                    )}
                  </div>
                )}

                {pickerTab === 'upload' && (
                  <form onSubmit={handleDirectUploadToSlot} className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Album de destination *</label>
                      <select
                        value={selectedUploadAlbumId}
                        onChange={e => setSelectedUploadAlbumId(e.target.value)}
                        className={`w-full rounded-lg p-2 text-xs border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      >
                        <option value="">Sélectionner un album</option>
                        {userAlbums.map(a => (
                          <option key={a._id} value={a._id}>{a.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Fichier image *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                        className={`w-full rounded-lg p-2 text-xs border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploading || !selectedUploadAlbumId || !uploadFile}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition disabled:opacity-50 mt-4 text-xs uppercase tracking-wider"
                    >
                      {uploading ? '⏳ Téléversement en cours...' : 'Téléverser et associer'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* TAB: 💡 BOÎTE À IDÉES */}
          {/* ========================================================================= */}
          {activeTab === 'ideas' && (
            <div className="space-y-6">
              {/* En-tête et barre de recherche / action */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl p-5 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <h2 className={`text-xl font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💡 Boîte à Idées Photographiques
                  </h2>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Notez vos intentions artistiques, inspirations visuelles et thématiques avant de les concrétiser en projets.
                  </p>
                </div>
                {!showAddIdea && (
                  <button
                    onClick={() => { resetForm(); setShowAddIdea(true); }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-yellow-950/20 flex items-center gap-1.5"
                  >
                    + Nouvelle Idée
                  </button>
                )}
              </div>

              {/* Filtres de recherche des idées */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Rechercher une idée, un mot-clé..."
                    value={searchIdeaQuery}
                    onChange={e => setSearchIdeaQuery(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500 border ${
                      isDark
                        ? 'bg-black/40 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-yellow-500'
                    }`}
                  />
                </div>
                {allIdeaTags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap items-center">
                    <span className={`text-[11px] font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tags :</span>
                    <button
                      onClick={() => setFilterIdeaTag('')}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition ${
                        filterIdeaTag === ''
                          ? 'bg-yellow-500 text-black font-bold shadow-sm'
                          : isDark
                          ? 'bg-white/5 text-gray-400 hover:text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Tous
                    </button>
                    {allIdeaTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilterIdeaTag(filterIdeaTag === tag ? '' : tag)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition ${
                          filterIdeaTag === tag
                            ? 'bg-yellow-500 text-black font-bold shadow-sm'
                            : isDark
                            ? 'bg-white/5 text-gray-400 hover:text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulaire de création / modification d'une idée */}
              {showAddIdea && (
                <form onSubmit={handleSaveIdea} className={`rounded-2xl p-6 space-y-4 max-w-2xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {editingIdea ? '✏️ Modifier l\'Idée' : '💡 Noter une Nouvelle Idée'}
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Titre de l'idée *</label>
                      <input
                        type="text"
                        value={ideaName}
                        onChange={e => setIdeaName(e.target.value)}
                        className={`w-full rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500 border ${
                          isDark
                            ? 'bg-black/40 border-white/10 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-yellow-500'
                        }`}
                        placeholder="ex: Brumes d'automne au lever du jour, Portraits contrastés en clair-obscur..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Tags / Thématiques (séparés par des virgules)</label>
                        <input
                          type="text"
                          value={ideaTags}
                          onChange={e => setIdeaTags(e.target.value)}
                          className={`w-full rounded-lg p-2 text-xs focus:outline-none focus:border-yellow-500 border ${
                            isDark
                              ? 'bg-black/40 border-white/10 text-white placeholder-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-yellow-500'
                          }`}
                          placeholder="ex: paysage, automne, n&b, repérage"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Échéance cible / Date visée (optionnel)</label>
                        <input
                          type="date"
                          value={ideaTargetDate}
                          onChange={e => setIdeaTargetDate(e.target.value)}
                          className={`w-full rounded-lg p-2 text-xs focus:outline-none focus:border-yellow-500 border ${
                            isDark
                              ? 'bg-black/40 border-white/10 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Markdown Notes & Intentions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                          📝 Notes & Intentions (Markdown complet)
                        </label>
                        <div className="flex gap-2">
                          <label
                            htmlFor="idea-image-upload"
                            className={`cursor-pointer text-[10px] font-bold uppercase px-2 py-1 rounded border transition ${
                              ideaUploadingImage
                                ? 'border-yellow-400/30 text-yellow-500/50'
                                : 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10'
                            }`}
                            title="Insérer une image d'inspiration ou de référence"
                          >
                            {ideaUploadingImage ? '⏳ Upload...' : '📎 Image / Référence'}
                          </label>
                          <input
                            id="idea-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={ideaUploadingImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIdeaUploadingImage(true);
                              try {
                                const formData = new FormData();
                                formData.append('image', file);
                                const res = await api.post('/photos/making-of/upload', formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                const url = res.data.url;
                                const mdSnippet = `\n![${file.name}](${url})\n`;
                                setIdeaNotesMarkdown(prev => prev + mdSnippet);
                              } catch (err) {
                                alert('Erreur lors de l\'upload de l\'image');
                              } finally {
                                setIdeaUploadingImage(false);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setIdeaPreviewMarkdown(p => !p)}
                            className="text-[10px] font-bold uppercase px-2 py-1 rounded border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 transition"
                          >
                            {ideaPreviewMarkdown ? '✏️ Éditer' : '👁 Aperçu'}
                          </button>
                        </div>
                      </div>

                      {ideaPreviewMarkdown ? (
                        <div
                          className={`w-full min-h-[140px] rounded-lg p-3 text-sm max-w-none overflow-auto border ${
                            isDark
                              ? 'bg-black/40 border-white/10 text-gray-200 prose prose-invert'
                              : 'bg-amber-50/40 border-gray-200 text-gray-800 prose prose-neutral'
                          }`}
                        >
                          {ideaNotesMarkdown ? (
                            <MarkdownRenderer>{ideaNotesMarkdown}</MarkdownRenderer>
                          ) : (
                            <span className="text-gray-400 italic">Aucune note saisie.</span>
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={ideaNotesMarkdown}
                          onChange={e => setIdeaNotesMarkdown(e.target.value)}
                          rows={6}
                          placeholder={`Décrivez vos idées, inspirations, lieux de repérage...\n\nExemple :\n# Intention\nCapturer l'ambiance des ruelles au lever du soleil.\n\n- Boîtier à privilégier : Léger\n- Heure dorée : 06h30 - 07h30\n- Lieux : Quartier historique`}
                          className={`w-full rounded-lg p-3 text-xs resize-y font-mono leading-relaxed focus:outline-none focus:border-yellow-500 border ${
                            isDark
                              ? 'bg-black/40 border-white/10 text-white placeholder-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div className={`flex gap-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <button
                      type="submit"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-lg text-sm transition"
                    >
                      {editingIdea ? 'Enregistrer les modifications' : 'Ajouter l\'idée'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300 border-transparent'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Grille des cartes d'idées */}
              {(() => {
                const filteredIdeas = ideasList.filter(idea => {
                  if (searchIdeaQuery) {
                    const q = searchIdeaQuery.toLowerCase();
                    const matchName = (idea.name || '').toLowerCase().includes(q);
                    const matchDesc = (idea.description || '').toLowerCase().includes(q);
                    const matchNotes = (idea.notesMarkdown || '').toLowerCase().includes(q);
                    const matchTags = Array.isArray(idea.tags) && idea.tags.some((t: string) => t.toLowerCase().includes(q));
                    if (!matchName && !matchDesc && !matchNotes && !matchTags) return false;
                  }
                  if (filterIdeaTag) {
                    const hasTag = Array.isArray(idea.tags) && idea.tags.some((t: string) => t.toLowerCase() === filterIdeaTag.toLowerCase());
                    if (!hasTag) return false;
                  }
                  return true;
                });

                if (filteredIdeas.length === 0) {
                  return (
                    <div className={`text-center py-16 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-600 shadow-sm'
                    }`}>
                      <div className="text-4xl">💡</div>
                      <p className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                        {searchIdeaQuery || filterIdeaTag ? 'Aucune idée ne correspond à votre recherche.' : 'Votre boîte à idées est vide.'}
                      </p>
                      <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Notez vos inspirations dès qu'elles vous viennent à l'esprit, puis transformez-les en projets actifs en un clic.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredIdeas.map(idea => (
                      <div
                        key={idea._id}
                        className={`rounded-2xl p-5 flex flex-col justify-between transition duration-200 group border ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:border-yellow-500/40 hover:bg-white/[0.07] shadow-md'
                            : 'bg-white border-gray-200 hover:border-yellow-500/60 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className={`font-bold text-lg transition-colors ${
                              isDark ? 'text-white group-hover:text-yellow-400' : 'text-gray-900 group-hover:text-yellow-600'
                            }`}>
                              {idea.name}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              isDark
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            }`}>
                              💡 Idée
                            </span>
                          </div>

                          {/* Date cible */}
                          {idea.targetDate && (
                            <p className={`text-[11px] flex items-center gap-1 font-semibold ${
                              isDark ? 'text-amber-400' : 'text-amber-700'
                            }`}>
                              📅 Échéance : {new Date(idea.targetDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          )}

                          {/* Tags */}
                          {Array.isArray(idea.tags) && idea.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {idea.tags.map((t: string, i: number) => (
                                <span key={i} className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                                  isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Notes Preview */}
                          {idea.notesMarkdown ? (
                            <div
                              onClick={() => setViewingIdea(idea)}
                              className={`text-xs rounded-xl p-3 max-h-36 overflow-y-auto border leading-relaxed cursor-pointer transition ${
                                isDark
                                  ? 'text-gray-200 bg-black/30 border-white/5 hover:border-yellow-500/30 prose prose-invert prose-xs'
                                  : 'text-gray-800 bg-amber-50/50 border-amber-200/60 hover:border-amber-400 prose prose-neutral prose-xs'
                              }`}
                              title="Cliquer pour agrandir l'idée"
                            >
                              <MarkdownRenderer>{idea.notesMarkdown}</MarkdownRenderer>
                            </div>
                          ) : (
                            <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Aucune note détaillée.</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className={`pt-4 mt-4 space-y-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                          <button
                            onClick={() => handleOpenConcretizeModal(idea)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold py-2 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                          >
                            🚀 Concrétiser en Projet
                          </button>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setViewingIdea(idea)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border flex items-center gap-1 ${
                                isDark
                                  ? 'text-blue-400 hover:text-blue-300 bg-blue-500/10 border-transparent'
                                  : 'text-blue-700 hover:text-blue-800 bg-blue-50 border-blue-200'
                              }`}
                            >
                              👁️ Voir
                            </button>
                            <button
                              onClick={() => handleEditIdea(idea)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                isDark
                                  ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 border-transparent'
                                  : 'text-yellow-700 hover:text-yellow-800 bg-yellow-50 border-yellow-200'
                              }`}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteIdea(idea._id)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                isDark
                                  ? 'text-red-400 hover:text-red-300 bg-red-500/10 border-transparent'
                                  : 'text-red-700 hover:text-red-800 bg-red-50 border-red-200'
                              }`}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: 📂 PROJECTS (MULTI-MÉDIUMS) */}
          {/* ========================================================================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* En-tête et création */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl p-5 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📂 Projets de Prise de Vue
                  </h2>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gérez vos séries en cours et terminées en Numérique ⚡, Argentique 🎞️ ou Hybride 🔀.
                  </p>
                </div>
                {!showAddProject && (
                  <button
                    onClick={() => { resetForm(); setShowAddProject(true); }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-yellow-950/20"
                  >
                    + Nouveau Projet
                  </button>
                )}
              </div>

              {/* Barre de filtres par statut et par médium */}
              <div className={`flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-4 rounded-2xl border ${
                isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                {/* Recherche */}
                <div className="w-full lg:w-64">
                  <input
                    type="text"
                    placeholder="Filtrer par nom, description, tag..."
                    value={searchProjectQuery}
                    onChange={e => setSearchProjectQuery(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-yellow-500 border ${
                      isDark
                        ? 'bg-black/40 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-yellow-500'
                    }`}
                  />
                </div>

                {/* Filtres Médiums */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[11px] font-semibold mr-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Médium :</span>
                  {[
                    { key: 'ALL', label: 'Tous' },
                    { key: 'DIGITAL', label: '⚡ Numérique' },
                    { key: 'ANALOG', label: '🎞️ Argentique' },
                    { key: 'HYBRID', label: '🔀 Hybride' }
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setFilterProjectMedium(m.key)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                        filterProjectMedium === m.key
                          ? 'bg-yellow-500 text-black font-bold'
                          : isDark
                          ? 'bg-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Filtres Statuts */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[11px] font-semibold mr-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Statut :</span>
                  {[
                    { key: 'ALL', label: 'Tous' },
                    { key: 'PREPARATION', label: '📋 En prépa' },
                    { key: 'IN_PROGRESS', label: '📸 En cours' },
                    { key: 'COMPLETED', label: '✨ Finalisé' },
                    { key: 'ARCHIVED', label: '📦 Archivé' }
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={() => setFilterProjectStatus(s.key)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                        filterProjectStatus === s.key
                          ? 'bg-yellow-500 text-black font-bold'
                          : isDark
                          ? 'bg-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire Projet */}
              {showAddProject && (
                <form onSubmit={handleSaveProject} className={`rounded-2xl p-6 space-y-4 max-w-2xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {editingItem ? 'Modifier le projet' : 'Créer un nouveau projet'}
                  </h3>

                  <div className="grid gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Nom du projet *</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border focus:outline-none focus:border-yellow-500 ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: Matinées brumeuses, Lisbonne en été..."
                        required
                      />
                    </div>

                    {/* Choix du Médium */}
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Médium photographique</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'DIGITAL', label: '⚡ Numérique', desc: 'Boîtiers & EXIF' },
                          { key: 'ANALOG', label: '🎞️ Argentique', desc: 'Films & Chimie' },
                          { key: 'HYBRID', label: '🔀 Hybride', desc: 'Mixte' }
                        ].map(m => (
                          <button
                            type="button"
                            key={m.key}
                            onClick={() => setProjectMedium(m.key as any)}
                            className={`p-2.5 rounded-xl border text-left transition ${
                              projectMedium === m.key
                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 font-bold'
                                : isDark
                                ? 'border-white/10 bg-black/30 text-gray-400 hover:text-white'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <div className="font-bold text-xs">{m.label}</div>
                            <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{m.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Choix du Statut */}
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Statut du projet</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: 'PREPARATION', label: '📋 En préparation' },
                          { key: 'IN_PROGRESS', label: '📸 Prises de vue' },
                          { key: 'COMPLETED', label: '✨ Finalisé' },
                          { key: 'ARCHIVED', label: '📦 Archivé' }
                        ].map(s => (
                          <button
                            type="button"
                            key={s.key}
                            onClick={() => setProjectStatus(s.key as any)}
                            className={`p-2 rounded-lg border text-center transition text-xs font-semibold ${
                              projectStatus === s.key
                                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                                : isDark
                                ? 'border-white/10 bg-black/30 text-gray-400 hover:text-white'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Tags (séparés par virgules)</label>
                        <input
                          type="text"
                          value={projectTags}
                          onChange={e => setProjectTags(e.target.value)}
                          className={`w-full rounded-lg p-2 text-xs border focus:outline-none focus:border-yellow-500 ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="ex: architecture, été, 35mm"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Date cible / Prévue</label>
                        <input
                          type="date"
                          value={projectTargetDate}
                          onChange={e => setProjectTargetDate(e.target.value)}
                          className={`w-full rounded-lg p-2 text-xs border focus:outline-none focus:border-yellow-500 ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Description / Intention artistique</label>
                      <textarea
                        value={projectDesc}
                        onChange={e => setProjectDesc(e.target.value)}
                        rows={3}
                        className={`w-full rounded-lg p-2 text-sm resize-none border focus:outline-none focus:border-yellow-500 ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Décrivez l'intention artistique globale du projet..."
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Image de couverture (Nom de fichier)</label>
                      <input
                        type="text"
                        value={projectCover}
                        onChange={e => setProjectCover(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm font-mono border focus:outline-none focus:border-yellow-500 ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: 1772987727758.jpg (optionnel)"
                      />
                    </div>

                    {/* SECRET DE FABRICATION PROJET */}
                    <div className={`border-t pt-4 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400">🎬 Secret de fabrication (Optionnel)</label>
                        <div className="flex gap-2">
                          <label
                            htmlFor="project-making-of-upload"
                            className={`cursor-pointer text-[10px] font-bold uppercase px-2 py-1 rounded border transition ${
                              projectMakingOfUploading
                                ? 'border-purple-400/30 text-purple-400/50'
                                : 'border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
                            }`}
                            title="Insérer une image"
                          >
                            {projectMakingOfUploading ? '⏳ Upload...' : '📎 Image'}
                          </label>
                          <input
                            id="project-making-of-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={projectMakingOfUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setProjectMakingOfUploading(true);
                              try {
                                const formData = new FormData();
                                formData.append('image', file);
                                const res = await api.post('/photos/making-of/upload', formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                const url = res.data.url;
                                const mdSnippet = `\n![${file.name}](${url})\n`;
                                setProjectMakingOf(prev => prev + mdSnippet);
                              } catch (err) {
                                alert('Erreur lors de l\'upload de l\'image');
                              } finally {
                                setProjectMakingOfUploading(false);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setProjectMakingOfPreview(p => !p)}
                            className="text-[10px] font-bold uppercase px-2 py-1 rounded border border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition"
                          >
                            {projectMakingOfPreview ? '✏️ Éditer' : '👁 Aperçu'}
                          </button>
                        </div>
                      </div>
                      <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Markdown supporté : **gras**, *italique*, # titres, ![alt](url)</p>
                      {projectMakingOfPreview ? (
                        <div
                          className={`w-full min-h-[120px] rounded-lg p-3 text-sm max-w-none overflow-auto border ${
                            isDark
                              ? 'bg-black/40 border-white/10 text-gray-200 prose prose-invert'
                              : 'bg-purple-50/40 border-gray-200 text-gray-800 prose prose-neutral'
                          }`}
                        >
                          {projectMakingOf ? (
                            <MarkdownRenderer>{projectMakingOf}</MarkdownRenderer>
                          ) : (
                            <span className="text-gray-400 italic">Aucun contenu</span>
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={projectMakingOf}
                          onChange={e => setProjectMakingOf(e.target.value)}
                          rows={4}
                          placeholder={`Racontez le secret de fabrication de ce projet...\n\nEx: # Recherches préparatoires\nVoici mes dessins de recherche pour ce projet...\n\n![Dessin préparatoire](/uploads/making-of/croquis.jpg)`}
                          className={`w-full rounded-lg p-3 text-xs resize-y font-mono leading-relaxed border focus:outline-none focus:border-purple-500 ${
                            isDark
                              ? 'bg-black/40 border-white/10 text-white placeholder-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="pub"
                        checked={projectPublished}
                        onChange={e => setProjectPublished(e.target.checked)}
                        className="w-4 h-4 rounded text-yellow-500 focus:ring-0 bg-black/40 border-white/10 animate-none"
                      />
                      <label htmlFor="pub" className={`text-sm select-none cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700 font-medium'}`}>
                        Publier (Visible dans le Carnet de routes)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      {editingItem ? 'Enregistrer' : 'Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300 border-transparent'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Grille des Projets */}
              {(() => {
                const filteredProjects = activeProjectsList.filter(p => {
                  if (filterProjectMedium !== 'ALL' && p.medium !== filterProjectMedium) return false;
                  if (filterProjectStatus !== 'ALL' && p.status !== filterProjectStatus) return false;
                  if (searchProjectQuery) {
                    const q = searchProjectQuery.toLowerCase();
                    const matchName = (p.name || '').toLowerCase().includes(q);
                    const matchDesc = (p.description || '').toLowerCase().includes(q);
                    const matchTags = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q));
                    if (!matchName && !matchDesc && !matchTags) return false;
                  }
                  return true;
                });

                if (filteredProjects.length === 0) {
                  return (
                    <div className={`text-center py-12 rounded-2xl border ${
                      isDark ? 'text-gray-500 bg-white/5 border-white/5' : 'text-gray-600 bg-white border-gray-200 shadow-sm'
                    }`}>
                      Aucun projet correspondant aux critères de filtre.
                    </div>
                  );
                }

                return (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map(p => (
                      <div key={p._id} className={`rounded-2xl p-5 flex flex-col justify-between transition border ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-md' : 'bg-white border-gray-200 hover:shadow-md'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                            <button
                              onClick={() => handleToggleProjectPublish(p)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                                p.isPublished
                                  ? 'bg-green-600/30 text-green-700 dark:text-green-300 hover:bg-green-600/50'
                                  : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 hover:bg-gray-500/30'
                              }`}
                              title="Cliquer pour basculer le statut"
                            >
                              {p.isPublished ? '✓ Public' : '✕ Masqué'}
                            </button>
                          </div>

                          {/* Badges Médium & Statut */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.medium === 'DIGITAL'
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                                : p.medium === 'ANALOG'
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                            }`}>
                              {p.medium === 'DIGITAL' ? '⚡ Numérique' : p.medium === 'ANALOG' ? '🎞️ Argentique' : '🔀 Hybride'}
                            </span>

                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              p.status === 'PREPARATION'
                                ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                                : p.status === 'IN_PROGRESS'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : p.status === 'COMPLETED'
                                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                            }`}>
                              {p.status === 'PREPARATION' ? '📋 En préparation' : p.status === 'IN_PROGRESS' ? '📸 En cours' : p.status === 'COMPLETED' ? '✨ Finalisé' : '📦 Archivé'}
                            </span>

                            {p.targetDate && (
                              <span className={`text-[10px] px-2 py-0.5 rounded ${
                                isDark ? 'text-gray-400 bg-white/5' : 'text-gray-600 bg-gray-100 border border-gray-200'
                              }`}>
                                📅 {new Date(p.targetDate).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          {Array.isArray(p.tags) && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {p.tags.map((t: string, i: number) => (
                                <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className={`text-xs line-clamp-3 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{p.description || 'Aucune description.'}</p>
                          <div className={`text-[11px] font-mono mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Slug : {p.slug}
                          </div>
                        </div>
                        <div className={`flex justify-between items-center pt-3 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleProjectPublish(p)}
                              className={`text-xs px-2 py-1 rounded transition font-bold ${
                                p.isPublished
                                  ? 'bg-green-700/80 hover:bg-green-600 text-white'
                                  : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300'
                              }`}
                            >
                              {p.isPublished ? 'En Ligne' : 'Hors Ligne'}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const projectUrl = getProjectPublicUrl(p);
                                const embedUrl = getProjectEmbedUrl(p);
                                setShareItem({
                                  type: 'project',
                                  title: p.name,
                                  url: projectUrl,
                                  embedUrl: embedUrl,
                                  htmlCode: `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`
                                });
                              }}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                isDark
                                  ? 'text-purple-400 hover:text-purple-300 bg-purple-500/10 border-transparent'
                                  : 'text-purple-700 hover:text-purple-800 bg-purple-50 border-purple-200'
                              }`}
                            >
                              Partager
                            </button>
                            <a
                              href={getProjectPublicUrl(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                isDark
                                  ? 'text-blue-400 hover:text-blue-300 bg-blue-500/10 border-transparent'
                                  : 'text-blue-700 hover:text-blue-800 bg-blue-50 border-blue-200'
                              }`}
                            >
                              Voir
                            </a>
                            <button
                              onClick={() => handleEditProject(p)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                isDark
                                  ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 border-transparent'
                                  : 'text-yellow-700 hover:text-yellow-800 bg-yellow-50 border-yellow-200'
                              }`}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p._id)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                isDark
                                  ? 'text-red-400 hover:text-red-300 bg-red-500/10 border-transparent'
                                  : 'text-red-700 hover:text-red-800 bg-red-50 border-red-200'
                              }`}
                            >
                              Suppr.
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL: 🚀 CONCRÉTISER UNE IDÉE EN PROJET ACTIF */}
          {/* ========================================================================= */}
          {showConcretizeModal && concretizeIdeaItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 relative flex flex-col space-y-4 border ${
                isDark ? 'bg-gray-900 border-yellow-500/30 text-white' : 'bg-white border-yellow-500/40 text-gray-900'
              }`}>
                <button
                  onClick={() => setShowConcretizeModal(false)}
                  className={`absolute top-4 right-4 text-2xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  &times;
                </button>

                <div>
                  <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">
                    CONCRÉTISATION DE PROJET
                  </span>
                  <h3 className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {concretizeIdeaItem.name}
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sélectionnez le médium et le point de départ pour donner vie à cette idée photographique.
                  </p>
                </div>

                <form onSubmit={handleExecuteConcretize} className="space-y-4 pt-2">
                  {/* Choix du Médium */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>1. Choisissez le médium :</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'DIGITAL', label: '⚡ Numérique', desc: 'Boîtier digital' },
                        { key: 'ANALOG', label: '🎞️ Argentique', desc: 'Pellicule/labo' },
                        { key: 'HYBRID', label: '🔀 Hybride', desc: 'Mixte' }
                      ].map(m => (
                        <button
                          type="button"
                          key={m.key}
                          onClick={() => setConcretizeMedium(m.key as any)}
                          className={`p-3 rounded-xl border text-center transition ${
                            concretizeMedium === m.key
                              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-bold shadow-md'
                              : isDark
                              ? 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <div className="text-sm font-semibold">{m.label}</div>
                          <div className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Choix du Statut Initial */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>2. Phase de démarrage :</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConcretizeStatus('PREPARATION')}
                        className={`p-2.5 rounded-xl border text-center transition text-xs ${
                          concretizeStatus === 'PREPARATION'
                            ? 'border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-bold'
                            : isDark
                            ? 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        📋 En Préparation
                        <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Repérages, matériel</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConcretizeStatus('IN_PROGRESS')}
                        className={`p-2.5 rounded-xl border text-center transition text-xs ${
                          concretizeStatus === 'IN_PROGRESS'
                            ? 'border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-bold'
                            : isDark
                            ? 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        📸 Prise de vue
                        <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Séance active</div>
                      </button>
                    </div>
                  </div>

                  {/* Date cible */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>3. Date cible (optionnel) :</label>
                    <input
                      type="date"
                      value={concretizeTargetDate}
                      onChange={e => setConcretizeTargetDate(e.target.value)}
                      className={`w-full rounded-lg p-2 text-xs border ${
                        isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
                    >
                      🚀 Lancer le Projet
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConcretizeModal(false)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition border ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300 border-transparent'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}          {/* ========================================================================= */}
          {/* MODAL: 👁️ VUE AGRANDIE & DESIGN ENRICHI DE L'IDÉE */}
          {/* ========================================================================= */}
          {viewingIdea && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md overflow-y-auto">
              <div className={`rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative flex flex-col max-h-[92vh] border transition-all ${
                isDark ? 'bg-gray-900/95 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}>
                {/* Bouton fermer */}
                <button
                  onClick={() => setViewingIdea(null)}
                  className={`absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-xl transition ${
                    isDark ? 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  &times;
                </button>

                {/* Header */}
                <div className={`border-b pb-5 pr-10 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isDark ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    }`}>
                      💡 Boîte à Idées
                    </span>
                    {viewingIdea.targetDate && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        📅 Date cible : {new Date(viewingIdea.targetDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                    {viewingIdea.createdAt && (
                      <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Créée le {new Date(viewingIdea.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {viewingIdea.name}
                  </h2>

                  {/* Tags */}
                  {Array.isArray(viewingIdea.tags) && viewingIdea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {viewingIdea.tags.map((t: string, i: number) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-0.5 rounded-lg font-medium ${
                            isDark ? 'bg-white/10 text-gray-200 border border-white/10' : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content / Notes & Intentions Area */}
                <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-6">
                  {viewingIdea.notesMarkdown ? (
                    <div className={`p-6 rounded-2xl border leading-relaxed ${
                      isDark
                        ? 'bg-black/40 border-white/10 text-gray-100 prose prose-invert prose-base max-w-none'
                        : 'bg-amber-50/40 border-amber-200/60 text-gray-900 prose prose-neutral prose-base max-w-none shadow-inner'
                    }`}>
                      <MarkdownRenderer>{viewingIdea.notesMarkdown}</MarkdownRenderer>
                    </div>
                  ) : (
                    <div className={`text-center py-16 rounded-2xl border italic ${
                      isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      Aucune note ou intention rédigée pour cette idée.
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className={`border-t pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const target = viewingIdea;
                        setViewingIdea(null);
                        handleEditIdea(target);
                      }}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 text-yellow-400 border-white/10'
                          : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}
                    >
                      ✏️ Modifier l'idée
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingIdea(null)}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold transition border ${
                        isDark
                          ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                      }`}
                    >
                      Fermer
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingIdea;
                      setViewingIdea(null);
                      handleOpenConcretizeModal(target);
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                  >
                    🚀 Concrétiser en Projet Actif
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'photos' && (() => {
            const filteredPhotos = myPhotos.filter(p =>
              p.showOnBlog &&
              ((p.title || 'Sans titre').toLowerCase().includes(searchPhotoQuery.toLowerCase()) ||
              (p.filename || '').toLowerCase().includes(searchPhotoQuery.toLowerCase()))
            );
            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mes Photos</h2>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={searchPhotoQuery}
                      onChange={e => setSearchPhotoQuery(e.target.value)}
                      className={`w-full rounded-xl px-3 py-1.5 text-sm border transition ${
                        isDark
                          ? 'bg-white/10 border-white/10 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm'
                      }`}
                      placeholder="Rechercher par nom..."
                    />
                  </div>
                </div>

                {filteredPhotos.length === 0 ? (
                  <div className={`text-center py-12 rounded-2xl border ${isDark ? 'text-gray-400 bg-white/5 border-white/5' : 'text-gray-600 bg-white border-gray-200'}`}>
                    Aucune photo publiée sur le carnet. Activez le bouton "Public (Carnet)" sur une photo pour l'afficher dans cette liste.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPhotos.map(p => (
                      <div key={p._id} className={`border rounded-2xl p-5 flex flex-col justify-between transition ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="space-y-4">
                          <div className="aspect-[4/3] w-full bg-black/40 rounded-xl overflow-hidden relative">
                          <img
                            src={`/uploads/thumb-${p.filename}`}
                            alt={p.title || 'Sans titre'}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleTogglePhotoShowOnBlog(p)}
                            className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                              p.showOnBlog
                                ? 'bg-green-600/80 text-green-100 hover:bg-green-600'
                                : 'bg-gray-600/80 text-gray-300 hover:bg-gray-600'
                            }`}
                            title="Cliquer pour basculer la visibilité"
                          >
                            {p.showOnBlog ? '✓ Public' : '✕ Masqué'}
                          </button>
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.title || 'Sans titre'}</h3>
                          <p className={`text-xs line-clamp-2 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{p.description || 'Aucune description.'}</p>
                          {p.location && (
                            <p className="text-[10px] text-gray-500 mt-1">📍 {p.location}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {p.gearCameraId && (
                              <span className={`text-[10px] border px-2 py-0.5 rounded font-mono ${
                                isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-700'
                              }`}>
                                📷 {p.gearCameraId.brand} {p.gearCameraId.model}
                              </span>
                            )}
                            {p.isAnalog && p.filmId && (
                              <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded font-mono text-yellow-600 dark:text-yellow-400 font-bold">
                                🧪 {p.filmId.brand} {p.filmId.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`flex justify-between items-center pt-3 border-t mt-4 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePhotoShowOnBlog(p)}
                            className={`text-xs px-2 py-1 rounded transition font-bold ${
                              p.showOnBlog
                                ? 'bg-green-700/80 hover:bg-green-600 text-white'
                                : 'bg-gray-700/80 hover:bg-gray-600 text-gray-300'
                            }`}
                          >
                            {p.showOnBlog ? '✓ Public' : '✕ Masqué'}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const photoUrl = `${window.location.origin}/uploads/${p.filename}`;
                              setShareItem({
                                type: 'photo',
                                title: p.title || 'Sans titre',
                                url: photoUrl,
                                htmlCode: `<img src="${photoUrl}" alt="${p.title || 'Photo'}" />`
                              });
                            }}
                            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg transition"
                          >
                            Partager
                          </button>
                          <a
                            href={`/uploads/${p.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition"
                          >
                            Voir
                          </a>
                          <button
                            onClick={() => setEditingPhoto(p)}
                            className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 bg-yellow-500/10 px-3 py-1.5 rounded-lg transition"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(p._id)}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg transition"
                          >
                            Suppr.
                          </button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB: GEAR */}
          {/* ========================================================================= */}
          {activeTab === 'gear' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mon Matériel Photo (Boîtiers, Objectifs & Éclairages)</h2>
                {!showAddGear && (
                  <button
                    onClick={() => { resetForm(); setShowAddGear(true); }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-yellow-950/20"
                  >
                    + Ajouter un Matériel
                  </button>
                )}
              </div>

              {showAddGear && (
                <form onSubmit={handleSaveGear} className={`border rounded-2xl p-6 space-y-4 max-w-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{editingItem ? 'Modifier le matériel' : 'Ajouter un matériel'}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Type de matériel *</label>
                      <select
                        value={gearType}
                        onChange={e => setGearType(e.target.value as 'camera' | 'lens' | 'eclairage')}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="camera">📷 Boîtier (Appareil photo)</option>
                        <option value="lens">🔍 Objectif</option>
                        <option value="eclairage">💡 Éclairage (Lumière continue / Flash)</option>
                      </select>
                    </div>

                    {gearType === 'eclairage' ? (
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Type d'éclairage *</label>
                        <select
                          value={gearSubType}
                          onChange={e => setGearSubType(e.target.value as 'continuous' | 'flash')}
                          className={`w-full rounded-lg p-2 text-sm border ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="continuous">☀️ Lumière continue (LED, COB, Torche...)</option>
                          <option value="flash">⚡ Flash (Cobra, Studio, Générateur...)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Format * (Pellicule ou Capteur)</label>
                        <input
                          type="text"
                          value={gearFormat}
                          onChange={e => setGearFormat(e.target.value)}
                          className={`w-full rounded-lg p-2 text-sm border ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="ex: 35mm, 120, Plein format, APS-C..."
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Marque *</label>
                      <input
                        type="text"
                        value={gearBrand}
                        onChange={e => setGearBrand(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={gearType === 'eclairage' ? 'ex: Godox, Profoto, Aputure, Elinchrom...' : 'ex: Leica, Canon, Hasselblad...'}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {gearType === 'eclairage' ? 'Nom / Modèle *' : 'Modèle / Caractéristique *'}
                      </label>
                      <input
                        type="text"
                        value={gearModel}
                        onChange={e => setGearModel(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={gearType === 'eclairage' ? 'ex: AD600 Pro, Amaran 200d, V1, D2 500...' : 'ex: M6, AE-1, 50mm f/1.4...'}
                        required
                      />
                    </div>

                    {gearType === 'eclairage' && (
                      <div className="sm:col-span-2">
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          Puissance maximale en Watts (W)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={gearMaxPowerWatts}
                            onChange={e => setGearMaxPowerWatts(e.target.value)}
                            className={`w-full rounded-lg p-2 pr-10 text-sm border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder="ex: 600 (Watts)"
                          />
                          <span className={`absolute right-3 top-2 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Watts
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Numéro de série</label>
                      <input
                        type="text"
                        value={gearSerial}
                        onChange={e => setGearSerial(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm font-mono border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: 2948759 (optionnel)"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Notes / Remarques</label>
                      <input
                        type="text"
                        value={gearNotes}
                        onChange={e => setGearNotes(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={gearType === 'eclairage' ? 'ex: Monture Bowens, bicolore 2700-6500K, batterie V-Mount...' : 'ex: Mise au point manuelle, cellule HS...'}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      {editingItem ? 'Enregistrer' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                        isDark ? 'bg-white/10 hover:bg-white/20 text-gray-300 border-transparent' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {gear.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl border ${isDark ? 'text-gray-500 bg-white/5 border-white/5' : 'text-gray-600 bg-white border-gray-200'}`}>
                  Aucun matériel enregistré dans votre inventaire.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* BOITIERS */}
                  <div className="space-y-3">
                    <h3 className={`font-bold text-lg border-b pb-2 ${isDark ? 'text-yellow-500 border-yellow-500/20' : 'text-yellow-600 border-yellow-200'}`}>📷 Boîtiers</h3>
                    <div className="space-y-3">
                      {gear.filter(g => g.type === 'camera').map(g => (
                        <div key={g._id} className={`border p-4 rounded-xl flex justify-between items-center transition ${
                          isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow'
                        }`}>
                          <div>
                            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{g.brand} {g.model}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Format: {g.format} {g.serialNumber && `| N°: ${g.serialNumber}`}</p>
                            {g.notes && <p className="text-xs text-gray-500 italic mt-1">"{g.notes}"</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditGear(g)} className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg">Modifier</button>
                            <button onClick={() => handleDeleteGear(g._id)} className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">Supprimer</button>
                          </div>
                        </div>
                      ))}
                      {gear.filter(g => g.type === 'camera').length === 0 && (
                        <p className="text-xs text-gray-500 italic">Aucun boîtier enregistré.</p>
                      )}
                    </div>
                  </div>

                  {/* OBJECTIFS */}
                  <div className="space-y-3">
                    <h3 className={`font-bold text-lg border-b pb-2 ${isDark ? 'text-yellow-500 border-yellow-500/20' : 'text-yellow-600 border-yellow-200'}`}>🔍 Objectifs</h3>
                    <div className="space-y-3">
                      {gear.filter(g => g.type === 'lens').map(g => (
                        <div key={g._id} className={`border p-4 rounded-xl flex justify-between items-center transition ${
                          isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow'
                        }`}>
                          <div>
                            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{g.brand} {g.model}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Format: {g.format} {g.serialNumber && `| N°: ${g.serialNumber}`}</p>
                            {g.notes && <p className="text-xs text-gray-500 italic mt-1">"{g.notes}"</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditGear(g)} className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg">Modifier</button>
                            <button onClick={() => handleDeleteGear(g._id)} className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">Supprimer</button>
                          </div>
                        </div>
                      ))}
                      {gear.filter(g => g.type === 'lens').length === 0 && (
                        <p className="text-xs text-gray-500 italic">Aucun objectif enregistré.</p>
                      )}
                    </div>
                  </div>

                  {/* ECLAIRAGES */}
                  <div className="space-y-3">
                    <h3 className={`font-bold text-lg border-b pb-2 ${isDark ? 'text-yellow-500 border-yellow-500/20' : 'text-yellow-600 border-yellow-200'}`}>💡 Éclairages</h3>
                    <div className="space-y-3">
                      {gear.filter(g => g.type === 'eclairage').map(g => (
                        <div key={g._id} className={`border p-4 rounded-xl flex justify-between items-center transition ${
                          isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{g.brand} {g.model}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                g.subType === 'flash'
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30'
                              }`}>
                                {g.subType === 'flash' ? '⚡ Flash' : '☀️ Lumière continue'}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {g.maxPowerWatts ? (
                                <span className="font-semibold text-yellow-600 dark:text-yellow-400 font-mono">⚡ {g.maxPowerWatts} W</span>
                              ) : (
                                <span className="italic">Puissance non précisée</span>
                              )}
                              {g.serialNumber && ` | N°: ${g.serialNumber}`}
                            </p>
                            {g.notes && <p className="text-xs text-gray-500 italic mt-1">"{g.notes}"</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditGear(g)} className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg">Modifier</button>
                            <button onClick={() => handleDeleteGear(g._id)} className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">Supprimer</button>
                          </div>
                        </div>
                      ))}
                      {gear.filter(g => g.type === 'eclairage').length === 0 && (
                        <p className="text-xs text-gray-500 italic">Aucun éclairage enregistré.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: FILMS */}
          {/* ========================================================================= */}
          {activeTab === 'films' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mes Pellicules (Rouleaux & Châssis)</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    value={searchFilmQuery}
                    onChange={e => setSearchFilmQuery(e.target.value)}
                    className={`rounded-xl px-3 py-1.5 text-sm w-full sm:w-64 border transition ${
                      isDark
                        ? 'bg-white/10 border-white/10 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm'
                    }`}
                    placeholder="Rechercher par nom / marque..."
                  />
                  {!showAddFilm && (
                    <button
                      onClick={() => { resetForm(); setShowAddFilm(true); }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-yellow-950/20 whitespace-nowrap"
                    >
                      + Enregistrer une Pellicule (Rouleau/Châssis)
                    </button>
                  )}
                </div>
              </div>

              {showAddFilm && (
                <form onSubmit={handleSaveFilm} className={`border rounded-2xl p-6 space-y-4 max-w-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {editingItem ? 'Modifier le rouleau' : 'Enregistrer un nouveau rouleau de pellicule'}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Nom / Identifiant unique du rouleau *</label>
                      <input
                        type="text"
                        value={filmName}
                        onChange={e => setFilmName(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: Tri-X #01, HP5 Écosse, Châssis 4x5 #A..."
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Marque / Fabricant *</label>
                      <select
                        value={['Kodak', 'Fomapan', 'Ilford', 'AgfaPan'].includes(filmBrand) ? filmBrand : (filmBrand ? 'Autre' : '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'Autre') {
                            setFilmBrand('');
                          } else {
                            setFilmBrand(val);
                          }
                        }}
                        className={`w-full rounded-lg p-2 text-sm mb-2 border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      >
                        <option value="">Sélectionner une marque</option>
                        <option value="Kodak">Kodak</option>
                        <option value="Fomapan">Fomapan</option>
                        <option value="Ilford">Ilford</option>
                        <option value="AgfaPan">AgfaPan</option>
                        <option value="Autre">Autre (Saisir manuellement)</option>
                      </select>
                      {!['Kodak', 'Fomapan', 'Ilford', 'AgfaPan'].includes(filmBrand) && (
                        <input
                          type="text"
                          value={filmBrand}
                          onChange={e => setFilmBrand(e.target.value)}
                          className={`w-full rounded-lg p-2 text-sm border ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Saisir la marque personnalisée..."
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Type de film (Émulsion) *</label>
                      <select
                        value={['Fomapan 100', 'Fomapan 200', 'Fomapan 400', 'AgfaPan 100', 'Kodak X 320', 'FP4', 'HP5', 'Tri X400'].includes(filmType) ? filmType : (filmType ? 'Autre' : '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'Autre') {
                            setFilmType('');
                          } else {
                            setFilmType(val);
                          }
                        }}
                        className={`w-full rounded-lg p-2 text-sm mb-2 border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      >
                        <option value="">Sélectionner une émulsion</option>
                        <option value="Fomapan 100">Fomapan 100</option>
                        <option value="Fomapan 200">Fomapan 200</option>
                        <option value="Fomapan 400">Fomapan 400</option>
                        <option value="AgfaPan 100">AgfaPan 100</option>
                        <option value="Kodak X 320">Kodak X 320</option>
                        <option value="FP4">FP4</option>
                        <option value="HP5">HP5</option>
                        <option value="Tri X400">Tri X400</option>
                        <option value="Autre">Autre (Saisir manuellement)</option>
                      </select>
                      {!['Fomapan 100', 'Fomapan 200', 'Fomapan 400', 'AgfaPan 100', 'Kodak X 320', 'FP4', 'HP5', 'Tri X400'].includes(filmType) && (
                        <input
                          type="text"
                          value={filmType}
                          onChange={e => setFilmType(e.target.value)}
                          className={`w-full rounded-lg p-2 text-sm border ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Saisir l'émulsion personnalisée..."
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Sensibilité nominale (ISO) *</label>
                      <input
                        type="number"
                        value={filmIso}
                        onChange={e => setFilmIso(parseInt(e.target.value) || 0)}
                        className={`w-full rounded-lg p-2 text-sm mb-2 border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Sensibilité utilisée (ISO)</label>
                      <input
                        type="number"
                        value={filmIsoUsed}
                        onChange={e => setFilmIsoUsed(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: 800 (optionnel)"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Format *</label>
                      <select
                        value={['135', '6X6', '9x12', '4X5', '13x18'].includes(filmFormat) ? filmFormat : (filmFormat ? 'Autre' : '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'Autre') {
                            setFilmFormat('');
                          } else {
                            setFilmFormat(val as any);
                          }
                        }}
                        className={`w-full rounded-lg p-2 text-sm mb-2 border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      >
                        <option value="">Sélectionner un format</option>
                        <option value="135">135 (35mm)</option>
                        <option value="6X6">6X6</option>
                        <option value="9x12">9x12</option>
                        <option value="4X5">4X5</option>
                        <option value="13x18">13x18</option>
                        <option value="Autre">Autre (Saisir manuellement)</option>
                      </select>
                      {!['135', '6X6', '9x12', '4X5', '13x18'].includes(filmFormat) && (
                        <input
                          type="text"
                          value={filmFormat}
                          onChange={e => setFilmFormat(e.target.value as any)}
                          className={`w-full rounded-lg p-2 text-sm border ${
                            isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Saisir le format personnalisé..."
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Nombre de vues (max) *</label>
                      <input
                        type="number"
                        value={filmMaxViews}
                        onChange={e => setFilmMaxViews(parseInt(e.target.value) || 36)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Type de couleur *</label>
                      <select
                        value={filmTypeColor}
                        onChange={e => setFilmTypeColor(e.target.value as any)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="BW">Noir & Blanc</option>
                        <option value="color">Couleur Négatif</option>
                        <option value="slide">Diapositive</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Boîtier photo utilisé *</label>
                      <select
                        value={filmGearCameraId}
                        onChange={e => setFilmGearCameraId(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      >
                        <option value="">Sélectionner l'appareil utilisé</option>
                        {gear
                          .filter(g => g.type === 'camera')
                          .map(g => (
                            <option key={g._id} value={g._id}>
                              {g.brand} {g.model} ({g.format})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Objectif photo utilisé par défaut</label>
                      <select
                        value={filmGearLensId}
                        onChange={e => setFilmGearLensId(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Sélectionner l'objectif par défaut</option>
                        {gear
                          .filter(g => g.type === 'lens')
                          .map(g => (
                            <option key={g._id} value={g._id}>
                              {g.brand} {g.model} ({g.format})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* SECTION PARAMETRES DE PRISE DE VUE PAR DEFAUT */}
                    <div className={`sm:col-span-2 border-t pt-4 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-500">📸 Paramètres de Prise de vue (Par défaut)</h4>
                      <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ces réglages s'appliqueront par défaut aux photos de ce rouleau/film.</p>
                      
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="col-span-2 sm:col-span-1">
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Vitesse</label>
                          <select
                            value={filmDefaultSpeed}
                            onChange={e => setFilmDefaultSpeed(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Sélectionner</option>
                            {['B', '8s', '4s', '2s', '1s', '1/2s', '1/4s', '1/8s', '1/15s', '1/30s', '1/50s', '1/60s', '1/125s', '1/250s', '1/400s', '1/500s'].map(val => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Diaphragme</label>
                          <select
                            value={filmDefaultAperture}
                            onChange={e => setFilmDefaultAperture(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Sélectionner</option>
                            {['f/1,4', 'f/1,7', 'f/1,8', 'f/2,8', 'f/3,5', 'f/4', 'f/5,6', 'f/6,3', 'f/8', 'f/11', 'f/16', 'f/22', 'f/32', 'f/45', 'f/64'].map(val => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Filtre</label>
                          <select
                            value={filmDefaultFilter}
                            onChange={e => setFilmDefaultFilter(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="Aucun">Aucun</option>
                            <option value="Rouge">Rouge</option>
                            <option value="Bleu">Bleu</option>
                            <option value="Vert">Vert</option>
                            <option value="Jaune">Jaune</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Filtre ND</label>
                          <select
                            value={filmDefaultNdFilter}
                            onChange={e => setFilmDefaultNdFilter(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="Aucun">Aucun</option>
                            <option value="1">ND1 (1 stop)</option>
                            <option value="2">ND2 (2 stops)</option>
                            <option value="4">ND4 (4 stops)</option>
                            <option value="8">ND8 (8 stops)</option>
                            <option value="16">ND16 (16 stops)</option>
                            <option value="100">ND100 (100 stops)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5 pt-4">
                          <input
                            type="checkbox"
                            id="lens-hood"
                            checked={filmDefaultLensHood}
                            onChange={e => setFilmDefaultLensHood(e.target.checked)}
                            className="w-3.5 h-3.5 text-yellow-500 rounded bg-transparent border-white/20 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="lens-hood" className={`text-[10px] font-semibold select-none cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Parasoleil
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* SECTION CHIMIE DU ROULEAU */}
                    <div className={`sm:col-span-2 border-t pt-4 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-500">🧪 Chimie de développement (Par défaut)</h4>
                      <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ces réglages s'appliqueront à l'ensemble du rouleau (ou serviront de base pour le plan-film).</p>
                      
                      <h5 className="text-[11px] font-bold text-yellow-600">Révélateur</h5>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nom du Révélateur</label>
                          <select
                            value={['Kodak D76', 'Ilford ID11', 'Ilford Microphen', 'Fomapan'].includes(devDeveloper) ? devDeveloper : (devDeveloper ? 'Autre' : '')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'Autre') {
                                setDevDeveloper('');
                              } else {
                                setDevDeveloper(val);
                              }
                            }}
                            className={`w-full rounded-lg p-2 text-xs mb-2 border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Sélectionner</option>
                            <option value="Kodak D76">Kodak D76</option>
                            <option value="Ilford ID11">Ilford ID11</option>
                            <option value="Ilford Microphen">Ilford Microphen</option>
                            <option value="Fomapan">Fomapan</option>
                            <option value="Autre">Autre (Saisir manuellement)</option>
                          </select>
                          {!['Kodak D76', 'Ilford ID11', 'Ilford Microphen', 'Fomapan'].includes(devDeveloper) && (
                            <input
                              type="text"
                              value={devDeveloper}
                              onChange={e => setDevDeveloper(e.target.value)}
                              placeholder="Révélateur personnalisé..."
                              className={`w-full rounded-lg p-2 text-xs border ${
                                isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dilution</label>
                          <select
                            value={devDilution}
                            onChange={e => setDevDilution(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Sélectionner</option>
                            <option value="stock">stock</option>
                            <option value="1+1">1+1</option>
                            <option value="1+3">1+3</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Temps de dev</label>
                          <div className="flex gap-1 items-center">
                            <select
                              value={devTimeMin}
                              onChange={e => setDevTimeMin(Number(e.target.value))}
                              className={`rounded-lg p-2 text-xs w-1/2 border ${
                                isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {Array.from({ length: 61 }, (_, i) => i).map(m => (
                                <option key={m} value={m}>{m} min</option>
                              ))}
                            </select>
                            <select
                              value={devTimeSec}
                              onChange={e => setDevTimeSec(Number(e.target.value))}
                              className={`rounded-lg p-2 text-xs w-1/2 border ${
                                isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {Array.from({ length: 60 }, (_, i) => i).map(s => (
                                <option key={s} value={s}>{s} sec</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Température</label>
                          <select
                            value={devTemperature}
                            onChange={e => setDevTemperature(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Sélectionner</option>
                            {Array.from({ length: 18 }, (_, i) => 20 + i).map(t => (
                              <option key={t} value={`${t}°C`}>{t}°C</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Agitation</label>
                          <input
                            type="text"
                            value={devAgitation}
                            onChange={e => setDevAgitation(e.target.value)}
                            placeholder="ex: 10s/min"
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pousse/Retenu</label>
                          <input
                            type="text"
                            value={devPushPull}
                            onChange={e => setDevPushPull(e.target.value)}
                            placeholder="ex: N+1, -1 stop"
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>

                      {/* SECTION FIXATEUR DU ROULEAU */}
                      <h5 className="text-[11px] font-bold text-yellow-600 pt-2">Fixateur</h5>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nom du Fixateur</label>
                          <select
                            value={devFixerBrand}
                            onChange={e => setDevFixerBrand(e.target.value)}
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="">Sélectionner</option>
                            <option value="Autre">Autre</option>
                            <option value="Ilford Rapid Fixer">Ilford Rapid Fixer</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dilution Fixateur</label>
                          <input
                            type="text"
                            value={devFixerDilution}
                            onChange={e => setDevFixerDilution(e.target.value)}
                            placeholder="ex: 1+4"
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Temps de Fixation</label>
                          <input
                            type="text"
                            value={devFixerTime}
                            onChange={e => setDevFixerTime(e.target.value)}
                            placeholder="ex: 5mn"
                            className={`w-full rounded-lg p-2 text-xs border ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Notes / Infos complémentaires</label>
                      <input
                        type="text"
                        value={filmNotes}
                        onChange={e => setFilmNotes(e.target.value)}
                        className={`w-full rounded-lg p-2 text-sm border ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="ex: Exposé à 320 ISO, développement à façon..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      {editingItem ? 'Enregistrer' : 'Enregistrer le rouleau'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                        isDark ? 'bg-white/10 hover:bg-white/20 text-gray-300 border-transparent' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {(() => {
                const filteredFilms = films.filter(f =>
                  (f.name || '').toLowerCase().includes(searchFilmQuery.toLowerCase()) ||
                  (f.brand || '').toLowerCase().includes(searchFilmQuery.toLowerCase()) ||
                  (f.filmType || '').toLowerCase().includes(searchFilmQuery.toLowerCase())
                );
                return films.length === 0 ? (
                  <div className={`text-center py-12 rounded-2xl border ${isDark ? 'text-gray-500 bg-white/5 border-white/5' : 'text-gray-600 bg-white border-gray-200'}`}>
                    Aucune pellicule (rouleau/châssis) enregistrée.
                  </div>
                ) : filteredFilms.length === 0 ? (
                  <div className={`text-center py-12 rounded-2xl border ${isDark ? 'text-gray-500 bg-white/5 border-white/5' : 'text-gray-600 bg-white border-gray-200'}`}>
                    Aucune pellicule ne correspond à votre recherche.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFilms.map(f => (
                      <div
                        key={f._id}
                        className={`border rounded-xl p-5 flex flex-col justify-between transition ${
                          isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.name}</h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {f.brand} {f.filmType} (ISO {f.iso})
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              f.format?.toLowerCase().includes('4x5') || f.format?.toLowerCase().includes('9x12') || f.format === 'plan-film'
                                ? 'bg-purple-600/30 text-purple-700 dark:text-purple-300'
                                : f.format === '120'
                                ? 'bg-blue-600/30 text-blue-700 dark:text-blue-300'
                                : 'bg-green-600/30 text-green-700 dark:text-green-300'
                            }`}
                          >
                            {f.format === '135' ? '35mm' : f.format}
                          </span>
                        </div>

                        <div className={`text-xs mt-2 space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <p>
                            Capacité : <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.maxViews} vues</span>
                          </p>
                          {f.gearCameraId && (
                            <p>
                              Boîtier :{' '}
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {f.gearCameraId.brand} {f.gearCameraId.model}
                              </span>
                            </p>
                          )}
                          {f.gearLensId && (
                            <p>
                              Objectif :{' '}
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {f.gearLensId.brand} {f.gearLensId.model}
                              </span>
                            </p>
                          )}
                          {f.defaultExposureSettings && (f.defaultExposureSettings.shutterSpeed || f.defaultExposureSettings.aperture || (f.defaultExposureSettings.filter && f.defaultExposureSettings.filter !== 'Aucun') || (f.defaultExposureSettings.ndFilter && f.defaultExposureSettings.ndFilter !== 'Aucun') || f.defaultExposureSettings.lensHood) && (
                            <p>
                              Prise de vue :{' '}
                              <span className={`font-medium font-mono text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {f.defaultExposureSettings.shutterSpeed && `${f.defaultExposureSettings.shutterSpeed} `}
                                {f.defaultExposureSettings.aperture && `@ ${f.defaultExposureSettings.aperture} `}
                                {f.defaultExposureSettings.filter && f.defaultExposureSettings.filter !== 'Aucun' && `[Filtre: ${f.defaultExposureSettings.filter}] `}
                                {f.defaultExposureSettings.ndFilter && f.defaultExposureSettings.ndFilter !== 'Aucun' && `[ND: ${f.defaultExposureSettings.ndFilter}] `}
                                {f.defaultExposureSettings.lensHood && `[Parasoleil]`}
                              </span>
                            </p>
                          )}
                          {f.developmentSettings?.developer && (
                            <p>
                              Chimie :{' '}
                              <span className="text-yellow-600 dark:text-yellow-500 font-mono font-medium">
                                {f.developmentSettings.developer} ({f.developmentSettings.dilution})
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`flex flex-col gap-2 pt-4 border-t mt-4 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                        <button
                          onClick={() => setSelectedFilmRoll(f)}
                          className="w-full text-center text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-600 py-1.5 rounded-lg transition"
                        >
                          👁️ Voir la Planche-Contact
                        </button>
                         <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFilm(f)}
                            className="flex-1 text-center text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 py-1.5 rounded-lg transition"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDuplicateFilm(f)}
                            className="flex-1 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 py-1.5 rounded-lg transition"
                          >
                            Dupliquer
                          </button>
                          <button
                            onClick={() => handleDeleteFilm(f._id)}
                            className="flex-1 text-center text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 py-1.5 rounded-lg transition"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={handleSavePhoto}
        />
      )}
      {shareItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className={`border rounded-2xl shadow-2xl max-w-md w-full p-6 relative ${
            isDark ? 'bg-gray-900 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <button
              onClick={() => setShareItem(null)}
              className={`absolute top-4 right-4 text-2xl ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
            >
              &times;
            </button>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Partager le {shareItem.type === 'project' ? 'projet' : 'média'}</h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{shareItem.title}</p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lien de la page</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareItem.url}
                    className={`flex-1 rounded-lg p-2 text-xs select-all focus:outline-none border ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareItem.url);
                      alert('Lien copié dans le presse-papiers !');
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {shareItem.type === 'project' ? "Code d'intégration Iframe" : "Code d'intégration Image HTML"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      shareItem.type === 'project'
                        ? `<iframe src="${shareItem.embedUrl || shareItem.url}" width="100%" height="600" frameborder="0"></iframe>`
                        : `<img src="${shareItem.url}" alt="${shareItem.title}" />`
                    }
                    className={`flex-1 rounded-lg p-2 text-xs select-all focus:outline-none border ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                  <button
                    onClick={() => {
                      const embedCode = shareItem.type === 'project'
                        ? `<iframe src="${shareItem.embedUrl || shareItem.url}" width="100%" height="600" frameborder="0"></iframe>`
                        : `<img src="${shareItem.url}" alt="${shareItem.title}" />`;
                      navigator.clipboard.writeText(embedCode);
                      alert("Code d'intégration copié !");
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarnetRoutesManager;
