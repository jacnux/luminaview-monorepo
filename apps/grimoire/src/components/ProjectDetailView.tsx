import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { Lightbox, CommentModal, ReportModal } from '@luminaview/ui';
import { Album, Photo } from '../types';

interface ProjectDetailViewProps {
  album: Album;
  photos: Photo[];
  onBack: () => void;
}

const getPhotoUrl = (photo: any): string => {
  if (!photo) return '';
  const path = photo.url || photo.filename || photo.filepath || photo.path;
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/uploads/')) {
    return path;
  }
  return `/uploads/${path}`;
};

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ album, photos, onBack }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Gestion des modales de commentaires et de signalement
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const albumPhotos = photos.length > 0 ? photos : album.photos || [];

  const handleCommentSubmit = async (authorName: string, authorEmail: string, message: string) => {
    if (lightboxIndex === null || !albumPhotos[lightboxIndex]) return;
    const photo = albumPhotos[lightboxIndex];
    try {
      setSubmittingComment(true);
      setCommentSuccess(null);
      setCommentError(null);
      await axios.post(`/api/comments/${photo._id}`, {
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        message: message.trim(),
      });
      setCommentSuccess("Votre commentaire a été envoyé avec succès au photographe !");
      setTimeout(() => {
        setShowCommentModal(false);
        setCommentSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("Erreur envoi commentaire:", err);
      setCommentError(err.response?.data?.error || "Impossible d'envoyer le commentaire pour le moment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReportSubmit = async (reason: string) => {
    try {
      setSubmittingReport(true);
      setReportSuccess(null);
      setReportError(null);
      await axios.post('/api/reports', {
        type: 'album',
        targetId: album._id,
        reason: reason.trim(),
      });
      setReportSuccess("Le signalement a été transmis avec succès à l'administrateur.");
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("Erreur envoi signalement:", err);
      setReportError(err.response?.data?.error || "Impossible d'envoyer le signalement pour le moment.");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <motion.div
      className="grimoire-project-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button className="grimoire-back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Retour aux galeries</span>
      </button>

      <div className="grimoire-project-header">
        <h1>{album.title}</h1>
        {album.subtitle && (
          <h2 style={{ fontSize: '1.15rem', fontWeight: 300, color: 'var(--text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {album.subtitle}
          </h2>
        )}
        {album.description && (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{album.description}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* GRILLE D'EXPOSITION (MASONRY/GRID PHOTO STREAM) */}
      {albumPhotos.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
          Aucune photographie n'a été ajoutée à cet album pour le moment.
        </div>
      ) : (
        <div className="grimoire-gallery-grid">
          {albumPhotos.map((photo: any, index: number) => {
            const imageUrl = getPhotoUrl(photo);
            if (!imageUrl) return null;

            return (
              <motion.div
                key={photo._id || index}
                className="grimoire-gallery-item"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
                onClick={() => setLightboxIndex(index)}
              >
                <div className="grimoire-gallery-image-wrapper">
                  <img
                    src={imageUrl}
                    alt={photo.title || photo.caption || album.title}
                    className="grimoire-gallery-img"
                    loading="lazy"
                  />
                  <div className="grimoire-gallery-overlay">
                    <Maximize2 size={20} className="grimoire-gallery-icon" />
                    <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Agrandir
                    </span>
                  </div>
                </div>

                {(photo.title || photo.caption) && (
                  <div className="grimoire-gallery-caption">
                    {photo.title && <strong style={{ color: '#ffffff', display: 'block' }}>{photo.title}</strong>}
                    {photo.caption}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VISIONNEUSE INTERACTIVE LIGHTBOX */}
      <AnimatePresence>
        {lightboxIndex !== null && albumPhotos.length > 0 && (
          <Lightbox
            photos={albumPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onComment={(idx) => {
              setLightboxIndex(idx);
              setShowCommentModal(true);
            }}
            onReport={(idx) => {
              setLightboxIndex(idx);
              setShowReportModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODALE DE COMMENTAIRE */}
      {showCommentModal && lightboxIndex !== null && albumPhotos[lightboxIndex] && (
        <CommentModal
          photo={albumPhotos[lightboxIndex]}
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleCommentSubmit}
          submitting={submittingComment}
          success={commentSuccess}
          error={commentError}
        />
      )}

      {/* MODALE DE SIGNALEMENT DRAPEAU ROUGE */}
      {showReportModal && lightboxIndex !== null && albumPhotos[lightboxIndex] && (
        <ReportModal
          photo={albumPhotos[lightboxIndex]}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          submitting={submittingReport}
          success={reportSuccess}
          error={reportError}
        />
      )}
    </motion.div>
  );
};

export default ProjectDetailView;
