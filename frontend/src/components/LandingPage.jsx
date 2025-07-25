import React from 'react';
import { motion } from 'framer-motion';
import { ListChecks, AlertTriangle, CheckCircle, Zap, DollarSign, Clock, HardDrive, UploadCloud, ScanEye, FileText, Server } from 'lucide-react';

// Animation Variants - Enhanced for more subtle depth and flow
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.0, ease: 'easeOut', delay: 0.2 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.0, ease: 'easeOut', delay: 0.2 } },
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const planCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// Feature Data - Refined descriptions
const features = [
  {
    title: 'Proactive AI Detection',
    description: 'Leverage cutting-edge AI to identify nuanced policy violations, copyright concerns, and inappropriate content *before* your video ever goes public.',
    icon: AlertTriangle,
  },
  {
    title: 'Granular, Actionable Reports',
    description: 'Receive highly precise, time-stamped reports that pinpoint exact moments of concern, coupled with clear, actionable recommendations for swift resolution.',
    icon: ListChecks,
  },
  {
    title: 'Real-time Moderation Insights',
    description: 'Experience instant updates as your content undergoes analysis, providing you with continuous, live insights into its compliance status.',
    icon: Zap,
  },
  {
    title: 'Future-Proof Platform Agnostic',
    description: 'Engineered for all content creators. While currently optimized for YouTube, our robust core is designed for seamless expansion to diverse video platforms.',
    icon: CheckCircle,
  },
];

// Feature Card Component - Enhanced styling
const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={featureVariants}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      className="bg-white/5 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-white/10 space-y-5 transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-semibold text-white tracking-wide">{feature.title}</h3>
      <p className="text-gray-300 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
};

// Plan Card Component - Enhanced styling and value emphasis
const PlanCard = ({ title, description, features, buttonText, isPrimary, onActionClick }) => {
  const Icon = isPrimary ? DollarSign : CheckCircle;
  return (
    <motion.div
      variants={planCardVariants}
      whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
      className={`flex flex-col bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-2xl border ${isPrimary ? 'border-purple-500 ring-2 ring-purple-500' : 'border-white/10'} space-y-7 transform hover:scale-105 transition-all duration-300`}
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-700 to-blue-700 text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Icon className="w-9 h-9" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-md">{description}</p>
      </div>
      <ul className="flex-grow space-y-4 text-gray-300 text-lg">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onActionClick}
        className={`mt-auto w-full font-bold rounded-full px-10 py-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-xl tracking-wide ${
          isPrimary
            ? 'bg-gradient-to-r from-purple-700 to-blue-700 text-white transform hover:from-purple-600 hover:to-blue-600'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        {buttonText}
      </button>
    </motion.div>
  );
};

// Main LandingPage Component
const LandingPage = () => {
  // Placeholder for action when buttons are clicked.
  const handleButtonClick = () => {
    console.log('Button clicked! Parent component should handle navigation or purchase flow.');
    // Example: window.location.href = '/login'; or a prop callback
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white min-h-screen w-full font-inter overflow-hidden relative">
      {/* Subtle background particles/glows (conceptual, would need actual implementation) */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(121, 74, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(66, 153, 225, 0.1) 0%, transparent 50%)' }}></div>

      {/* Hero Section */}
      <header className="relative z-10 mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-16 min-h-screen w-full max-w-7xl">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 max-w-xl space-y-8 text-center md:text-left"
        >
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Blip
            </span>: Your AI Content Guardian
          </h2>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 leading-tight drop-shadow-lg">
            Upload With Confidence.<br /><span className="text-yellow-300">Get Your First 5 Hours FREE!</span>
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            Blip employs advanced AI to meticulously scan your video content for potential policy violations, copyright concerns, and inappropriate material *before* you publish—empowering creators to maintain compliance, ensure smooth monetization, and prevent costly takedowns.
          </p>
          <button
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full px-12 py-4 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 text-xl tracking-wide transform hover:from-purple-500 hover:to-blue-500"
            onClick={handleButtonClick}
          >
            Start Your 5 Free Hours Now
          </button>
          <p className="mt-6 text-gray-400 text-sm md:text-base">No credit card required. Experience the future of content moderation.</p>
        </motion.div>
        
        <motion.div
          variants={slideInRight}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 max-w-xl flex justify-center items-center relative"
        >
          {/* More engaging visual placeholder */}
          <div className="w-full h-auto aspect-video bg-white/5 backdrop-blur-lg rounded-3xl shadow-3xl border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl p-8 text-center">
              <div className="space-y-4">
                <Zap className="w-16 h-16 mx-auto text-yellow-400 animate-pulse" />
                <p>
                  [Dynamic Demo: AI Scanning Video Frames, Highlighting Violations, and Generating Real-time Reports]
                </p>
                <p className="text-sm text-gray-500">Imagine your content being analyzed in seconds.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* How It Works Section - More visual and impactful */}
      <section className="relative z-10 mx-auto px-6 py-24 w-full max-w-7xl text-center">
        <h2 className="text-4xl font-bold mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-md">
          The Blip Workflow: Simple, Fast, Secure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white flex items-center justify-center mx-auto text-4xl font-bold shadow-lg">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold text-white">1. Upload Your Content</h3>
            <p className="text-gray-300 leading-relaxed">Securely submit your video files to our robust, cloud-based platform for processing.</p>
          </motion.div>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6" transition={{ delay: 0.2 }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center mx-auto text-4xl font-bold shadow-lg">
              <ScanEye className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold text-white">2. AI Performs Deep Scan</h3>
            <p className="text-gray-300 leading-relaxed">Our advanced AI models rapidly analyze every frame, detecting subtle and overt guideline violations.</p>
          </motion.div>
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6" transition={{ delay: 0.4 }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white flex items-center justify-center mx-auto text-4xl font-bold shadow-lg">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold text-white">3. Instant, Actionable Reports</h3>
            <p className="text-gray-300 leading-relaxed">Receive real-time, detailed reports directly to your dashboard, empowering immediate action.</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Updated headline */}
      <section className="relative z-10 mx-auto px-6 py-24 w-full max-w-7xl">
        <h2 className="text-4xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-md">
          Why Blip is Your Essential Content Guardian
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      {/* Pricing & Plans Section - More compelling and visually distinct */}
      <section className="relative z-10 mx-auto px-6 py-24 w-full max-w-7xl text-center">
        <h2 className="text-4xl font-bold mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-md">
          Simple, Scalable, & Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <PlanCard
            title="Spark Plan"
            description="Perfect for new creators, personal projects, and initial exploration."
            features={[
              '5 Hours of Video Analysis per Month',
              'Real-time Moderation Dashboard',
              '7-Day Report History Access',
              'Standard Email Support',
            ]}
            buttonText="Start Your 5 Free Hours"
            isPrimary={false}
            onActionClick={handleButtonClick}
          />
          <PlanCard
            title="Blaze Plan"
            description="For growing creators and platforms: Purchase video analysis minutes as needed."
            features={[
              'Purchase Video Analysis Minutes (e.g., 100 min for $25, 500 min for $100)', // Updated feature
              'Unlimited Report History & Audit Trail',
              'Full API Access for Automation',
              'Priority Technical Support',
              'Multi-platform Integration (Coming Soon)',
            ]}
            buttonText="Buy Minutes" // Updated button text
            isPrimary={true}
            onActionClick={handleButtonClick}
          />
        </div>
        <p className="mt-16 text-gray-400 text-xl">
          For enterprise-level needs or custom integrations, please <a href="#" onClick={handleButtonClick} className="text-blue-400 hover:underline">contact our sales team</a>.
        </p>
      </section>

      {/* Testimonial Section - Enhanced visual appeal */}
      <section className="bg-white/5 backdrop-blur-md py-24 w-full relative z-10">
        <div className="mx-auto px-6 text-center max-w-7xl">
          <h2 className="text-4xl font-bold mb-16 text-white drop-shadow-md">What Creators Are Saying About Blip</h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="p-10 rounded-3xl shadow-2xl border border-white/10 max-w-3xl mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50 relative"
          >
            <Zap className="absolute top-4 left-4 w-10 h-10 text-purple-400 opacity-70" />
            <ListChecks className="absolute bottom-4 right-4 w-10 h-10 text-blue-400 opacity-70" />
            <p className="text-2xl italic text-gray-200 leading-relaxed">
              "Blip has fundamentally transformed my content workflow. I can now upload with absolute confidence, knowing my videos are compliant and my monetization is secure. It has saved me countless hours of stress and manual review!"
            </p>
            <p className="mt-8 text-xl font-semibold text-white">- Alex 'The Creator', Leading Gaming Channel</p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section - More impactful closing */}
      <footer className="relative z-10 mx-auto px-6 py-24 text-center w-full max-w-7xl">
        <h2 className="text-5xl font-bold mb-10 text-white drop-shadow-lg">
          Ready to Elevate Your Content Strategy?
        </h2>
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          Join the growing number of creators who trust Blip to safeguard their content and streamline their workflow.
        </p>
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full px-16 py-5 shadow-3xl hover:shadow-4xl hover:scale-105 transition-all duration-300 text-2xl tracking-wide transform hover:from-purple-500 hover:to-blue-500"
          onClick={handleButtonClick}
        >
          Claim Your 5 Free Hours Today!
        </button>
        <p className="mt-8 text-gray-400 text-base">No credit card required. Unlock smarter content moderation.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
