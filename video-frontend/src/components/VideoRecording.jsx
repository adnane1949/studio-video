import React, { useState, useRef, useEffect } from 'react';
import { generalInstructions, industryInstructions } from '../data/instructionsData';
import { useNavigate } from 'react-router-dom';

const VideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [userIndustry, setUserIndustry] = useState('Technology'); // Default, will be fetched from user profile
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const navigate = useNavigate();

  // Get user industry from localStorage or context
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.industry) {
      setUserIndustry(user.industry);
    }
  }, []);

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: true
      });
      
      setMediaStream(stream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra et au microphone');
      console.error('Camera access error:', err);
    }
  };

  // Start countdown
  const startCountdown = () => {
    setShowCountdown(true);
    setCountdown(10);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowCountdown(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = () => {
    if (!mediaStream) return;

    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]); // Reset chunks at start
    console.log('Starting recording...');

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('Data available:', event.data.size, 'bytes');
        setRecordedChunks(prev => {
          const newChunks = [...prev, event.data];
          console.log('Total chunks:', newChunks.length);
          return newChunks;
        });
      }
    };

    mediaRecorder.onstop = () => {
      setRecordedChunks(currentChunks => {
        console.log('Final chunks count:', currentChunks.length);
        if (currentChunks.length > 0) {
          const blob = new Blob(currentChunks, { type: 'video/webm' });
          console.log('Recording completed:', blob.size, 'bytes');
        }
        return currentChunks; // Keep the chunks for validation
      });
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Clear any existing interval first
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    // Timer for recording - Fixed to increment every 1 second
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        console.log('Timer tick:', prev + 1);
        if (prev >= 300) { // 5 minutes max
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Restart recording
  const restartRecording = () => {
    console.log('Restarting recording...');
    stopRecording();
    setRecordingTime(0);
    setRecordedChunks([]);
    // Start new recording immediately
    setTimeout(() => {
      startCountdown();
    }, 500);
  };

  // Nouvelle fonction pour valider pendant l'enregistrement
  const stopAndValidate = async () => {
    stopRecording();
    setTimeout(() => {
      validateRecording();
    }, 500); // Laisse le temps à onstop de finir
  };

  // Validate and save recording
  const validateRecording = async () => {
    // Limite à 3 vidéos
    let userId = null;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      userId = user && user.id ? user.id : null;
      const { getVideos } = await import('../api/video');
      const videos = await getVideos(userId);
      if (Array.isArray(videos) && videos.length >= 3) {
        alert('Vous avez déjà 3 vidéos. Supprimez-en une pour en ajouter une nouvelle.');
        return;
      }
    } catch (e) {
      alert("Impossible de vérifier le nombre de vidéos existantes.");
      return;
    }
    // ✅ Vérification des chunks
    console.log('Validating recording, chunks count:', recordedChunks.length);
    // Check if we have recorded chunks
    if (recordedChunks.length > 0) {
      try {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log('Creating file from blob:', blob.size, 'bytes');
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        // Upload de la vidéo
        const { uploadVideo } = await import('../api/video');
        const result = await uploadVideo(file);
        console.log('Video uploaded successfully:', result);
        // Reset et message de succès
        setRecordedChunks([]);
        setRecordingTime(0);
        setIsRecording(false);
        alert('Vidéo enregistrée avec succès !');
        navigate('/my-videos');
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    } else {
      alert('Aucune vidéo à valider. Veuillez d\'abord enregistrer une vidéo.');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      clearInterval(countdownIntervalRef.current);
      clearInterval(recordingIntervalRef.current);
    };
  }, [mediaStream]);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
  }, []);

  return (
    <div className="main-content">
      <div className="page-header text-center">
        <h1 className="page-title">Enregistrer une vidéo</h1>
        <p className="page-subtitle">
          Préparez-vous et enregistrez votre présentation vidéo
        </p>
      </div>

      {/* Centered Recording Interface */}
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="card-header text-center">
            <h3 className="card-title">📹 Enregistrement Vidéo</h3>
            <p className="card-subtitle">Prévisualisation et contrôles</p>
          </div>

          <div className="relative">
            {/* Camera Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-80 lg:h-96 bg-gray-900 rounded-lg object-cover shadow-lg"
            />

            {/* Enhanced Countdown Overlay */}
            {showCountdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
                <div className="countdown-container">
                  <div className="countdown-number">
                    {countdown}
                  </div>
                  <div className="countdown-text">
                    Préparez-vous...
                  </div>
                </div>
              </div>
            )}

            {/* Recording Timer */}
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                ⏺️ {formatTime(recordingTime)}
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                🔴 Enregistrement en cours
              </div>
            )}
          </div>

          {/* Recording Controls - Centered */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {!isRecording && !showCountdown && (
              <button
                onClick={startCountdown}
                disabled={!hasPermission}
                className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🎬 Commencer l'enregistrement
              </button>
            )}
            {isRecording && (
              <>
                <button
                  onClick={restartRecording}
                  className="btn btn-secondary px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🔄 Recommencer
                </button>
                <button
                  onClick={stopRecording}
                  className="btn btn-warning px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ⏹️ Arrêter
                </button>
                <button
                  onClick={stopAndValidate}
                  className="btn btn-accent px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ✅ Valider
                </button>
              </>
            )}

            {/* Show validation button when recording is stopped and we have chunks */}
            {!isRecording && recordedChunks.length > 0 && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  📹 Vidéo enregistrée ({recordedChunks.length} segments)
                </div>
                <button
                  onClick={validateRecording}
                  className="btn btn-accent px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ✅ Valider et sauvegarder
                </button>
              </div>
            )}

            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Instructions - Below Recording Interface */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Instructions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💡 Conseils généraux</h3>
              <p className="card-subtitle">Conseils pour un bon enregistrement</p>
            </div>
            <div className="space-y-3">
              {generalInstructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 text-lg mt-1">•</span>
                  <span className="text-sm text-gray-700">{instruction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry-specific Instructions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🎯 Conseils pour {userIndustry}</h3>
              <p className="card-subtitle">Conseils spécifiques à votre secteur</p>
            </div>
            <div className="space-y-3">
              {industryInstructions[userIndustry]?.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-500 text-lg mt-1">•</span>
                  <span className="text-sm text-gray-700">{instruction}</span>
                </div>
              )) || (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                  Aucun conseil spécifique disponible pour cette industrie.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recording Tips */}
        <div className="mt-6 card">
          <div className="card-header">
            <h3 className="card-title">🎥 Pendant l'enregistrement</h3>
            <p className="card-subtitle">Informations importantes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">⏱️ Durée</h4>
              <p className="text-sm text-blue-700">Maximum 5 minutes</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">📹 Qualité</h4>
              <p className="text-sm text-green-700">Résolution minimale 480p</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🎤 Audio</h4>
              <p className="text-sm text-purple-700">Parlez clairement et naturellement</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default VideoRecording; 