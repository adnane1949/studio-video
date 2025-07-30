import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Upload from './components/Upload';
import Feedback from './components/Feedback';
import VideoRecording from './components/VideoRecording';
import MyVideos from './components/MyVideos';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/record" element={<VideoRecording />} />
          <Route path="/my-videos" element={<MyVideos />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;