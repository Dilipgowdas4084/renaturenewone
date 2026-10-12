import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { storeTokens } from '../utils/auth';
import {
  ArrowLeft, Leaf, Lock, Mail, ArrowRight, KeyRound,
  CheckCircle2, Hash, RefreshCw, ShieldCheck, Eye, EyeOff
} from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/renature_nmamit/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/renature-nmamit/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C21.5 8.59 22 11 22 14.06V21h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.62-2.39 3.28V21h-4V9Z" />
      </svg>
    ),
  },
];

const loginSchema = yup.object().shape({
  collegeEmail: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Flow States: null | 'request' | 'verify' | 'reset'
  const [forgotStep, setForgotStep] = useState(null);

  // Recovery data state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryUsn, setRecoveryUsn] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isDispatched, setIsDispatched] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend cooldown timer
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // Standard Login Submit
  const onLoginSubmit = async (data) => {
    setApiError('');
    setApiSuccess('');
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', data);
      storeTokens({ token: res.data.token, refreshToken: res.data.refreshToken });

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Google credential response handler
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setApiError('Google sign-in was cancelled or failed.');
      return;
    }
    setApiError('');
    setApiSuccess('');
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/google', {
        credential: response.credential,
      });
      storeTokens({ token: res.data.token, refreshToken: res.data.refreshToken });

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      const data = error.response?.data;
      if (data?.code === 'ACCOUNT_LINKING_REQUIRED') {
        setApiError(data.error || 'An account with this email already exists. Please log in with your password to link your Google account.');
      } else if (data?.code === 'DOMAIN_NOT_ALLOWED') {
        setApiError(data.error || 'Only official @nmamit.in Google accounts are permitted.');
      } else if (data?.code === 'EMAIL_NOT_VERIFIED') {
        setApiError('Your Google account email has not been verified by Google.');
      } else {
        setApiError(data?.error || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Identity Services when on the standard login screen
  useEffect(() => {
    if (forgotStep !== null) return;
    if (!googleClientId) return;

    let checkInterval = null;
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btnEl = document.getElementById('googleSignInBtn');
          if (btnEl) {
            btnEl.innerHTML = '';
            window.google.accounts.id.renderButton(btnEl, {
              theme: 'filled_black',
              size: 'large',
              shape: 'pill',
              width: 340,
              text: 'signin_with',
            });
          }
        } catch (err) {
          console.error('Failed to initialize Google Sign-In:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGsi();
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [forgotStep, googleClientId]);

  // STEP 1: Send OTP to Gmail
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    setResetToken('');
    setIsDispatched(false);

    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      setApiError('Please enter a valid Gmail or college email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/send-otp', {
        collegeEmail: recoveryEmail,
        usn: recoveryUsn,
      });

      const confirmed = Boolean(res.data?.dispatched);
      setIsDispatched(confirmed);
      setApiSuccess(res.data?.message || 'If an account with that email exists, a verification code may have been sent. Please check your inbox and spam folder.');

      if (confirmed) {
        setForgotStep('verify');
        setCountdown(60);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Something went wrong. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Confirm OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setApiError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        collegeEmail: recoveryEmail,
        otp: cleanOtp,
      });

      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }

      setApiSuccess(res.data?.message || 'Code verified successfully! Please set your new password.');
      setForgotStep('reset');
    } catch (error) {
      console.error('Verify OTP error:', error);
      setApiError(error.response?.data?.error || 'Invalid or expired verification code. Please check your Gmail.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!newPassword || newPassword.length < 8) {
      setApiError('New password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setApiError('Password must contain an uppercase letter, a lowercase letter, and a number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setApiError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        collegeEmail: recoveryEmail,
        resetToken: resetToken,
        newPassword: newPassword,
      });

      setApiSuccess(res.data?.message || 'Password reset successful! You can now log in.');
      setValue('collegeEmail', recoveryEmail);

      // Reset state and switch back to login
      setTimeout(() => {
        setForgotStep(null);
        setNewPassword('');
        setConfirmPassword('');
        setEnteredOtp('');
        setResetToken('');
        setIsDispatched(false);
      }, 1800);
    } catch (error) {
      console.error('Reset password error:', error);
      setApiError(error.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-cover bg-center p-3 sm:p-6 md:p-8 relative selection:bg-emerald-500/20 selection:text-emerald-300"
      style={{
        backgroundImage: "url('/IMG_9183.jpeg')",
      }}
    >
      {/* Dark forest overlay */}
      <div className="absolute inset-0 bg-[#040d0a]/88 backdrop-blur-sm" />

      {/* Top Header Bar with Home Navigation */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between mb-4 px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-all bg-[#091a14]/90 hover:bg-[#091a14] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-semibold uppercase tracking-wider min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Return Home</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">NMAMIT Portal</span>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 backdrop-blur-2xl">

        {/* Left panel — branding */}
        <div className="hidden md:flex flex-1 flex-col justify-between p-10 lg:p-12 bg-gradient-to-br from-[#0b221a]/95 via-[#061510]/95 to-[#040d0a]/95 border-r border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
              <Leaf className="w-3.5 h-3.5" />
              Member Access Portal
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              {forgotStep ? (
                <>
                  Gmail OTP <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Verification</span>
                </>
              ) : (
                <>
                  Welcome <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Back</span>
                </>
              )}
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed max-w-sm">
              {forgotStep === 'request' && 'Enter your registered Gmail to receive a one-time 6-digit security code.'}
              {forgotStep === 'verify' && (
                isDispatched
                  ? 'Check your Gmail inbox and enter the 6-digit OTP code to verify your identity.'
                  : 'If your account is registered, check your inbox and spam folder for the 6-digit code.'
              )}
              {forgotStep === 'reset' && 'Identity confirmed! Create a new secure password to access your renature steward account.'}
              {!forgotStep && 'Sign in to manage your campus drives, track earned Eco-Points, and view verified volunteer certifications.'}
            </p>
          </div>

          <div className="pt-8 border-t border-white/[0.06]">
            <p className="text-xs text-stone-400 font-medium mb-3">Community Hub</p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-stone-400 hover:text-emerald-300 hover:border-emerald-500/30 transition-all min-h-[44px] min-w-[44px]"
                  title={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full md:w-[440px] bg-[#071712]/95 backdrop-blur-2xl p-6 sm:p-8 md:p-12 flex flex-col justify-center">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              {!forgotStep && 'Sign In'}
              {forgotStep === 'request' && 'Reset Password'}
              {forgotStep === 'verify' && 'Confirm OTP Code'}
              {forgotStep === 'reset' && 'Set New Password'}
            </h2>
            <p className="text-xs text-stone-400">
              {!forgotStep && 'Enter your credentials to access the platform.'}
              {forgotStep === 'request' && 'We will send a 6-digit verification code to your Gmail.'}
              {forgotStep === 'verify' && (
                isDispatched
                  ? `Verification code dispatched to ${recoveryEmail}. Please check your inbox and spam folder.`
                  : `If an account with that email exists, a verification code may have been sent. Please check your inbox and spam folder.`
              )}
              {forgotStep === 'reset' && 'Choose a fresh secure password for your steward account.'}
            </p>
          </div>

          {/* Feedback messages */}
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <p className="text-rose-300 text-xs text-center font-medium">{apiError}</p>
            </div>
          )}

          {apiSuccess && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-xs text-center font-medium">{apiSuccess}</p>
            </div>
          )}

          {/* ─── STAGE 1: REQUEST OTP ─── */}
          {forgotStep === 'request' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                  Registered Gmail / College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="student@nmamit.in or your.gmail@gmail.com"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                  USN / Student ID <span className="text-stone-500 font-normal lowercase">(optional verification)</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={recoveryUsn}
                    onChange={(e) => setRecoveryUsn(e.target.value)}
                    placeholder="4NM23CS001"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <span>Sending OTP code...</span>
                ) : (
                  <>
                    <span>Send OTP to Gmail</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotStep(null);
                  setApiError('');
                  setApiSuccess('');
                  setResetToken('');
                  setIsDispatched(false);
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white text-xs font-semibold transition-all mt-1"
              >
                Return to Sign In
              </button>
            </form>
          )}

          {/* ─── STAGE 2: CONFIRM OTP ─── */}
          {forgotStep === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full bg-[#040d0a] border border-emerald-500/40 rounded-xl py-3 pl-10 pr-4 text-base tracking-[0.4em] font-mono text-center text-emerald-300 font-bold placeholder-stone-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  {isDispatched ? (
                    <>Check your inbox / spam folder for the email from <strong>renature NMAMIT</strong>.</>
                  ) : (
                    <>If an account exists, check your inbox / spam folder for the email from <strong>renature NMAMIT</strong>.</>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Verifying code...</span>
                ) : (
                  <>
                    <span>Confirm & Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={handleSendOtp}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold disabled:text-stone-500 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend code in ${countdown}s` : 'Resend OTP Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('request');
                    setApiError('');
                    setApiSuccess('');
                    setResetToken('');
                    setIsDispatched(false);
                  }}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* ─── STAGE 3: SET NEW PASSWORD ─── */}
          {forgotStep === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Identity verified for {recoveryEmail}</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-0.5 focus:outline-none cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-0.5 focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <span>Updating password...</span>
                ) : (
                  <>
                    <span>Save New Password & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── STANDARD LOGIN FORM ─── */}
          {!forgotStep && (
            <>
              <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">College Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      {...register('collegeEmail')}
                      type="email"
                      placeholder="student@nmamit.in"
                      className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  {errors.collegeEmail && (
                    <p className="text-rose-400 text-xs mt-1">{errors.collegeEmail.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('request');
                        setApiError('');
                        setApiSuccess('');
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-3 pl-10 pr-11 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-0.5 focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 mt-3"
                >
                  {isLoading ? (
                    <span>Verifying credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to renature</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-[#071712] px-3 text-stone-500 font-semibold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In Container */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div id="googleSignInBtn" className="w-full flex justify-center min-h-[44px]" />
                {!googleClientId && (
                  <button
                    type="button"
                    onClick={() => setApiError('Google Sign-In requires VITE_GOOGLE_CLIENT_ID to be configured in your environment.')}
                    className="w-full py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all min-h-[44px]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google (@nmamit.in)</span>
                  </button>
                )}
                <p className="text-[11px] text-stone-500 text-center leading-tight">
                  Institutional accounts only &bull; Domain must be <strong className="text-stone-400">@nmamit.in</strong>
                </p>
              </div>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-stone-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
                Register here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
