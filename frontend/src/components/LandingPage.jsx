import React from 'react';
import { motion } from 'framer-motion';
import { ListChecks, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

const slideIn = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeInOut', delay: 0.3 } },
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
};

// Feature Data
const features = [
  {
    title: 'Proactive Violation Detection',
    description: 'Identify potential issues like copyright infringement, inappropriate content, and policy violations before publishing.',
    icon: AlertTriangle,
  },
  {
    title: 'Detailed Reporting',
    description: 'Get clear, time-stamped reports with specific details about where violations occur in your video.',
    icon: ListChecks,
  },
  {
    title: 'Actionable Recommendations',
    description: 'Receive guidance on how to fix violations, such as editing suggestions or content modifications.',
    icon: Zap,
  },
  {
    title: 'Built for YouTube Creators',
    description: 'Currently supports only YouTube. More platforms coming soon.',
    icon: CheckCircle,
  },
];

// Feature Card Component
const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;
  return (
    <motion.div variants={featureVariants} className="bg-white/5 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10 space-y-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
      <p className="text-gray-400">{feature.description}</p>
    </motion.div>
  );
};

// Main LandingPage Component
const LandingPage = () => {
  const navigate = useNavigate();
  const handleClick = () =>{
    navigate('/login');
  }
  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white min-h-screen w-full">
      {/* Hero Section */}
      <header className="mx-auto px-4 py-20 flex flex-wrap items-center justify-between gap-12 min-h-screen w-full max-w-full">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 max-w-xl space-y-6"
        >
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Blip
            </span>
          </h2>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Upload With Confidence: Scan for YouTube Issues First
          </h1>
          <p className="text-xl text-gray-300">
            Blip scans your videos before upload—helping YouTubers stay compliant, monetize smoothly, and avoid takedowns.
          </p>
          <button
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full px-8 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg" onClick={handleClick}
          >
            Get Started
          </button>
        </motion.div>
        
        <motion.div
          variants={slideIn}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 max-w-xl"
        >
          <div className="w-full aspect-video bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
            <div className="flex items-center justify-center h-full text-gray-400">
              [Video/Image Placeholder]
            </div>
          </div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="mx-auto px-4 py-20 w-full max-w-full">
        <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-white/5 backdrop-blur-md py-20 w-full max-w-full">
        <div className="mx-auto px-4 text-center max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-white">What Creators Say</h2>
          <div className="p-8 rounded-xl shadow-lg border border-white/10 max-w-2xl mx-auto">
            <p className="text-lg italic text-gray-300">
              "Blip has been a game-changer for my workflow. I can now upload with confidence, knowing my videos are compliant. It has saved me so much time and stress!"
            </p>
            <p className="mt-4 font-semibold text-white">- Some Creator, YouTube</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <footer className="mx-auto px-4 py-20 text-center w-full max-w-full">
        <h2 className="text-4xl font-bold mb-8 text-white">Ready to Get Started?</h2>
        <button
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full px-8 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-xl" onClick={handleClick}
        >
          Start Your Free Trial
        </button>
        <p className="mt-4 text-gray-400">No credit card required.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
