import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVideos } from '../api/video';

const Home = () => {
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserVideos();
  }, []);

  const loadUserVideos = async () => {
    try {
      const videos = await getVideos();
      setUserVideos(videos || []);
    } catch (error) {
      console.error('Error loading user videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (video) => {
    if (video.isFinal) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">⭐ Finale</span>;
    }
    if (video.isValidated) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">✓ Validée</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">⏳ En attente</span>;
  };

  const getAIFeedbackStatus = (video) => {
    if (video.aiFeedbackRequested && video.aiFeedbackReceived) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">🤖 Évaluée</span>;
    }
    if (video.aiFeedbackRequested) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">⏳ IA en cours</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Non demandée</span>;
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Bienvenue sur Video Studio</h1>
        <p className="page-subtitle">
          Créez, uploadez et améliorez vos présentations vidéo avec l'aide de l'IA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📹 Studio Video</h3>
            <p className="card-subtitle">Créez vos présentations</p>
          </div>
          <p className="mb-4">
            Enregistrez vos présentations vidéo dans un environnement professionnel 
            avec des outils d'édition intégrés.
          </p>
          <Link to="/record" className="btn btn-primary">
            Commencer
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🤖 Feedback AI</h3>
            <p className="card-subtitle">Analyse intelligente</p>
          </div>
          <p className="mb-4">
            Recevez des retours détaillés sur votre présentation grâce à 
            notre intelligence artificielle avancée.
          </p>
          <Link to="/my-videos" className="btn btn-secondary">
            Gérer mes vidéos
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📤 Upload</h3>
            <p className="card-subtitle">Importez vos vidéos</p>
          </div>
          <p className="mb-4">
            Uploadez des vidéos existantes depuis votre ordinateur 
            pour les analyser et les améliorer.
          </p>
          <Link to="/upload" className="btn btn-accent">
            Uploader
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Statistiques</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userVideos.length}</div>
              <div className="text-sm text-gray-500">Vidéos créées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {userVideos.filter(v => v.aiFeedbackRequested).length}
              </div>
              <div className="text-sm text-gray-500">Analyses demandées</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💡 Conseils du jour</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Assurez-vous d'avoir un bon éclairage pour vos vidéos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Parlez clairement et à un rythme modéré</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Maintenez un contact visuel avec la caméra</span>
            </li>
          </ul>
        </div>
      </div>

      {/* User's Videos Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📹 Mes Vidéos ({userVideos.length}/3)</h3>
          <p className="card-subtitle">Vos présentations vidéo</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="loading-spinner"></div>
            <p className="ml-3">Chargement de vos vidéos...</p>
          </div>
        ) : userVideos.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Aucune vidéo enregistrée</h3>
            <p className="text-gray-600 mb-4">
              Commencez par enregistrer votre première vidéo de présentation.
            </p>
            <Link to="/record" className="btn btn-primary">
              🎬 Enregistrer ma première vidéo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVideos.map((video) => (
              <div key={video.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Video Thumbnail */}
                <div className="relative mb-3">
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(video)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="mb-3">
                  <h4 className="font-semibold text-sm mb-2 truncate">
                    {video.title || 'Vidéo sans titre'}
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Durée:</span>
                      <span>{video.duration || '--:--'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(video.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IA:</span>
                      <span>{getAIFeedbackStatus(video)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Link 
                    to="/my-videos" 
                    className="btn btn-secondary btn-sm flex-1 text-center"
                  >
                    Gérer
                  </Link>
                  {video.aiFeedbackRequested && video.aiFeedbackReceived && (
                    <Link 
                      to={`/feedback?video=${video.id}`}
                      className="btn btn-primary btn-sm flex-1 text-center"
                    >
                      Voir IA
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Access to My Videos */}
        {userVideos.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/my-videos" className="btn btn-secondary">
              📹 Gérer toutes mes vidéos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 