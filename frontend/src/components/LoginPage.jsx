import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react'; // Icons

const cn = (...args) => args.filter(Boolean).join(' ');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InputField = ({
  id,
  type,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}) => (
  <motion.div variants={itemVariants} className="w-full">
    <label htmlFor={id} className="block text-lg font-semibold text-cyan-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 w-5 h-5" />
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full pl-10 pr-4 py-3 rounded-xl bg-[#0f172a] text-cyan-100 border',
          error ? 'border-red-500' : 'border-cyan-600',
          'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder:text-cyan-400'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1 text-sm text-red-400 font-medium">
        {error}
      </p>
    )}
  </motion.div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const validate = () => {
    let valid = true;
    if (!email) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validate()) {
        setStatus({ state: 'error', message: 'Please fix the errors above.' });
        return;
      }

      setIsSubmitting(true);
      setStatus({ state: 'idle', message: '' });

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const success = Math.random() > 0.5;

        if (success) {
          setStatus({ state: 'success', message: 'Login successful! Redirecting...' });
          setEmail('');
          setPassword('');
          setEmailError('');
          setPasswordError('');
        } else {
          throw new Error('Invalid email or password. Please try again.');
        }
      } catch (error) {
        setStatus({ state: 'error', message: error.message || 'An unexpected error occurred during login.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password]
  );

  return (
    <div className="bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f172a] flex items-center justify-center min-h-screen p-4">
      <motion.div
        className="w-full max-w-md px-8 bg-[#12192f]/80 backdrop-blur-md rounded-3xl shadow-2xl border border-cyan-700 p-8 space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h1 className="text-4xl font-extrabold text-center text-cyan-400 flex items-center justify-center gap-3 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-9 h-9 text-purple-500 animate-pulse"
          >
            <path d="M11.8 2.6c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z"></path>
            <path d="M12 15v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <InputField
            id="email"
            type="email"
            label="Email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isSubmitting}
            error={emailError}
          />

          <InputField
            id="password"
            type="password"
            label="Password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isSubmitting}
            error={passwordError}
          />

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              className={cn(
                'w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-full',
                'transition-all duration-300 shadow-xl hover:shadow-2xl text-lg',
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105',
                'flex items-center justify-center gap-3'
              )}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
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
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </motion.div>
        </form>

        <AnimatePresence>
          {status.state !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                'p-4 rounded-xl flex items-center gap-3 text-lg font-medium',
                status.state === 'success'
                  ? 'bg-green-600/20 text-green-400 border border-green-500/40'
                  : 'bg-red-600/20 text-red-400 border border-red-500/40'
              )}
              aria-live="polite"
              role="alert"
            >
              {status.state === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="text-center text-cyan-400 text-md">
          Don't have an account?{' '}
          <a href="#" className="text-purple-400 font-semibold hover:underline hover:text-purple-500">
            Sign up
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
