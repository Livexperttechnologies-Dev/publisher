import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import {
  User,
  Shield,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSessions = [
    {
      id: 'ses_1',
      device: 'Google Chrome on Windows 11',
      ip: '127.0.0.1 (Current Session)',
      location: 'New Delhi, India',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'ses_2',
      device: 'Safari on iPhone 15 Pro',
      ip: '103.21.244.18',
      location: 'New Delhi, India',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    showToast('Your corporate password has been securely updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setTwoFactorEnabled(true);
      setTotpSecret('JBSWY3DPEHPK3PXP');
      showToast('Two-factor authentication enabled. Backup secret generated.');
    } else {
      setTwoFactorEnabled(false);
      setTotpSecret(null);
      showToast('Two-factor authentication disabled.');
    }
  };

  const handleLogoutAll = () => {
    showToast('All other active sessions have been revoked.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#340771] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        title="My Profile & Security Settings"
        description="Manage your enterprise account credentials, security sessions, and two-factor authentication."
        breadcrumbs={[{ label: 'System', href: '/' }, { label: 'My Profile' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-[#340771] text-white flex items-center justify-center font-bold text-2xl shadow-md">
              KA
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-800">KIBO360 Principal Admin</h3>
            <p className="text-xs text-slate-500 font-mono">admin@kibo360.com</p>

            <div className="mt-3 flex justify-center gap-2">
              <Badge variant="purple" size="sm">
                Super Administrator
              </Badge>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-700">Executive Board</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[170px]">Apex Publishers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch Location:</span>
                <span className="font-semibold text-slate-700">HQ Central Depot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Access Scope:</span>
                <span className="font-mono font-bold text-[#690BA8]">ALL_COMPANIES</span>
              </div>
            </div>
          </Card>

          {/* 2FA Card */}
          <Card header="Two-Factor Authentication (2FA)">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-50 text-[#690BA8] flex items-center justify-center shrink-0">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Time-based One-Time Password (TOTP)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Requires Google Authenticator or Microsoft Authenticator upon signing in.
                  </p>
                </div>
              </div>

              {twoFactorEnabled && totpSecret && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Manual Setup Key</span>
                  <div className="flex items-center justify-between font-mono font-bold text-[#690BA8] mt-1">
                    <span>{totpSecret}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(totpSecret);
                        showToast('Secret key copied to clipboard');
                      }}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              )}

              <Button
                variant={twoFactorEnabled ? 'outline' : 'primary'}
                size="sm"
                className="w-full justify-center"
                onClick={handleToggle2FA}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Password & Active Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password Form */}
          <Card header="Change Corporate Password">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormField label="Current Password" required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="New Password" required hint="Min 8 characters (A-Z, 0-9, special)">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Confirm New Password" required>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="sm" type="submit" leftIcon={<KeyRound size={14} />}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Active Sessions & Revocation */}
          <Card
            header="Active Sessions & Security Devices"
            actions={
              <Button
                variant="danger"
                size="sm"
                leftIcon={<LogOut size={13} />}
                onClick={handleLogoutAll}
              >
                Logout From All Other Devices
              </Button>
            }
          >
            <div className="space-y-3">
              {activeSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center">
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-slate-800">{s.device}</h4>
                        {s.isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {s.ip} • {s.location} • {s.lastActive}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
