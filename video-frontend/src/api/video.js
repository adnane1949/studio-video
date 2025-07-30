import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/';

// Get all videos for the user (optionally filtered by userId)
export const getVideos = async (userId) => {
  try {
    let url = `${API_BASE}videos/`;
    if (userId) {
      url += `?user_id=${userId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Upload a new video
export const uploadVideo = async (videoFile) => {
  try {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', videoFile.name);
    const response = await fetch(`${API_BASE}videos/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload video');
    }
    return await response.json();
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

// Request AI feedback for a video
export const requestAIFeedback = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE}videos/${videoId}/request_ai_feedback/`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to request AI feedback');
    }
    return await response.json();
  } catch (error) {
    console.error('Error requesting AI feedback:', error);
    throw error;
  }
};

// Mark a video as final
export const markVideoAsFinal = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE}videos/${videoId}/mark_final/`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to mark video as final');
    }
    return await response.json();
  } catch (error) {
    console.error('Error marking video as final:', error);
    throw error;
  }
};

// Delete a video
export const deleteVideo = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE}videos/${videoId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete video');
    }
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

// Validate a video
export const validateVideo = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE}videos/${videoId}/validate_video/`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to validate video');
    }
    return await response.json();
  } catch (error) {
    console.error('Error validating video:', error);
    throw error;
  }
};

// Set a video as official (legacy function for backward compatibility)
export const setOfficialVideo = async (videoId) => {
  return await markVideoAsFinal(videoId);
}; 