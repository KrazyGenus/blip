import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  File,
  UploadCloud,
  AlertTriangle,
  CheckCircle,
  Youtube,
  Sparkles,
  Camera,
  Zap,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const cn = (...args) => args.filter(Boolean).join(' ');

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const clearFile = () => {
    setFile(null);
    resetFileInput();
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);
  };

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (uploadStatus === 'success' || uploadStatus === 'error') {
      alertTimeoutRef.current = setTimeout(() => {
        setUploadStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
    return () => clearTimeout(alertTimeoutRef.current);
  }, [uploadStatus]);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
      setUploadProgress(0);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setUploadStatus('idle');
      setErrorMessage('');
      setUploadProgress(0);
    } else {
      setUploadStatus('error');
      setErrorMessage('Please drop a valid video file.');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setUploadStatus('idle');
      setErrorMessage('');
      setUploadProgress(0);

      if (!file) {
        setUploadStatus('error');
        setErrorMessage('Please select or drop a video file to upload.');
        setIsSubmitting(false);
        return;
      }

      try {
        // Fake upload with progress simulation
        await new Promise((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 150);
        });

        // Simulate random success or failure
        if (Math.random() < 0.85) {
          setUploadStatus('success');
          clearFile();
        } else {
          throw new Error('Content check failed. Please try a different video.');
        }
      } catch (err) {
        setUploadStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred during upload.');
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [file]
  );

  // Format file size helper
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center p-4 sm:p-8">
      <motion.div
        className="w-full max-w-xl sm:max-w-3xl bg-white/5 backdrop-blur-md rounded-2xl shadow-3xl border border-white/10 p-6 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        role="main"
        aria-labelledby="upload-title"
      >
        <h1
          id="upload-title"
          className="text-2xl sm:text-3xl font-bold text-center text-white flex items-center justify-center select-none"
        >
          <Youtube className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-red-500" aria-hidden="true" />
          YouTube Content Check
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 ml-2 text-yellow-400 animate-pulse" aria-hidden="true" />
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-live="polite"
          aria-relevant="additions removals"
        >
          <fieldset
            className={cn(
              'relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-colors duration-300 focus-within:border-purple-500',
              dragOver ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-black/20'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            aria-describedby="file-instructions"
          >
            <legend className="sr-only">Upload Video File</legend>
            <p
              id="file-instructions"
              className="text-gray-300 text-center text-sm sm:text-base mb-2 select-none"
            >
              Drag & drop a video file here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-400 underline hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 rounded"
              >
                browse your files
              </button>
            </p>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="video/*"
              disabled={isSubmitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-hidden="true"
              tabIndex={-1}
            />

            {!file && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 select-none pointer-events-none">
                <UploadCloud className="w-12 h-12 mb-4" />
                <span className="text-lg font-semibold">Drop your video here</span>
                <small className="mt-1 text-xs sm:text-sm text-gray-400">
                  Supported formats: mp4, mov, avi, mkv, etc.
                </small>
              </div>
            )}

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-black/50 rounded-xl p-4 text-white select-text"
              >
                <div className="flex items-center gap-3 max-w-xs sm:max-w-md overflow-hidden">
                  <File className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
                  <div className="flex flex-col truncate">
                    <span className="font-semibold truncate" title={file.name}>
                      {file.name}
                    </span>
                    <small className="text-gray-400">{formatSize(file.size)}</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={isSubmitting}
                  aria-label="Clear selected file"
                  className="text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 rounded"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </fieldset>

          {uploadProgress > 0 && (
            <div
              className="w-full h-2 rounded-full bg-gray-700 overflow-hidden"
              aria-hidden="true"
              title={`Upload progress: ${uploadProgress}%`}
            >
              <motion.div
                className="h-2 bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          )}

          <button
            type="submit"
            className={cn(
              'w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full transition-transform duration-300 shadow-xl flex items-center justify-center gap-2.5 text-lg',
              isSubmitting
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:from-purple-600 hover:to-blue-600 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50'
            )}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <UploadCloud className="w-6 h-6 animate-spin" aria-hidden="true" />
                Checking for Violations...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" aria-hidden="true" />
                Scan Video Now
              </>
            )}
          </button>

          <AnimatePresence>
            {uploadStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-green-500/20 border border-green-500/40 text-green-400 p-4 rounded-xl flex items-center gap-3 select-none"
                role="alert"
              >
                <CheckCircle className="w-6 h-6" aria-hidden="true" />
                <span className="text-lg font-medium">Your YouTube content is compliant!</span>
              </motion.div>
            )}
            {uploadStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-red-500/20 border border-red-500/40 text-red-400 p-4 rounded-xl flex items-center gap-3 select-none"
                role="alert"
              >
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                <span className="text-lg font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadPage;
