import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for status message
import { UserPlus, CheckCircle, AlertTriangle } from 'lucide-react'; // Icons

const cn = (...classes) => classes.filter(Boolean).join(' ');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setStatus('error');
      setMessage('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Invalid email address.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const success = Math.random() < 0.8; // Simulate success/failure

      if (success) {
        setStatus('success');
        setMessage('Account created successfully! Please check your email to verify.');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="
        w-full px-6 // w-full on small screens, px-6 for internal padding
        sm:max-w-md // Max-width 448px from sm breakpoint up
        lg:max-w-lg // Max-width 512px from lg breakpoint up (optional, adjust to preference)
        bg-white/5 backdrop-blur-md rounded-2xl shadow-3xl border border-white/10
        p-8 space-y-6 // Unified padding for the form content, consistent with login page
        mx-auto // Centers the div when max-width applies
      "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center gap-2 mb-4"> {/* Adjusted text size for consistency */}
        <UserPlus className="w-8 h-8 text-blue-400 animate-pulse" /> {/* Adjusted icon size */}
        Sign Up
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { label: 'Name', id: 'name', type: 'text', value: name, setValue: setName, autoComplete: 'name', placeholder: 'Enter your name' },
          { label: 'Email', id: 'email', type: 'email', value: email, setValue: setEmail, autoComplete: 'email', placeholder: 'Enter your email' },
          { label: 'Password', id: 'password', type: 'password', value: password, setValue: setPassword, autoComplete: 'new-password', placeholder: 'Enter your password' },
        ].map(({ label, id, type, value, setValue, autoComplete, placeholder }) => (
          <motion.div key={id} variants={itemVariants}>
            <label htmlFor={id} className="block text-lg font-semibold text-gray-300 mb-2"> {/* Used direct <label> */}
              {label}
            </label>
            <input
              type={type}
              id={id}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              disabled={isSubmitting} // Disable input fields during submission
              className="
                w-full pl-4 pr-4 py-3 rounded-xl bg-black/20 text-white border border-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                placeholder:text-gray-400 transition text-lg // Unified input text size
              "
              autoComplete={autoComplete}
            />
          </motion.div>
        ))}
        <motion.div variants={itemVariants}>
          <button // Used direct <button>
            type="submit"
            className={cn(
              'w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full',
              'transition-all duration-300 shadow-xl hover:shadow-2xl text-lg', // Unified button text size
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105',
              'flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50' // Consistent gap and focus styles
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white" // Unified spinner size
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </motion.div>
      </form>

      <AnimatePresence> {/* Wrap status message with AnimatePresence */}
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }} // Added exit animation
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'p-4 rounded-xl flex items-center gap-3 text-lg font-medium', // Unified text size
              status === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
            aria-live="polite" // Added for accessibility
            role="alert" // Added for accessibility
          >
            {status === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="text-center text-gray-400 text-md"> {/* Unified text size */}
        Already have an account?{' '}
        <a href="#" className="text-blue-400 font-semibold hover:underline">
          Log in
        </a>
      </motion.div>
    </motion.div>
  );
};

const SignUpPage = () => (
  <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center min-h-screen p-4">
    <SignupForm />
  </div>
);

export default SignUpPage;