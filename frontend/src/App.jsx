import { useState } from 'react';
import axios from 'axios';

function App() {
  const [video, setVideo] = useState([]);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setVideo([...event.target.files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setVideo(file);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragover');
  };

  const handleUpload = async () => {
    if (!video) return alert("Please choose or drag a video.");
    setError(null);

    const formData = new FormData();
    video.forEach(file => {
      formData.append('video', file);
    })
    

    try {
      const res = await axios.post(
        '/api/upload', // ← Now using relative path
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          },
        }
      );

      console.log('Upload response:', res.data);

      if (res.data.file && res.data.file.path) {
        setPreview(res.data.file.path); // Assume backend serves correct relative path
      } else {
        setError('Video URL not found in response');
      }

      setProgress(0);
    } catch (err) {
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
      console.error('Upload error details:', err);
      setProgress(0);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>🎬 Drag-and-Drop Video Upload</h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px dashed green' : '2px dashed #999',
          padding: '2rem',
          marginBottom: '1rem',
          textAlign: 'center',
          borderRadius: '10px',
          backgroundColor: dragActive ? '#f0fff0' : '#f9f9f9',
        }}
      >
        <p>Drag & Drop your video file here</p>
        <p>or</p>
        <input type="file" accept="video/*" multiple onChange={handleChange}/>
      </div>

      {video && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Selected file:</strong> {video.name}
        </div>
      )}

      <button 
        onClick={handleUpload} 
        style={{ 
          padding: '0.5rem 1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        disabled={!video || progress > 0}
      >
        {progress > 0 ? 'Uploading...' : 'Upload'}
      </button>

      {progress > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <progress value={progress} max="100" style={{ width: '100%' }} />
          <div>{progress}%</div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#ffebee', 
          color: '#d32f2f',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;