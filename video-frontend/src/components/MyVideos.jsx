import React, { useState, useEffect } from 'react';
import { getVideos, requestAIFeedback, markVideoAsFinal, deleteVideo } from '../api/video';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      loadVideos(user.id);
    }
  }, []);

  const loadVideos = async (userId) => {
    try {
      setLoading(true);
      const userVideos = await getVideos(userId);
      setVideos(userVideos || []);
    } catch (err) {
      setError('Erreur lors du chargement des vidéos');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAIFeedback = async (videoId) => {
    try {
      await requestAIFeedback(videoId);
      
      // Update local state
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId 
            ? { ...video, aiFeedbackRequested: true }
            : video
        )
      );
      
      alert('Demande d\'évaluation IA envoyée avec succès !');
    } catch (err) {
      alert('Erreur lors de la demande d\'évaluation IA');
      console.error('Error requesting AI feedback:', err);
    }
  };

  const handleMarkAsFinal = async (videoId) => {
    try {
      await markVideoAsFinal(videoId);
      
      // Update local state - unmark others as final
      setVideos(prevVideos => 
        prevVideos.map(video => ({
          ...video,
          isFinal: video.id === videoId
        }))
      );
      
      alert('Vidéo marquée comme finale !');
    } catch (err) {
      alert('Erreur lors du marquage de la vidéo');
      console.error('Error marking video as final:', err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      return;
    }

    try {
      await deleteVideo(videoId);
      
      // Remove from local state
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
      
      alert('Vidéo supprimée avec succès !');
    } catch (err) {
      alert('Erreur lors de la suppression de la vidéo');
      console.error('Error deleting video:', err);
    }
  };

  const getStatusBadge = (video) => {
    if (video.isFinal) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Finale</span>;
    }
    if (video.isValidated) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Validée</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">En attente</span>;
  };

  const getAIFeedbackStatus = (video) => {
    if (video.aiFeedbackRequested && video.aiFeedbackReceived) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✓ Évaluée</span>;
    }
    if (video.aiFeedbackRequested) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">⏳ En cours</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Non demandée</span>;
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
          <p className="ml-3">Chargement de vos vidéos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Mes Vidéos</h1>
        <p className="page-subtitle">
          Gérez vos vidéos enregistrées ({videos.length}/3 maximum)
        </p>
      </div>

      {error && (
        <div className="card mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Video Count Warning */}
      {videos.length >= 3 && (
        <div className="card mb-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 text-xl mr-2">⚠️</span>
              <div>
                <h4 className="font-medium text-yellow-800">Limite atteinte</h4>
                <p className="text-sm text-yellow-700">
                  Vous avez atteint la limite de 3 vidéos. Supprimez une vidéo existante pour en enregistrer une nouvelle.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Aucune vidéo enregistrée</h3>
            <p className="text-gray-600 mb-4">
              Commencez par enregistrer votre première vidéo de présentation.
            </p>
            <a href="/record" className="btn btn-primary">
              🎬 Enregistrer ma première vidéo
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card">
              {/* Video Thumbnail */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🎥</span>
                </div>
                <div className="absolute top-2 left-2">
                  {getStatusBadge(video)}
                </div>
                {video.isFinal && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                      ⭐ Finale
                    </span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{video.title || 'Vidéo sans titre'}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Durée:</span>
                    <span>{video.duration || '--:--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enregistrée le:</span>
                    <span>{new Date(video.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Évaluation IA:</span>
                    <span>{getAIFeedbackStatus(video)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* AI Feedback Request */}
                {!video.aiFeedbackRequested && (
                  <button
                    onClick={() => handleRequestAIFeedback(video.id)}
                    className="btn btn-primary w-full btn-sm"
                  >
                    🤖 Demander évaluation IA
                  </button>
                )}

                {/* Mark as Final */}
                {!video.isFinal && (
                  <button
                    onClick={() => handleMarkAsFinal(video.id)}
                    className="btn btn-accent w-full btn-sm"
                  >
                    ⭐ Marquer comme finale
                  </button>
                )}

                {/* View AI Feedback */}
                {video.aiFeedbackRequested && video.aiFeedbackReceived && (
                  <a
                    href={`/feedback?video=${video.id}`}
                    className="btn btn-secondary w-full btn-sm"
                  >
                    📊 Voir l'évaluation IA
                  </a>
                )}

                {/* Delete Video */}
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="btn btn-secondary w-full btn-sm text-red-600 hover:bg-red-50"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {videos.length < 3 && (
        <div className="card mt-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Enregistrer une nouvelle vidéo</h3>
            <p className="text-gray-600 mb-4">
              Vous pouvez encore enregistrer {3 - videos.length} vidéo{3 - videos.length > 1 ? 's' : ''}.
            </p>
            <a href="/record" className="btn btn-primary">
              🎬 Enregistrer une vidéo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVideos; 