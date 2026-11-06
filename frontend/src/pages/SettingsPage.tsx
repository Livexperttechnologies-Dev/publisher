import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Building2, GitBranch, Calendar, ShieldCheck, Save, Palette, Sparkles } from 'lucide-react';
import { BrandCustomizer } from '../components/branding/BrandCustomizer';
import { useBrand, BRAND_PRESETS } from '../contexts/BrandContext';

export const SettingsPage: React.FC = () => {
  const { brand, updateBrand, applyPreset } = useBrand();
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'BRANDING'>('SYSTEM');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise System Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-company legal entities, dynamic brand colors & logo, branch godowns, and period controls.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'SYSTEM'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            System & Legal Profile
          </button>
          <button
            onClick={() => setActiveTab('BRANDING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'BRANDING'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette size={13} style={{ color: brand.primaryColor }} />
            <span>Dynamic Brand & Theme</span>
          </button>
        </div>
      </div>

      {activeTab === 'BRANDING' ? (
        <BrandCustomizer />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Company & Legal Profile */}
            <div className="lg:col-span-2 space-y-6">
              <Card header="Company Profile & Tax Identification">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Company Legal Name"
                      value={brand.companyName}
                      onChange={(e) => updateBrand({ companyName: e.target.value })}
                    />
                    <Input label="Short Code / Prefix" defaultValue="AEPD" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="GSTIN / Tax ID" defaultValue="07AAAAA0000A1Z5" />
                    <Input label="PAN Number" defaultValue="AAACA1234D" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Official Email" defaultValue="finance@apexpublishers.com" />
                    <Input label="Phone Number" defaultValue="+91 11 4567 8900" />
                  </div>

                  <div>
                    <Input label="Registered Address" defaultValue="Publishers Enclave, Daryaganj, New Delhi - 110002" />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Save size={14} />}
                      onClick={() => showToast('Company profile updated successfully.')}
                    >
                      Save Company Profile
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Branches & Godowns */}
              <Card header="Branch Warehouses & Regional Offices">
                <div className="space-y-3">
                  {[
                    { name: 'Headquarters & Central Godown', code: 'HQ-DELHI', type: 'Primary HQ', city: 'New Delhi' },
                    { name: 'Western Zonal Depot (Bhiwandi Godown)', code: 'BHW-MUM', type: 'Distribution Depot', city: 'Bhiwandi, MH' },
                    { name: 'Southern Distribution Hub', code: 'STH-BLR', type: 'Distribution Depot', city: 'Bengaluru, KA' },
                  ].map((b) => (
                    <div key={b.code} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: `${brand.primaryColor}1A`,
                            color: brand.primaryColor,
                          }}
                        >
                          <GitBranch size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-800">{b.name}</h4>
                          <p className="text-[11px] text-slate-500">{b.code} • {b.city}</p>
                        </div>
                      </div>
                      <Badge variant="purple" size="sm">{b.type}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Fiscal Year & Dynamic Branding Controls */}
            <div className="space-y-6">
              <Card header="Active Fiscal Year">
                <div className="space-y-4">
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${brand.primaryColor}0D`,
                      borderColor: `${brand.primaryColor}33`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: brand.primaryColor }}>
                        FY 2026-2027
                      </span>
                      <Badge variant="success" size="sm">Active Current</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">01 Apr 2026 – 31 Mar 2027</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Ledger Lock Status:</span>
                      <span className="font-semibold text-emerald-600">Unlocked (Open)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Monetary Precision:</span>
                      <span className="font-semibold text-slate-800">Decimal (15, 2)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Audit Trail Level:</span>
                      <span className="font-semibold text-slate-800">Comprehensive (Strict)</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dynamic Branding & Color Controls Card */}
              <Card header="Dynamic Branding & Colors">
                <div className="space-y-4">
                  {/* Current Logo and Tagline preview */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={brand.logoUrl}
                        alt="Logo preview"
                        style={{ height: `${brand.logoHeight || 32}px` }}
                        className="object-contain max-w-[120px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/kibo360-logo.png';
                        }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{brand.tagline || 'Publishing ERP'}</p>
                        <p className="text-[10px] text-slate-500">Active Live Branding</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('BRANDING')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Interactive Dynamic Color Pickers */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Live Color Pickers (Click Swatch to Change)
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Primary Color Picker */}
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <input
                          type="color"
                          value={brand.primaryColor}
                          onChange={(e) => updateBrand({ primaryColor: e.target.value, presetId: 'custom' })}
                          className="h-5 w-5 rounded-full border-0 cursor-pointer p-0 bg-transparent shrink-0"
                          title="Click to choose Primary color"
                        />
                        <div className="truncate">
                          <p className="text-[10px] font-bold text-slate-700">Primary</p>
                          <p className="font-mono text-[10px] text-slate-500 uppercase">{brand.primaryColor}</p>
                        </div>
                      </div>

                      {/* Deep Color Picker */}
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <input
                          type="color"
                          value={brand.deepColor}
                          onChange={(e) => updateBrand({ deepColor: e.target.value, presetId: 'custom' })}
                          className="h-5 w-5 rounded-full border-0 cursor-pointer p-0 bg-transparent shrink-0"
                          title="Click to choose Deep color"
                        />
                        <div className="truncate">
                          <p className="text-[10px] font-bold text-slate-700">Deep</p>
                          <p className="font-mono text-[10px] text-slate-500 uppercase">{brand.deepColor}</p>
                        </div>
                      </div>

                      {/* Accent Color Picker */}
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <input
                          type="color"
                          value={brand.accentColor}
                          onChange={(e) => updateBrand({ accentColor: e.target.value, presetId: 'custom' })}
                          className="h-5 w-5 rounded-full border-0 cursor-pointer p-0 bg-transparent shrink-0"
                          title="Click to choose Accent color"
                        />
                        <div className="truncate">
                          <p className="text-[10px] font-bold text-slate-700">Accent</p>
                          <p className="font-mono text-[10px] text-slate-500 uppercase">{brand.accentColor}</p>
                        </div>
                      </div>

                      {/* Coral / Alert Color Picker */}
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <input
                          type="color"
                          value={brand.coralColor}
                          onChange={(e) => updateBrand({ coralColor: e.target.value, presetId: 'custom' })}
                          className="h-5 w-5 rounded-full border-0 cursor-pointer p-0 bg-transparent shrink-0"
                          title="Click to choose Alert color"
                        />
                        <div className="truncate">
                          <p className="text-[10px] font-bold text-slate-700">Alert</p>
                          <p className="font-mono text-[10px] text-slate-500 uppercase">{brand.coralColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Theme Preset Switcher */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Theme Presets
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BRAND_PRESETS.slice(0, 4).map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            applyPreset(preset.id);
                            showToast(`Applied ${preset.name}!`);
                          }}
                          className={`flex items-center gap-1.5 p-1.5 rounded border text-[11px] font-medium transition-all text-left ${
                            brand.presetId === preset.id
                              ? 'border-slate-800 bg-slate-100 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="truncate">{preset.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button to open full suite */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<Palette size={14} />}
                    onClick={() => setActiveTab('BRANDING')}
                  >
                    Open Full Brand Customizer Suite
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Dedicated Full Brand Customizer Section */}
          <div className="pt-2">
            <BrandCustomizer />
          </div>
        </>
      )}
    </div>
  );
};
