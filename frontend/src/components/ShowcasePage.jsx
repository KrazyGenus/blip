// full updated code

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ViolationDetailPage from './ViolationDetailPage';

import {
  ListChecks,
  LogOut,
  UploadCloud,
  Video,
  Users,
  MessageCircle,
  GripVertical,
  X,
} from 'lucide-react';

const dummyUserVideos = [
  {
    id: '1',
    title: 'My Awesome YouTube Vlog',
    status: 'compliant',
    uploadDate: '2024-07-28',
    thumbnail: 'https://placehold.co/400x200/EEE/31343C?text=YouTube+Video+1',
  },
  {
    id: '2',
    title: 'React Tutorial for YouTube',
    status: 'violations',
    uploadDate: '2024-07-27',
    thumbnail: 'https://placehold.co/400x200/EEE/31343C?text=YouTube+Video+2',
    violations: [
      { type: 'Copyright (Music)', time: '0:15' },
      { type: 'Inappropriate Language', time: '2:30' },
    ],
  },
  {
    id: '3',
    title: 'Gaming Highlights (YouTube)',
    status: 'pending',
    uploadDate: '2024-07-26',
    thumbnail: 'https://placehold.co/400x200/EEE/31343C?text=YouTube+Video+3',
  },
  {
    id: '4',
    title: 'Cooking Recipe (YouTube Short)',
    status: 'compliant',
    uploadDate: '2024-07-25',
    thumbnail: 'https://placehold.co/400x200/EEE/31343C?text=YouTube+Video+4',
  },
  {
    id: '5',
    title: 'Travel Vlog (YouTube)',
    status: 'violations',
    uploadDate: '2024-07-24',
    thumbnail: 'https://placehold.co/400x200/EEE/31343C?text=YouTube+Video+5',
    violations: [{ type: 'Copyright (Video)', time: '5:40' }],
  },
  {
    id: '6',
    title: 'Tech Review (YouTube)',
    status: 'pending',
    uploadDate: '2024-07-23',
    thumbnail: 'https://placehold.co/400x200/EEE/31343C?text=YouTube+Video+6',
  },
];

const sidebarVariants = {
  open: { width: 240, transition: { type: 'spring', damping: 20, stiffness: 200 } },
  closed: { width: 64, transition: { type: 'spring', damping: 20, stiffness: 200 } },
};

const contentVariants = {
  open: { marginLeft: 240, transition: { duration: 0.3, ease: 'easeInOut' } },
  closed: { marginLeft: 64, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const menuItemVariants = {
  open: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.1 } },
  closed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const SidebarItem = ({ icon, label, isOpen }) => (
  <li className="p-4 hover:bg-gray-800 transition-colors flex items-center gap-4 cursor-pointer group">
    {icon}
    <AnimatePresence>
      {isOpen && (
        <motion.span
          variants={menuItemVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="text-md font-medium whitespace-nowrap group-hover:text-white"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </li>
);

const Sidebar = ({ isOpen, toggleSidebar }) => (
  <motion.div
    variants={sidebarVariants}
    initial="closed"
    animate={isOpen ? 'open' : 'closed'}
    className="bg-gray-900 text-white h-screen fixed top-0 left-0 border-r border-gray-800 z-50 overflow-hidden flex flex-col"
  >
    <div className="p-4 flex items-center justify-between border-b border-gray-800">
      <AnimatePresence>
        {isOpen && (
          <motion.h1
            variants={menuItemVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="text-xl font-bold whitespace-nowrap"
          >
            Blip Dashboard
          </motion.h1>
        )}
      </AnimatePresence>
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
        aria-label="Toggle sidebar"
      >
        <GripVertical className="w-5 h-5" />
      </button>
    </div>

    <nav className="flex-grow">
      <ul className="space-y-2">
        <SidebarItem icon={<UploadCloud className="w-5 h-5 text-blue-400" />} label="Upload YouTube Video" isOpen={isOpen} />
        <SidebarItem icon={<Video className="w-5 h-5 text-purple-400" />} label="My YouTube Videos" isOpen={isOpen} />
        <SidebarItem icon={<ListChecks className="w-5 h-5 text-green-400" />} label="Compliance History" isOpen={isOpen} />
        <SidebarItem icon={<Users className="w-5 h-5 text-yellow-400" />} label="Community" isOpen={isOpen} />
        <SidebarItem icon={<MessageCircle className="w-5 h-5 text-pink-400" />} label="Support" isOpen={isOpen} />
      </ul>
    </nav>

    <div className="p-4 border-t border-gray-800 hover:bg-gray-800 flex items-center gap-4 cursor-pointer">
      <LogOut className="w-5 h-5" />
      <AnimatePresence>
        {isOpen && (
          <motion.span
            variants={menuItemVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="text-md font-medium"
          >
            Logout
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const VideoCard = ({ video, onViewDetails }) => {
  const statusClasses = {
    compliant: 'text-green-400',
    violations: 'text-red-400',
    pending: 'text-yellow-400',
  };

  const statusText = {
    compliant: 'Compliant',
    violations: 'Violations Detected',
    pending: 'Checking...',
  };

  return (
    <div className="bg-white/5 rounded-xl shadow-lg border border-white/10 overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all">
      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
      <div className="p-4 space-y-2">
        <h2 className="text-xl font-semibold text-white">{video.title}</h2>
        <p className="text-gray-400">Uploaded: {video.uploadDate}</p>
        <p className={`font-medium ${statusClasses[video.status]}`}>{statusText[video.status]}</p>

        {video.status === 'violations' && video.violations && (
          <div className="mt-2 space-y-1">
            <h4 className="text-red-400 font-semibold">Violations:</h4>
            <ul className="list-disc list-inside space-y-0.5 text-gray-300">
              {video.violations.map((violation, idx) => (
                <li key={idx}>
                  {violation.type} at {violation.time}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="w-full py-2 px-4 mt-2 rounded-lg text-white border border-gray-700 hover:bg-white/10 focus:ring-2 focus:ring-blue-500"
          onClick={() => onViewDetails(video)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const VideoModal = ({ video, onClose }) => {
  const statusColors = {
    compliant: 'bg-green-500 text-white',
    violations: 'bg-red-500 text-white',
    pending: 'bg-yellow-500 text-black',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-gray-800 text-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        <img src={video.thumbnail} alt={video.title} className="rounded-lg mb-4 w-full h-48 object-cover" />
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{video.title}</h2>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[video.status]}`}>
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-300 mb-3">Uploaded: {video.uploadDate}</p>

        {video.violations && (
          <>
            <h4 className="text-red-400 font-semibold mb-1">Violations:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {video.violations.map((violation, idx) => (
                <li key={idx}>
                  {violation.type} at {violation.time}
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const ShowcasePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <motion.main
        className="flex-1 p-6 ml-16 sm:ml-64"
        animate={isSidebarOpen ? 'open' : 'closed'}
        variants={contentVariants}
      >
        <h1 className="text-3xl font-bold text-white mb-6">My YouTube Videos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyUserVideos.map((video) => (
            <VideoCard key={video.id} video={video} onViewDetails={setSelectedVideo} />
          ))}
        </div>
      </motion.main>

      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowcasePage;
