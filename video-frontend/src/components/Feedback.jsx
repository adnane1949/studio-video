import React, { useState } from 'react';

const Feedback = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisData, setAnalysisData] = useState({
    confidence: 85,
    clarity: 78,
    engagement: 92,
    pace: 80,
    eyeContact: 88,
    posture: 75
  });

  const mockVideos = [
    { id: 1, name: 'Présentation Marketing Q1', date: '2024-01-15', duration: '5:32' },
    { id: 2, name: 'Entretien Technique', date: '2024-01-10', duration: '8:45' },
    { id: 3, name: 'Pitch Startup', date: '2024-01-05', duration: '3:20' }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Bon';
    if (score >= 70) return 'Moyen';
    return 'À améliorer';
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Feedback IA</h1>
        <p className="page-subtitle">
          Analysez vos présentations avec l'intelligence artificielle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Score Global</h3>
            <p className="card-subtitle">Performance générale</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">83</div>
            <div className="text-lg font-medium text-gray-700 mb-2">Bon</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full progress-bar" style={{ width: '83%' }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Engagement</h3>
            <p className="card-subtitle">Capacité à captiver</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysisData.engagement)}`}>
              {analysisData.engagement}
            </div>
            <div className="text-lg font-medium text-gray-700">{getScoreLabel(analysisData.engagement)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🗣️ Clarté</h3>
            <p className="card-subtitle">Qualité de l'expression</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysisData.clarity)}`}>
              {analysisData.clarity}
            </div>
            <div className="text-lg font-medium text-gray-700">{getScoreLabel(analysisData.clarity)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Métriques détaillées</h3>
            <p className="card-subtitle">Analyse par critère</p>
          </div>

          <div className="space-y-4">
            {Object.entries(analysisData).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {key === 'confidence' && '🎯'}
                    {key === 'clarity' && '🗣️'}
                    {key === 'engagement' && '🔥'}
                    {key === 'pace' && '⏱️'}
                    {key === 'eyeContact' && '👁️'}
                    {key === 'posture' && '🧍'}
                  </div>
                  <div>
                    <div className="font-medium capitalize">
                      {key === 'confidence' && 'Confiance'}
                      {key === 'clarity' && 'Clarté'}
                      {key === 'engagement' && 'Engagement'}
                      {key === 'pace' && 'Rythme'}
                      {key === 'eyeContact' && 'Contact visuel'}
                      {key === 'posture' && 'Posture'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-bold ${getScoreColor(value)}`}>{value}</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full progress-bar ${
                        value >= 90 ? 'progress-green' :
                        value >= 80 ? 'progress-blue' :
                        value >= 70 ? 'progress-yellow' : 'progress-red'
                      }`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💡 Recommandations</h3>
            <p className="card-subtitle">Améliorations suggérées</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✅</span>
                <div>
                  <h4 className="font-medium text-green-800">Points forts</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Excellent niveau d'engagement et bon contact visuel
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-800">À améliorer</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Travaillez sur votre posture et ralentissez légèrement le rythme
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">💡</span>
                <div>
                  <h4 className="font-medium text-blue-800">Conseils</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Maintenez une posture droite et ouverte</li>
                    <li>• Faites des pauses entre vos phrases</li>
                    <li>• Utilisez des gestes pour renforcer vos propos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">📹 Vidéos récentes</h3>
          <p className="card-subtitle">Sélectionnez une vidéo pour analyse</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockVideos.map((video) => (
            <div 
              key={video.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedVideo?.id === video.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{video.name}</h4>
                <span className="text-sm text-gray-500">{video.duration}</span>
              </div>
              <p className="text-sm text-gray-600">{video.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback; 