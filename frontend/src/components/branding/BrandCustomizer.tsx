import React, { useState, useRef } from 'react';
import { useBrand, BRAND_PRESETS, DEFAULT_BRAND_SETTINGS } from '../../contexts/BrandContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import {
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Sliders,
  Eye,
  Link as LinkIcon,
} from 'lucide-react';

export const BrandCustomizer: React.FC = () => {
  const { brand, updateBrand, applyPreset, uploadLogo, resetToDefault } = useBrand();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadLogo(file);
      showToast('Brand logo uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      updateBrand({ logoUrl: urlInput.trim() });
      setUrlInput('');
      setShowUrlInput(false);
      showToast('Logo URL applied successfully!');
    }
  };

  const handleResetLogo = () => {
    updateBrand({ logoUrl: DEFAULT_BRAND_SETTINGS.logoUrl, tagline: DEFAULT_BRAND_SETTINGS.tagline });
    showToast('Reset to original KIBO360 logo.');
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all brand colors, logo, and theme settings to original KIBO360 defaults?')) {
      resetToDefault();
      showToast('Restored all branding settings to system defaults.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Branding Card */}
      <Card header="Dynamic Branding & Brand Colors Customization">
        <div className="space-y-6">
          {/* SECTION 1: LOGO & IDENTITY */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ImageIcon size={16} style={{ color: brand.primaryColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Brand Logo & Header Identity
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Logo Preview Canvas */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Logo Preview</p>
                <div className="h-16 w-full flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2 shadow-xs">
                  <img
                    src={brand.logoUrl}
                    alt="Brand Logo"
                    style={{ height: `${brand.logoHeight || 36}px` }}
                    className="max-w-full object-contain transition-all"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/kibo360-logo.png';
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: brand.primaryColor }}
                  >
                    {brand.tagline || 'Publishing ERP'}
                  </span>
                </div>
              </div>

              {/* Logo Controls */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload size={14} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Custom Logo Image
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<LinkIcon size={14} />}
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    Use Image URL
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftIcon={<RotateCcw size={13} />}
                    onClick={handleResetLogo}
                    className="text-slate-500"
                  >
                    Reset Logo
                  </Button>
                </div>

                {showUrlInput && (
                  <div className="flex gap-2 items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
                    <Input
                      placeholder="https://example.com/logo.png"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="text-xs"
                    />
                    <Button size="sm" onClick={handleApplyUrl}>
                      Apply
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Header Tagline / Subtitle
                    </label>
                    <Input
                      value={brand.tagline}
                      onChange={(e) => updateBrand({ tagline: e.target.value })}
                      placeholder="e.g. Publishing ERP"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Logo Display Height: <span className="font-bold">{brand.logoHeight || 36}px</span>
                    </label>
                    <input
                      type="range"
                      min={24}
                      max={48}
                      value={brand.logoHeight || 36}
                      onChange={(e) => updateBrand({ logoHeight: Number(e.target.value) })}
                      className="w-full accent-[var(--brand-primary)] cursor-pointer mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: THEME PALETTE PRESETS */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette size={16} style={{ color: brand.primaryColor }} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Curated Brand Color Themes (One-Click)
                </h3>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {BRAND_PRESETS.map((preset) => {
                const isSelected = brand.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      applyPreset(preset.id);
                      showToast(`Applied ${preset.name} theme!`);
                    }}
                    className={`text-left p-3 rounded-lg border transition-all relative ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50/90 shadow-sm ring-1 ring-slate-800'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{preset.name}</span>
                      {isSelected && (
                        <span className="flex items-center justify-center h-4 w-4 rounded-full bg-slate-900 text-white">
                          <Check size={11} />
                        </span>
                      )}
                    </div>
                    {/* Swatch Strip */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.primary }} />
                      <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.deep }} />
                      <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.accent }} />
                      <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.coral }} />
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: FINE-TUNED COLOR PICKERS */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders size={16} style={{ color: brand.primaryColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Custom Brand Hex Pickers
              </h3>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Primary Color */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">Primary Color</label>
                  <span className="text-[10px] text-slate-400">Main UI & Buttons</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={(e) => updateBrand({ primaryColor: e.target.value, presetId: 'custom' })}
                    className="h-8 w-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={brand.primaryColor}
                    onChange={(e) => updateBrand({ primaryColor: e.target.value, presetId: 'custom' })}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* 2. Deep Secondary Color */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">Deep / Secondary</label>
                  <span className="text-[10px] text-slate-400">Depth & Gradients</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.deepColor}
                    onChange={(e) => updateBrand({ deepColor: e.target.value, presetId: 'custom' })}
                    className="h-8 w-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={brand.deepColor}
                    onChange={(e) => updateBrand({ deepColor: e.target.value, presetId: 'custom' })}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* 3. Accent Color */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">Accent Color</label>
                  <span className="text-[10px] text-slate-400">Highlights & Badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.accentColor}
                    onChange={(e) => updateBrand({ accentColor: e.target.value, presetId: 'custom' })}
                    className="h-8 w-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={brand.accentColor}
                    onChange={(e) => updateBrand({ accentColor: e.target.value, presetId: 'custom' })}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* 4. Coral / Alert Color */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">Alert / Coral</label>
                  <span className="text-[10px] text-slate-400">Critical Highlights</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.coralColor}
                    onChange={(e) => updateBrand({ coralColor: e.target.value, presetId: 'custom' })}
                    className="h-8 w-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={brand.coralColor}
                    onChange={(e) => updateBrand({ coralColor: e.target.value, presetId: 'custom' })}
                    className="flex-1 font-mono text-xs uppercase px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: REAL-TIME COMPONENT PREVIEW */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Eye size={16} style={{ color: brand.primaryColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Live Real-Time Component Preview
              </h3>
            </div>

            <div className="mt-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* Active Navigation Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Active Navigation Item</span>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    <Sparkles size={15} />
                    <span>Selected Menu Link</span>
                  </div>
                </div>

                {/* Primary Button Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Primary Button</span>
                  <div>
                    <Button variant="primary" size="sm" className="w-full">
                      Primary Action CTA
                    </Button>
                  </div>
                </div>

                {/* Outline Button Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Outline Button</span>
                  <div>
                    <Button variant="outline" size="sm" className="w-full">
                      Outline Action
                    </Button>
                  </div>
                </div>

                {/* Dynamic Badges */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Badges & Accents</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{
                        backgroundColor: `${brand.accentColor}1A`,
                        color: brand.accentColor,
                        border: `1px solid ${brand.accentColor}40`,
                      }}
                    >
                      Accent Badge
                    </span>
                    <span
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{
                        backgroundColor: `${brand.coralColor}1A`,
                        color: brand.coralColor,
                        border: `1px solid ${brand.coralColor}40`,
                      }}
                    >
                      Alert Tag
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={handleResetAll}
            >
              Reset All to Defaults
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Check size={14} />}
              onClick={() => showToast('Branding settings saved & synchronized!')}
            >
              Save Branding Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
