import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BrandSettings {
  logoUrl: string;
  logoHeight: number;
  companyName: string;
  tagline: string;
  primaryColor: string;
  deepColor: string;
  accentColor: string;
  coralColor: string;
  presetId: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  primary: string;
  deep: string;
  accent: string;
  coral: string;
  description: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'kibo-purple',
    name: 'KIBO Classic Purple',
    primary: '#690BA8',
    deep: '#340771',
    accent: '#E91E63',
    coral: '#F06A64',
    description: 'Original KIBO360 signature royal purple and vibrant magenta',
  },
  {
    id: 'ocean-sapphire',
    name: 'Ocean Sapphire',
    primary: '#0284C7',
    deep: '#0369A1',
    accent: '#06B6D4',
    coral: '#F59E0B',
    description: 'Crisp corporate blue and cyan with warm amber alerts',
  },
  {
    id: 'emerald-royalty',
    name: 'Emerald Royalty',
    primary: '#059669',
    deep: '#064E3B',
    accent: '#10B981',
    coral: '#F97316',
    description: 'Prestigious botanical emerald green and rich forest depth',
  },
  {
    id: 'crimson-ruby',
    name: 'Crimson Ruby',
    primary: '#DC2626',
    deep: '#881337',
    accent: '#E11D48',
    coral: '#EA580C',
    description: 'Bold publishing scarlet with deep velvet wine accents',
  },
  {
    id: 'midnight-indigo',
    name: 'Midnight Indigo',
    primary: '#4F46E5',
    deep: '#312E81',
    accent: '#7C3AED',
    coral: '#F43F5E',
    description: 'Modern high-tech indigo with violet neon accents',
  },
  {
    id: 'nordic-teal',
    name: 'Nordic Teal',
    primary: '#0D9488',
    deep: '#115E59',
    accent: '#14B8A6',
    coral: '#E11D48',
    description: 'Sophisticated deep sea teal with clean mint highlights',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    primary: '#D97706',
    deep: '#78350F',
    accent: '#F59E0B',
    coral: '#DC2626',
    description: 'Warm gold and heritage bronze for classical book imprints',
  },
];

export const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  logoUrl: '/kibo360-logo.png',
  logoHeight: 36,
  companyName: 'Apex Educational Publishers',
  tagline: 'Publishing ERP',
  primaryColor: '#690BA8',
  deepColor: '#340771',
  accentColor: '#E91E63',
  coralColor: '#F06A64',
  presetId: 'kibo-purple',
};

const STORAGE_KEY = 'kibo360_brand_settings';

interface BrandContextType {
  brand: BrandSettings;
  updateBrand: (settings: Partial<BrandSettings>) => void;
  applyPreset: (presetId: string) => void;
  uploadLogo: (file: File) => Promise<string>;
  resetToDefault: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

// Helper to calculate lighter tint / alpha
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return `rgba(105, 11, 168, ${alpha})`;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper to inject CSS variables into document root
function applyCssVariables(settings: BrandSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--brand-primary', settings.primaryColor);
  root.style.setProperty('--brand-primary-light', hexToRgba(settings.primaryColor, 0.08));
  root.style.setProperty('--brand-primary-ring', hexToRgba(settings.primaryColor, 0.3));
  root.style.setProperty('--brand-deep', settings.deepColor);
  root.style.setProperty('--brand-accent', settings.accentColor);
  root.style.setProperty('--brand-accent-light', hexToRgba(settings.accentColor, 0.08));
  root.style.setProperty('--brand-coral', settings.coralColor);
  root.style.setProperty('--brand-coral-light', hexToRgba(settings.coralColor, 0.08));
}

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<BrandSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_BRAND_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_BRAND_SETTINGS;
  });

  useEffect(() => {
    applyCssVariables(brand);
  }, [brand]);

  const updateBrand = (newSettings: Partial<BrandSettings>) => {
    setBrand((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save brand settings:', err);
      }
      applyCssVariables(updated);
      return updated;
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = BRAND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    updateBrand({
      presetId,
      primaryColor: preset.primary,
      deepColor: preset.deep,
      accentColor: preset.accent,
      coralColor: preset.coral,
    });
  };

  const uploadLogo = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Selected file must be an image'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        updateBrand({ logoUrl: dataUrl });
        resolve(dataUrl);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setBrand(DEFAULT_BRAND_SETTINGS);
    applyCssVariables(DEFAULT_BRAND_SETTINGS);
  };

  return (
    <BrandContext.Provider
      value={{
        brand,
        updateBrand,
        applyPreset,
        uploadLogo,
        resetToDefault,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
