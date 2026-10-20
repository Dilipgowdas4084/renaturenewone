import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { storeTokens } from '../utils/auth';
import CaveScene from '../components/pixel/CaveScene';
import { texture } from '../utils/pixelTextures';
import {
  ArrowLeft, Leaf, Lock, Mail, ArrowRight, KeyRound,
  CheckCircle2, RefreshCw, ShieldCheck, Eye, EyeOff
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

  // ─── Pixel cave UI (presentation only) ───
  const labelCls = 'block font-pixel text-xs tracking-[0.15em] uppercase text-earth mb-2';
  const iconCls = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth pointer-events-none';
  const inputCls = 'px-input w-full !pl-10';
  const eyeBtnCls = 'absolute right-3 top-1/2 -translate-y-1/2 text-earth hover:text-bark p-1 focus:outline-none cursor-pointer';

  return (
    <div className="relative min-h-[100dvh] w-full font-body text-cream overflow-x-hidden selection:bg-sun/40 selection:text-bark">
      <CaveScene />

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center p-4 sm:p-6 md:p-8">
        {/* Top bar */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <Link to="/" className="px-btn px-btn--stone px-btn--sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.15em] text-sun px-shadow-sm">
            <span className="w-2 h-2 bg-[#86c95e] animate-pulse" />
            NMAMIT Portal
          </span>
        </div>

        <div className="w-full max-w-5xl flex-1 grid grid-cols-1 md:grid-cols-[1fr_440px] gap-8 items-start md:items-center">

          {/* Left — branding (the explorer walks up below it) */}
          <div className="hidden md:block self-start pt-4">
            <div className="inline-block px-panel px-panel--thin px-6 py-4" style={texture('planks', 48)}>
              <p className="font-pixel text-sun text-xs tracking-[0.3em] mb-1 flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5" />
                MEMBER ACCESS PORTAL
              </p>
              <h1 className="px-title text-cream text-4xl lg:text-5xl tracking-wide leading-tight">
                {forgotStep ? 'Gmail OTP Verification' : 'Welcome Back'}
              </h1>
            </div>
            <p className="mt-5 text-cream/90 max-w-sm leading-relaxed" style={{ textShadow: '0 2px 0 rgba(0,0,0,0.6)' }}>
              {forgotStep === 'request' && 'Enter your registered Gmail to receive a one-time 6-digit security code.'}
              {forgotStep === 'verify' && (
                isDispatched
                  ? 'Check your Gmail inbox and enter the 6-digit OTP code to verify your identity.'
                  : 'If your account is registered, check your inbox and spam folder for the 6-digit code.'
              )}
              {forgotStep === 'reset' && 'Identity confirmed! Create a new secure password to access your renature steward account.'}
              {!forgotStep && 'Sign in to manage your campus drives, track earned Eco-Points, and view verified volunteer certifications.'}
            </p>

            <div className="mt-6">
              <p className="font-pixel text-xs uppercase tracking-[0.2em] text-cream/70 mb-3 px-shadow-sm">Community Hub</p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(s => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 px-panel--thin bg-[#2a2622] text-cream flex items-center justify-center transition-colors hover:bg-sun hover:text-bark"
                    title={s.name}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="px-panel p-6 sm:p-8" style={texture('parchment', 64)}>

            {/* Header */}
            <div className="mb-6">
              <h2 className="font-pixel text-2xl uppercase text-bark mb-1">
                {!forgotStep && 'Sign In'}
                {forgotStep === 'request' && 'Reset Password'}
                {forgotStep === 'verify' && 'Confirm OTP Code'}
                {forgotStep === 'reset' && 'Set New Password'}
              </h2>
              <p className="text-sm text-bark/70">
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
              <div className="mb-5 px-4 py-3 px-panel--thin bg-[#9c3d33] text-cream" role="alert">
                <p className="text-sm text-center font-semibold">⚠ {apiError}</p>
              </div>
            )}

            {apiSuccess && (
              <div className="mb-5 px-4 py-3 px-panel--thin bg-forest text-cream flex items-center justify-center gap-2" role="status">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p className="text-sm text-center font-semibold">{apiSuccess}</p>
              </div>
            )}

            {/* ─── STAGE 1: REQUEST OTP ─── */}
            {forgotStep === 'request' && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div>
                  <label className={labelCls}>Registered Gmail / College Email</label>
                  <div className="relative">
                    <Mail className={iconCls} />
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="student@nmamit.in or your.gmail@gmail.com"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="px-btn px-btn--grass w-full mt-1">
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
                  className="px-btn px-btn--cream w-full"
                >
                  Return to Sign In
                </button>
              </form>
            )}

            {/* ─── STAGE 2: CONFIRM OTP ─── */}
            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                <div>
                  <label className={labelCls}>Enter 6-Digit OTP Code</label>
                  <div className="relative">
                    <ShieldCheck className={iconCls} />
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className={`${inputCls} text-center font-num text-base tracking-[0.4em]`}
                      required
                    />
                  </div>
                  <p className="text-xs text-bark/70 mt-2">
                    {isDispatched ? (
                      <>Check your inbox / spam folder for the email from <strong>renature NMAMIT</strong>.</>
                    ) : (
                      <>If an account exists, check your inbox / spam folder for the email from <strong>renature NMAMIT</strong>.</>
                    )}
                  </p>
                </div>

                <button type="submit" disabled={isLoading} className="px-btn px-btn--grass w-full">
                  {isLoading ? (
                    <span>Verifying code...</span>
                  ) : (
                    <>
                      <span>Confirm & Verify OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={countdown > 0 || isLoading}
                    onClick={handleSendOtp}
                    className="font-pixel text-sm uppercase tracking-wider text-forest hover:text-deep disabled:text-bark/40 flex items-center gap-1.5 cursor-pointer"
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
                    className="font-pixel text-sm uppercase tracking-wider text-earth hover:text-bark"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {/* ─── STAGE 3: SET NEW PASSWORD ─── */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="px-3 py-2.5 px-panel--thin bg-forest text-cream flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Identity verified for {recoveryEmail}</span>
                </div>

                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <KeyRound className={iconCls} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className={`${inputCls} !pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(prev => !prev)}
                      className={eyeBtnCls}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <div className="relative">
                    <Lock className={iconCls} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className={`${inputCls} !pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className={eyeBtnCls}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="px-btn px-btn--grass w-full mt-1">
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
                <form onSubmit={handleSubmit(onLoginSubmit)} className="flex flex-col gap-5">
                  {/* Email */}
                  <div>
                    <label className={labelCls}>College Email</label>
                    <div className="relative">
                      <Mail className={iconCls} />
                      <input
                        {...register('collegeEmail')}
                        type="email"
                        placeholder="student@nmamit.in"
                        className={inputCls}
                      />
                    </div>
                    {errors.collegeEmail && (
                      <p className="text-[#9c3d33] text-sm font-semibold mt-1.5">{errors.collegeEmail.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`${labelCls} !mb-0`}>Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep('request');
                          setApiError('');
                          setApiSuccess('');
                        }}
                        className="text-sm text-forest hover:text-deep font-semibold cursor-pointer hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className={iconCls} />
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`${inputCls} !pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className={eyeBtnCls}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[#9c3d33] text-sm font-semibold mt-1.5">{errors.password.message}</p>
                    )}
                  </div>

                  <button type="submit" disabled={isLoading} className="px-btn px-btn--grass w-full mt-1">
                    {isLoading ? (
                      <span>Verifying credentials...</span>
                    ) : (
                      <>
                        <span aria-hidden="true">▶</span>
                        <span>Sign In to renature</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 border-t-2 border-dashed border-earth/30" />
                  <span className="font-pixel text-xs uppercase tracking-[0.15em] text-earth">Or continue with</span>
                  <div className="flex-1 border-t-2 border-dashed border-earth/30" />
                </div>

                {/* Google Sign-In Container */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div id="googleSignInBtn" className="w-full flex justify-center min-h-[44px]" />
                  {!googleClientId && (
                    <button
                      type="button"
                      onClick={() => setApiError('Google Sign-In requires VITE_GOOGLE_CLIENT_ID to be configured in your environment.')}
                      className="px-btn px-btn--cream w-full !normal-case"
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
                  <p className="text-xs text-bark/60 text-center leading-tight">
                    Institutional accounts only &bull; Domain must be <strong className="text-bark/80">@nmamit.in</strong>
                  </p>
                </div>
              </>
            )}

            <div className="mt-6 pt-5 border-t-2 border-dashed border-earth/30 text-center">
              <p className="text-sm text-bark/75">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-forest hover:text-deep font-bold underline underline-offset-4">
                  Register here
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
