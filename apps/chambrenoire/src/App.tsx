//
// CHAMBRE NOIRE — App.tsx
// Point d'entrée du routing frontend
// version v2.4.1
//

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// ── Pages publiques ─────────────────────────────────────────
import AlbumView from './pages/AlbumView';
import EmbedAlbumView from './pages/EmbedAlbumView';
import CarnetDeRoutesPage from './pages/CarnetDeRoutesPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

// ============================================================
// ROUTES APP PRINCIPALE
// Avec Layout global Hélioscope
// ============================================================

const MainRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Chambre Noire */}
        <Route path="/" element={<CarnetDeRoutesPage />} />
        <Route path="/project/:slug" element={<ProjectDetailPage />} />
        <Route path="/album/:id" element={<AlbumView />} />
        <Route path="/embed/album/:id" element={<EmbedAlbumView />} />
        <Route path="/embed/carnet-de-routes" element={<CarnetDeRoutesPage />} />
        <Route path="/embed/project/:slug" element={<ProjectDetailPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};



// ============================================================
// RACINE
// ============================================================

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainRoutes />
    </BrowserRouter>
  );
};

export default App;
