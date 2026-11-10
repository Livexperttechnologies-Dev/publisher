import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState<string>(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official KIBO360 Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/kibo360-logo.png"
            alt="KIBO360 Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Financial Accounting & Publishing ERP
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access immutable ledgers, royalty accruals & distribution hub
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-purple-950/5 rounded-2xl border border-slate-200/80 sm:px-10">
          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-pink-50 border border-pink-200 text-[#E91E63] text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  autoComplete="off"
                  {...register('email')}
                  className="block w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-[#E91E63]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-[#E91E63]">{errors.password.message}</p>}
              <div className="mt-1.5 flex justify-end">
                <a href="#forgot" className="text-xs text-[#690BA8] font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Security CAPTCHA Verification */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Security Verification (CAPTCHA)
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 select-none"
                  aria-label="CAPTCHA code"
                >
                  <span className="font-mono text-base font-bold tracking-[0.35em] text-[#340771] italic line-through decoration-slate-400/60">
                    {captchaCode}
                  </span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1 rounded-md text-slate-500 hover:text-[#690BA8] hover:bg-slate-200/70 transition-colors"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck size={16} />
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
                    className="block w-full pl-9 pr-3 py-2 text-sm font-mono uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                  />
                </div>
              </div>
              {captchaError && <p className="mt-1 text-xs text-[#E91E63]">{captchaError}</p>}
            </div>

            <div className="pt-2">
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
    </div>
  );
};
