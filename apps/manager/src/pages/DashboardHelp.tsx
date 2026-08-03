import React, { useState, useEffect } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import remarkGfm from 'remark-gfm';

const DashboardHelp: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // On va chercher le fichier markdown dans le dossier public
    fetch('/help.md')
      .then(res => {
        if (!res.ok) throw new Error('Fichier non trouvé');
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent("# Erreur\nImpossible de charger l'aide.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-white">Chargement...</div>;

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
       <div className="relative z-10 min-h-screen pb-20">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 py-8">
            {/* Vidéo de Présentation LuminaView */}
            <div className="mb-8 p-6 rounded-2xl bg-gray-950/80 border border-amber-500/30 shadow-xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                    🎬 Tutoriel & Présentation Visuelle
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Visite guidée et démonstration de l'écosystème</p>
                </div>
                <a
                  href="https://notebook.google.com/notebook/b823149d-c4a5-4329-a5b2-04101e042278/artifact/80bc6584-a33b-40ba-a507-171afdcabefa?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  🔗 Google NotebookLM ↗
                </a>
              </div>
              <div className="rounded-xl overflow-hidden bg-black border border-white/10 aspect-video max-w-3xl mx-auto shadow-inner">
                <video
                  controls
                  className="w-full h-full object-contain"
                  poster="/uploads/luminaview.png"
                >
                  <source src="/uploads/presentation.mp4" type="video/mp4" />
                  <source src="/uploads/LuminaView_photographes.mp4" type="video/mp4" />
                  <source src="/uploads/presentation.webm" type="video/webm" />
                  Votre navigateur ne prend pas en charge la lecture vidéo HTML5.
                </video>
              </div>
            </div>

            <article className="prose prose-invert prose-yellow max-w-none">
              <MarkdownRenderer>{content}</MarkdownRenderer>
            </article>
          </div>
       </div>
    </div>
  );
};

export default DashboardHelp;
