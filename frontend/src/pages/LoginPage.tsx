import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle2,
  Activity,
  Smartphone,
  Layers,
  IndianRupee,
  Feather,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getStoredUsers } from '../services/rolesService';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid enterprise email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const generateCaptchaCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const HERO_ROTATING_WORDS = [
  'ledgers & royalties',
  'ISBN & book stock',
  'GST & invoicing',
  'print & distribution',
];

const LIVE_DISPATCH_FEED = [
  { code: 'ISBN-978', detail: 'Delhi HQ · 1,450 Copies', progress: 82 },
  { code: 'ISBN-812', detail: 'Mumbai Depot · 2,800 Copies', progress: 94 },
  { code: 'ISBN-405', detail: 'Bengaluru Hub · 960 Copies', progress: 68 },
];

const LIVE_RECEIPT_FEED = [
  { amount: '₹84,500 received', meta: 'UPI / NEFT · Sales Inv #891' },
  { amount: '₹1,42,000 received', meta: 'RTGS · Oxford Book Store' },
  { amount: '₹63,800 received', meta: 'NEFT · Cambridge Academic' },
];

const LIVE_ROYALTY_FEED = [
  { amount: '₹34,10,500', sub: '98 Active Author Contracts' },
  { amount: '₹18,75,000', sub: 'Q2 Royalty Payout Approved' },
  { amount: '₹4,25,800', sub: 'TDS 194J Auto-Posted to GL' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState<string>(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % HERO_ROTATING_WORDS.length);
    }, 3000);
    const feedTimer = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % LIVE_DISPATCH_FEED.length);
    }, 2600);
    return () => {
      clearInterval(wordTimer);
      clearInterval(feedTimer);
    };
  }, []);

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
    setCaptchaError(null);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setCaptchaError(null);

    if (!captchaInput.trim()) {
      setCaptchaError('Please enter the security verification code.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError('Incorrect verification code. Please try again.');
      setCaptchaCode(generateCaptchaCode());
      setCaptchaInput('');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate/Authenticate against API or seed credentials
      const storedUsers = getStoredUsers();
      const matchedUser = storedUsers.find(
        (u) => u.email.toLowerCase() === data.email.trim().toLowerCase() && u.isActive
      );

      if (data.email === 'admin@kibo360.com' && data.password === 'Admin@123') {
        localStorage.setItem(
          'kibo360_auth',
          JSON.stringify({
            token: 'mock_jwt_token_super_admin',
            user: {
              name: 'KIBO360 Principal Administrator',
              email: data.email,
              role: 'SUPER_ADMIN',
              company: 'Apex Educational Publishers & Distributors Ltd.',
            },
          })
        );
        setTimeout(() => {
          navigate('/admin');
        }, 400);
      } else if (matchedUser && data.email.toLowerCase() !== 'admin@kibo360.com') {
        const normalizedRole = matchedUser.role.trim().toLowerCase();
        const roleSlug =
          normalizedRole === 'super administrator' ||
          normalizedRole === 'super_admin' ||
          normalizedRole === 'admin'
            ? 'admin'
            : normalizedRole.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'user';

        localStorage.setItem(
          'kibo360_auth',
          JSON.stringify({
            token: `mock_jwt_token_${roleSlug}`,
            user: {
              name: matchedUser.fullName,
              email: matchedUser.email,
              role: matchedUser.role,
              company: 'Apex Educational Publishers & Distributors Ltd.',
            },
          })
        );
        setTimeout(() => {
          navigate(`/${roleSlug}`);
        }, 400);
      } else {
        setAuthError('Invalid email or password. Please verify your credentials and try again.');
        refreshCaptcha();
      }
    } catch (err: any) {
      setAuthError('Authentication service unreachable. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] select-none overflow-x-hidden lg:overflow-hidden">
      <style>{`
        @keyframes kiboFloatA {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(3px); }
        }
        @keyframes kiboFloatB {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(-3px); }
        }
        @keyframes kiboFloatC {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.012); }
        }
        @keyframes kiboTrendDraw {
          0% { stroke-dashoffset: 1200; opacity: 0.45; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.95; }
        }
        @keyframes kiboDashFlow {
          to { stroke-dashoffset: -120; }
        }
        @keyframes kiboBarPulse {
          0%, 100% { transform: scaleY(0.75); opacity: 0.25; }
          50% { transform: scaleY(1.18); opacity: 0.75; }
        }
        @keyframes kiboWordIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(3px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes kiboTickerIn {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kiboRingSpin {
          0% { stroke-dashoffset: 88; }
          50% { stroke-dashoffset: 18; }
          100% { stroke-dashoffset: 88; }
        }
        @keyframes kiboOrbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.06); }
        }
        @keyframes kiboCardShimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .kibo-float-a { animation: kiboFloatA 4.2s ease-in-out infinite; }
        .kibo-float-b { animation: kiboFloatB 4.8s ease-in-out 0.6s infinite; }
        .kibo-float-c { animation: kiboFloatC 4.0s ease-in-out 1.1s infinite; }
        .kibo-float-d { animation: kiboFloatA 4.5s ease-in-out 1.6s infinite; }
        .kibo-trend-path {
          stroke-dasharray: 1200;
          animation: kiboTrendDraw 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .kibo-dash-secondary {
          stroke-dasharray: 8 8;
          animation: kiboDashFlow 3s linear infinite;
        }
        .kibo-bar {
          transform-origin: bottom;
          animation: kiboBarPulse 2.4s ease-in-out infinite;
        }
        .kibo-ring-anim {
          animation: kiboRingSpin 5s ease-in-out infinite;
        }
        .kibo-word-anim {
          display: inline-block;
          animation: kiboWordIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .kibo-ticker-anim {
          animation: kiboTickerIn 0.35s ease-out forwards;
        }
        .kibo-orb-anim {
          animation: kiboOrbDrift 8s ease-in-out infinite;
        }
        .kibo-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%);
          animation: kiboCardShimmer 6s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* =================================================================== */}
      {/* LEFT PANEL: Deep Plum Enterprise Showcase (Responsive for all screens) */}
      {/* =================================================================== */}
      <div
        className="relative hidden lg:flex lg:w-[58%] xl:w-[62%] 2xl:w-[64%] flex-col justify-between p-6 lg:p-7 xl:p-10 2xl:p-12 text-white overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 14% 12%, #3D105E 0%, #1F0B33 38%, #150922 72%, #11071B 100%)',
        }}
      >
        {/* Subtle Dot Matrix Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Animated Ambient Glowing Orbs */}
        <div
          className="kibo-orb-anim pointer-events-none absolute -top-16 left-10 w-72 xl:w-80 h-72 xl:h-80 rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, #7B1FA2 0%, transparent 70%)',
          }}
        />
        <div
          className="kibo-orb-anim pointer-events-none absolute -bottom-24 left-[28%] w-[26rem] xl:w-[32rem] h-[18rem] xl:h-[22rem] rounded-full blur-3xl opacity-35"
          style={{
            background: 'radial-gradient(circle, #8B1E5B 0%, #521042 45%, transparent 75%)',
          }}
        />

        {/* Top Official KIBO360 White Brand Logo */}
        <div className="relative z-10 flex items-center shrink-0">
          <img
            src="/kibo360-logo-white.png"
            alt="KIBO360 - One Platform. Every Business."
            className="h-10 lg:h-12 xl:h-14 2xl:h-16 w-auto object-contain"
          />
        </div>

        {/* Center Hero Copy & Publishing Financial ERP Animation Canvas */}
        <div className="relative z-10 my-auto py-2 xl:py-4 w-full">
          {/* Pill Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md mb-3 xl:mb-5"
            style={{ backgroundColor: 'rgba(46, 26, 66, 0.75)' }}
          >
            <span className="px-2 py-0.5 rounded-full text-[9px] xl:text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#E91E63] to-[#F06A64] text-white">
              ERP
            </span>
            <span className="text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-100/90">
              Publishing &amp; Financial Accounting
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </div>

          {/* Main Animated Headline */}
          <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-[50px] font-extrabold tracking-tight leading-[1.14] text-white">
            One platform for
            <br />
            <span
              key={wordIndex}
              className="kibo-word-anim bg-gradient-to-r from-[#F06A64] via-[#E91E63] to-[#FF8A65] bg-clip-text text-transparent"
            >
              {HERO_ROTATING_WORDS[wordIndex]}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 xl:mt-3.5 max-w-xl text-xs lg:text-xs xl:text-sm 2xl:text-[15px] text-slate-300/85 leading-relaxed font-normal">
            Streamline general ledgers, ISBN inventory, author royalties, and GST invoicing in one
            unified enterprise platform built for modern publishers.
          </p>

          {/* Full-Width Project-Specific Financial & Publishing ERP Animated Canvas */}
          <div className="relative mt-6 lg:mt-7 xl:mt-8 2xl:mt-10 h-52 lg:h-56 xl:h-64 2xl:h-72 w-full">
            {/* Animated Financial Revenue Growth Curve, Secondary Flow & Ledger Volume Bars */}
            <svg
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-36 xl:h-44 pointer-events-none"
              viewBox="0 0 1000 150"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="kiboAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F06A64" stopOpacity="0.22" />
                  <stop offset="55%" stopColor="#E91E63" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#150922" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="kiboTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#690BA8" stopOpacity="0.3" />
                  <stop offset="25%" stopColor="#E91E63" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#F06A64" stopOpacity="1" />
                  <stop offset="78%" stopColor="#E91E63" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#F06A64" stopOpacity="0.55" />
                </linearGradient>
              </defs>

              {/* Animated Monthly Publishing & Sales Volume Bars Spanning Full Width */}
              {[
                { x: 140, h: 32, d: '0s' },
                { x: 180, h: 46, d: '0.15s' },
                { x: 220, h: 38, d: '0.3s' },
                { x: 260, h: 58, d: '0.45s' },
                { x: 300, h: 72, d: '0.6s' },
                { x: 340, h: 60, d: '0.75s' },
                { x: 380, h: 86, d: '0.9s' },
                { x: 420, h: 66, d: '1.05s' },
                { x: 460, h: 54, d: '1.2s' },
                { x: 500, h: 64, d: '1.35s' },
                { x: 540, h: 78, d: '1.5s' },
                { x: 580, h: 68, d: '1.65s' },
                { x: 620, h: 88, d: '1.8s' },
                { x: 660, h: 76, d: '1.95s' },
                { x: 700, h: 72, d: '2.1s' },
                { x: 740, h: 94, d: '2.25s' },
                { x: 780, h: 80, d: '2.4s' },
                { x: 820, h: 88, d: '2.55s' },
                { x: 860, h: 74, d: '2.7s' },
              ].map((bar, idx) => (
                <rect
                  key={idx}
                  className="kibo-bar"
                  style={{ animationDelay: bar.d }}
                  x={bar.x}
                  y={120 - bar.h}
                  width="14"
                  height={bar.h}
                  rx="3"
                  fill="rgba(240, 106, 100, 0.2)"
                />
              ))}

              {/* Baseline Grid Axis */}
              <line
                x1="0"
                y1="120"
                x2="1000"
                y2="120"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />

              {/* Secondary Animated Dashed Inventory & Print Production Curve */}
              <path
                className="kibo-dash-secondary"
                d="M 0 108 C 120 102, 220 90, 320 72 C 420 55, 500 84, 600 66 C 700 48, 820 58, 1000 42"
                stroke="rgba(168, 85, 247, 0.4)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Smooth Financial Revenue & Royalty Accrual Area + Trend Curve */}
              <path
                d="M 0 98 C 90 95, 160 86, 230 76 C 290 66, 330 30, 380 26 C 440 22, 480 64, 540 52 C 600 40, 660 22, 740 20 C 810 18, 880 38, 940 30 C 970 26, 990 24, 1000 22 L 1000 120 L 0 120 Z"
                fill="url(#kiboAreaFill)"
              />
              <path
                id="kiboMainCurve"
                d="M 0 98 C 90 95, 160 86, 230 76 C 290 66, 330 30, 380 26 C 440 22, 480 64, 540 52 C 600 40, 660 22, 740 20 C 810 18, 880 38, 940 30 C 970 26, 990 24, 1000 22"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="kibo-trend-path"
                d="M 0 98 C 90 95, 160 86, 230 76 C 290 66, 330 30, 380 26 C 440 22, 480 64, 540 52 C 600 40, 660 22, 740 20 C 810 18, 880 38, 940 30 C 970 26, 990 24, 1000 22"
                stroke="url(#kiboTrendGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Live Glowing Data Comet Traveling Along the Revenue Curve */}
              <circle r="5" fill="#FFFFFF">
                <animateMotion
                  dur="6s"
                  repeatCount="indefinite"
                  path="M 0 98 C 90 95, 160 86, 230 76 C 290 66, 330 30, 380 26 C 440 22, 480 64, 540 52 C 600 40, 660 22, 740 20 C 810 18, 880 38, 940 30 C 970 26, 990 24, 1000 22"
                />
              </circle>
              <circle r="12" fill="#F06A64" fillOpacity="0.4">
                <animateMotion
                  dur="6s"
                  repeatCount="indefinite"
                  path="M 0 98 C 90 95, 160 86, 230 76 C 290 66, 330 30, 380 26 C 440 22, 480 64, 540 52 C 600 40, 660 22, 740 20 C 810 18, 880 38, 940 30 C 970 26, 990 24, 1000 22"
                />
              </circle>

              {/* Glowing Milestone Data Nodes on Curve */}
              <circle cx="380" cy="26" r="4.5" fill="#F06A64" />
              <circle cx="380" cy="26" r="11" fill="#F06A64" fillOpacity="0.28">
                <animate attributeName="r" values="8;14;8" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="540" cy="52" r="4" fill="#E91E63" />
              <circle cx="740" cy="20" r="4.5" fill="#F06A64" />
              <circle cx="740" cy="20" r="11" fill="#F06A64" fillOpacity="0.28">
                <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Card 1: Top-Left - Live Rotating ISBN Print & Dispatch Feed */}
            <div
              className="kibo-float-a kibo-shimmer overflow-hidden absolute left-0 top-1 w-44 lg:w-48 xl:w-52 2xl:w-56 rounded-xl xl:rounded-2xl border border-white/10 backdrop-blur-md p-3 xl:p-4 shadow-2xl"
              style={{ backgroundColor: 'rgba(38, 24, 54, 0.82)' }}
            >
              <div className="flex items-center justify-between text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-slate-300/70">
                <span>Now Dispatching</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 capitalize font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 -ml-2.5" />
                  Live
                </span>
              </div>
              <div key={feedIndex} className="kibo-ticker-anim">
                <div className="mt-1 text-lg xl:text-2xl font-extrabold tracking-tight text-white">
                  {LIVE_DISPATCH_FEED[feedIndex].code}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] xl:text-[11px] text-slate-300/75 truncate">
                  <BookOpen size={11} className="text-[#F06A64] shrink-0" />
                  <span className="truncate">{LIVE_DISPATCH_FEED[feedIndex].detail}</span>
                </div>
              </div>
              <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E91E63] to-[#F06A64] transition-all duration-700"
                  style={{ width: `${LIVE_DISPATCH_FEED[feedIndex].progress}%` }}
                />
              </div>
            </div>

            {/* Card 2: Top-Center / Top-Right on lg - YTD Publishing Revenue Target Ring */}
            <div
              className="kibo-float-b kibo-shimmer overflow-hidden absolute right-0 lg:right-2 xl:right-auto xl:left-[34%] 2xl:left-[35%] top-0 w-40 lg:w-44 xl:w-48 2xl:w-52 rounded-xl xl:rounded-2xl border border-white/10 backdrop-blur-md p-2.5 xl:p-3.5 shadow-2xl flex items-center gap-2.5 xl:gap-3.5"
              style={{ backgroundColor: 'rgba(42, 26, 58, 0.84)' }}
            >
              <div className="relative h-10 w-10 xl:h-12 xl:w-12 flex items-center justify-center shrink-0">
                <svg className="h-10 w-10 xl:h-12 xl:w-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="3.5"
                  />
                  <circle
                    className="kibo-ring-anim"
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#F06A64"
                    strokeWidth="3.5"
                    strokeDasharray="88"
                    strokeDashoffset="18"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg xl:text-xl font-extrabold text-white leading-none">80%</span>
                  <span className="text-[9px] xl:text-[10px] font-bold text-emerald-400">+14.8%</span>
                </div>
                <div className="mt-0.5 text-[10px] xl:text-[11px] text-slate-300/75">Revenue target</div>
              </div>
            </div>

            {/* Card 3: Top-Right (Active on xl & 2xl screens: laptops & desktops) */}
            <div
              className="kibo-float-d kibo-shimmer overflow-hidden absolute hidden xl:block right-0 top-1 w-48 xl:w-52 2xl:w-60 rounded-xl xl:rounded-2xl border border-white/10 backdrop-blur-md p-3 xl:p-4 shadow-2xl"
              style={{ backgroundColor: 'rgba(40, 24, 58, 0.82)' }}
            >
              <div className="flex items-center justify-between text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-slate-300/70">
                <span>Author Royalties</span>
                <span className="text-[#F06A64] font-semibold">TDS 194J</span>
              </div>
              <div key={feedIndex} className="kibo-ticker-anim">
                <div className="mt-1 text-base xl:text-xl font-extrabold tracking-tight text-white">
                  {LIVE_ROYALTY_FEED[feedIndex].amount}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] xl:text-[11px] text-slate-300/75 truncate">
                  <Feather size={11} className="text-[#E91E63] shrink-0" />
                  <span className="truncate">{LIVE_ROYALTY_FEED[feedIndex].sub}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Bottom-Left - Double-Entry Trial Balance Sync */}
            <div
              className="kibo-float-c kibo-shimmer overflow-hidden absolute left-0 xl:left-2 bottom-1 w-48 lg:w-52 xl:w-56 2xl:w-64 rounded-xl xl:rounded-2xl border border-white/10 backdrop-blur-md px-3 py-2 xl:px-4 xl:py-3 shadow-2xl flex items-center justify-between"
              style={{ backgroundColor: 'rgba(38, 24, 54, 0.82)' }}
            >
              <div className="flex items-center gap-2.5 xl:gap-3 truncate">
                <div className="h-7 w-7 xl:h-8 xl:w-8 rounded-lg xl:rounded-xl bg-white/10 flex items-center justify-center text-purple-200 shrink-0">
                  <Layers size={14} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] xl:text-xs font-bold text-white truncate">Trial balance synced</div>
                  <div className="text-[9px] xl:text-[11px] text-slate-300/65 truncate">Dr = Cr · General ledger</div>
                </div>
              </div>
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 animate-pulse ml-1" />
            </div>

            {/* Card 5: Bottom-Center / Bottom-Right on lg - Live Incoming Voucher & Sales Receipt */}
            <div
              className="kibo-float-a kibo-shimmer overflow-hidden absolute right-0 lg:right-2 xl:right-auto xl:left-[35%] 2xl:left-[38%] bottom-2 w-44 lg:w-48 xl:w-52 2xl:w-60 rounded-xl xl:rounded-2xl border border-white/10 backdrop-blur-md px-3 py-2 xl:px-4 xl:py-3 shadow-2xl flex items-center gap-2.5 xl:gap-3"
              style={{ backgroundColor: 'rgba(44, 26, 60, 0.84)' }}
            >
              <div className="h-7 w-7 xl:h-9 xl:w-9 rounded-lg xl:rounded-xl bg-gradient-to-br from-[#F06A64] to-[#E91E63] flex items-center justify-center text-white shadow-md shrink-0">
                <IndianRupee size={14} />
              </div>
              <div key={feedIndex} className="kibo-ticker-anim truncate">
                <div className="text-[11px] xl:text-xs font-bold text-white truncate">
                  {LIVE_RECEIPT_FEED[feedIndex].amount}
                </div>
                <div className="text-[9px] xl:text-[11px] text-slate-300/65 truncate">
                  {LIVE_RECEIPT_FEED[feedIndex].meta}
                </div>
              </div>
            </div>

            {/* Card 6: Bottom-Right (Active on xl & 2xl screens: laptops & desktops) */}
            <div
              className="kibo-float-b kibo-shimmer overflow-hidden absolute hidden xl:flex right-0 xl:right-2 bottom-1 w-48 xl:w-52 2xl:w-56 rounded-xl xl:rounded-2xl border border-white/10 backdrop-blur-md px-3 py-2 xl:px-4 xl:py-3 shadow-2xl items-center justify-between"
              style={{ backgroundColor: 'rgba(38, 24, 54, 0.82)' }}
            >
              <div className="flex items-center gap-2.5 xl:gap-3 truncate">
                <div className="h-7 w-7 xl:h-8 xl:w-8 rounded-lg xl:rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileCheck2 size={14} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] xl:text-xs font-bold text-white truncate">GST e-Invoice Verified</div>
                  <div className="text-[9px] xl:text-[11px] text-slate-300/65 truncate">HSN 4901 · IRN OK</div>
                </div>
              </div>
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-1" />
            </div>
          </div>
        </div>

        {/* Bottom Feature Strip */}
        <div className="relative z-10 flex flex-wrap items-center gap-3.5 xl:gap-6 text-[11px] xl:text-xs text-slate-300/65 pt-2 xl:pt-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-slate-300/80 shrink-0" />
            <span>Role-based access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-slate-300/80 shrink-0" />
            <span>GST &amp; Double-Entry Integrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone size={13} className="text-slate-300/80 shrink-0" />
            <span>Works on any device</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT PANEL: Elevated White Card Sign-In Form (Fully Responsive)     */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 bg-[#F8FAFC] overflow-y-auto min-h-screen lg:min-h-0">
        {/* Mobile Logo Header (only visible on small screens < 1024px) */}
        <div className="lg:hidden flex items-center justify-between pb-3">
          <img
            src="/kibo360-logo.png"
            alt="KIBO360 Logo"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="text-[11px] font-semibold text-[#690BA8]">Publishing ERP</span>
        </div>
        <div className="hidden lg:block shrink-0" />

        {/* Elevated White Card Container */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-2">
          <div className="bg-white py-6 sm:py-7 xl:py-8 px-5 sm:px-8 xl:px-10 shadow-xl shadow-purple-950/5 rounded-2xl border border-slate-200/80">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sign in</h2>
              <p className="mt-1 text-xs text-slate-500">
                Use the email and password for your publisher account.
              </p>
            </div>

            {authError && (
              <div className="mb-3.5 p-2.5 sm:p-3 rounded-lg bg-pink-50 border border-pink-200 text-[#E91E63] text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Corporate Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    autoComplete="off"
                    {...register('email')}
                    className="block w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-[#E91E63]">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    className="block w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-[#E91E63]">{errors.password.message}</p>}
                {/* Forgot password link temporarily commented out */}
                {/* <div className="mt-1 flex justify-end">
                  <a href="#forgot" className="text-xs text-[#690BA8] font-semibold hover:underline">
                    Forgot password?
                  </a>
                </div> */}
              </div>

              {/* Security CAPTCHA Verification */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Security Verification (CAPTCHA)
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 min-w-0 flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-100 border border-slate-200 select-none"
                    aria-label="CAPTCHA code"
                  >
                    <span className="font-mono text-sm sm:text-base font-bold tracking-[0.25em] sm:tracking-[0.35em] text-[#340771] italic line-through decoration-slate-400/60 truncate">
                      {captchaCode}
                    </span>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="p-1 rounded-md text-slate-500 hover:text-[#690BA8] hover:bg-slate-200/70 transition-colors shrink-0 ml-1"
                      title="Refresh CAPTCHA"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck size={15} />
                    </div>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        if (captchaError) setCaptchaError(null);
                      }}
                      maxLength={6}
                      autoComplete="off"
                      placeholder="Enter code"
                      className="block w-full pl-8 sm:pl-9 pr-2.5 py-1.5 sm:py-2 text-sm font-mono uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                    />
                  </div>
                </div>
                {captchaError && <p className="mt-1 text-xs text-[#E91E63]">{captchaError}</p>}
              </div>

              <div className="pt-1.5 sm:pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={15} />}
                >
                  Sign In to KIBO360 ERP
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Security Badge */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-200/70 text-center sm:text-left shrink-0">
          <span>© 2026 KIBO360 · Livexpert Technologies</span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Lock size={11} />
            Secure sign-in
          </span>
        </div>
      </div>
    </div>
  );
};
