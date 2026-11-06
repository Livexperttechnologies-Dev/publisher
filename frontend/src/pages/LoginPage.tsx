import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, AlertCircle, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid enterprise email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@kibo360.com',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Simulate/Authenticate against API or seed credentials
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
          navigate('/');
        }, 400);
      } else {
        setAuthError('Invalid credentials. Please use the demo credentials provided below.');
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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                  {...register('password')}
                  className="block w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#690BA8] focus:ring-1 focus:ring-[#690BA8] transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-[#E91E63]">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#690BA8] focus:ring-[#690BA8]" />
                <span className="ml-2">Remember credentials</span>
              </label>
              <a href="#forgot" className="text-[#690BA8] font-semibold hover:underline">
                Forgot password?
              </a>
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

          {/* Seed demo account hint */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-8 px-6 py-4 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#690BA8]" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Enterprise Seed Demo Account</p>
                  <p className="text-[11px] text-slate-500 font-mono">admin@kibo360.com / Admin@123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@kibo360.com');
                  setValue('password', 'Admin@123');
                }}
                className="text-xs font-bold text-[#690BA8] hover:underline"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
