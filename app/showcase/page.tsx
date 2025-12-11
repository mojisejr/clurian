"use client";

import React, { useState } from 'react';
import {
  TreePine,
  Droplets,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Home,
  Settings
} from 'lucide-react';

 
// Theme Colors - Converted from OKLCH to RGB for inline styles
const theme = {
  // Light mode colors
  light: {
    primary: { rgb: 'rgb(64, 122, 81)', rgba: 'rgba(64, 122, 81, 0.9)' },      // Deep Forest Green
    primaryForeground: { rgb: 'rgb(255, 255, 255)', rgba: 'rgba(255, 255, 255, 0.9)' },
    secondary: { rgb: 'rgb(219, 234, 224)', rgba: 'rgba(219, 234, 224, 0.9)' }, // Sage Green
    secondaryForeground: { rgb: 'rgb(85, 107, 94)', rgba: 'rgba(85, 107, 94, 0.9)' },
    background: { rgb: 'rgb(250, 249, 247)', rgba: 'rgba(250, 249, 247, 0.95)' }, // Warm Stone
    foreground: { rgb: 'rgb(62, 78, 68)', rgba: 'rgba(62, 78, 68, 0.9)' },
    accent: { rgb: 'rgb(243, 223, 211)', rgba: 'rgba(243, 223, 211, 0.9)' },   // Muted Terracotta
    accentForeground: { rgb: 'rgb(124, 84, 68)', rgba: 'rgba(124, 84, 68, 0.9)' },
    success: { rgb: 'rgb(178, 222, 190)', rgba: 'rgba(178, 222, 190, 0.9)' }, // Light Green
    warning: { rgb: 'rgb(248, 213, 156)', rgba: 'rgba(248, 213, 156, 0.9)' }, // Orange
    destructive: { rgb: 'rgb(225, 122, 116)', rgba: 'rgba(225, 122, 116, 0.9)' }, // Red
    border: { rgb: 'rgb(221, 229, 225)', rgba: 'rgba(221, 229, 225, 0.3)' },      // Light Border
    muted: { rgb: 'rgb(244, 247, 245)', rgba: 'rgba(244, 247, 245, 0.5)' },     // Muted background
    mutedForeground: { rgb: 'rgb(107, 114, 128)', rgba: 'rgba(107, 114, 128, 0.9)' }, // Muted text
  },
  // Dark mode colors
  dark: {
    primary: { rgb: 'rgb(174, 213, 190)', rgba: 'rgba(174, 213, 190, 0.9)' },    // Light Forest Green
    primaryForeground: { rgb: 'rgb(45, 56, 50)', rgba: 'rgba(45, 56, 50, 0.9)' },
    secondary: { rgb: 'rgb(68, 91, 80)', rgba: 'rgba(68, 91, 80, 0.9)' },       // Dark Sage
    secondaryForeground: { rgb: 'rgb(232, 242, 236)', rgba: 'rgba(232, 242, 236, 0.9)' },
    background: { rgb: 'rgb(44, 56, 50)', rgba: 'rgba(44, 56, 50, 0.95)' },      // Dark Background
    foreground: { rgb: 'rgb(241, 245, 242)', rgba: 'rgba(241, 245, 242, 0.9)' },
    accent: { rgb: 'rgb(198, 168, 148)', rgba: 'rgba(198, 168, 148, 0.9)' },     // Dark Terracotta
    accentForeground: { rgb: 'rgb(233, 239, 234)', rgba: 'rgba(233, 239, 234, 0.9)' },
    success: { rgb: 'rgb(158, 195, 170)', rgba: 'rgba(158, 195, 170, 0.9)' },     // Dark Success
    warning: { rgb: 'rgb(219, 180, 120)', rgba: 'rgba(219, 180, 120, 0.9)' },     // Dark Warning
    destructive: { rgb: 'rgb(207, 102, 96)', rgba: 'rgba(207, 102, 96, 0.9)' },    // Dark Red
    border: { rgb: 'rgb(76, 91, 83)', rgba: 'rgba(76, 91, 83, 0.3)' },           // Dark Border
    muted: { rgb: 'rgb(68, 91, 80)', rgba: 'rgba(68, 91, 80, 0.3)' },             // Dark Muted
    mutedForeground: { rgb: 'rgb(156, 163, 175)', rgba: 'rgba(156, 163, 175, 0.9)' } // Dark Muted text
  }
};

// Mock Data
const mockTrees = [
  {
    id: '1',
    code: 'T-001',
    zone: 'A',
    variety: 'หมอนทอง',
    status: 'healthy',
    plantedDate: '2023-01-15',
    lastActivity: '2024-12-08',
    healthScore: 95
  },
  {
    id: '2',
    code: 'T-002',
    zone: 'B',
    variety: 'ชันสุวรรณ',
    status: 'sick',
    plantedDate: '2023-02-20',
    lastActivity: '2024-12-09',
    healthScore: 65
  },
  {
    id: '3',
    code: 'T-003',
    zone: 'A',
    variety: 'หมอนทอง',
    status: 'healthy',
    plantedDate: '2023-03-10',
    lastActivity: '2024-12-07',
    healthScore: 88
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'BATCH',
    targetZone: 'A',
    action: 'ให้ปุ๋ย',
    date: '2024-12-09',
    status: 'COMPLETED',
    note: 'ใช้ปุ๋ย NPK 16-16-16'
  },
  {
    id: '2',
    type: 'INDIVIDUAL',
    treeCode: 'T-002',
    action: 'รักษาโรค',
    date: '2024-12-08',
    status: 'IN_PROGRESS',
    note: 'พบโรครากเน่า'
  },
  {
    id: '3',
    type: 'BATCH',
    targetZone: 'B',
    action: 'รดน้ำ',
    date: '2024-12-10',
    status: 'SCHEDULED',
    note: 'รดน้ำเช้ามืด'
  }
];

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
}

const GlassCard = ({ children, className = '', onClick, variant = 'default' }: GlassCardProps) => {
  // Detect dark mode
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Define colors based on variant
  const getCardColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: `rgba(${currentTheme.primary.rgb.slice(4, -1)}, 0.1)`,
          border: `rgba(${currentTheme.primary.rgb.slice(4, -1)}, 0.2)`
        };
      case 'secondary':
        return {
          bg: `rgba(${currentTheme.secondary.rgb.slice(4, -1)}, 0.1)`,
          border: `rgba(${currentTheme.secondary.rgb.slice(4, -1)}, 0.2)`
        };
      case 'accent':
        return {
          bg: `rgba(${currentTheme.accent.rgb.slice(4, -1)}, 0.1)`,
          border: `rgba(${currentTheme.accent.rgb.slice(4, -1)}, 0.2)`
        };
      default:
        return {
          bg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)',
          border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
        };
    }
  };

  const colors = getCardColors();

  const cardStyle = {
    backgroundColor: colors.bg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${colors.border}`
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl shadow-2xl
        hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]
        active:scale-[0.98] transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={cardStyle}
    >
      {/* Glass texture overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent)'
        }}
      />
      {children}
    </div>
  );
};

// Glass Button Component
interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'solid' | 'glass' | 'outline';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const GlassButton = ({
  children,
  variant = 'solid',
  color = 'primary',
  onClick,
  className = '',
  disabled = false,
  icon: Icon
}: GlassButtonProps) => {
  // Detect dark mode
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const getStyle = () => {
    const themeColor = currentTheme[color as keyof typeof currentTheme];

    switch (variant) {
      case 'solid':
        return {
          backgroundColor: themeColor.rgba,
          color: color === 'primary' ? currentTheme.primaryForeground.rgb : '#ffffff',
          border: 'none',
          opacity: disabled ? 0.5 : 1
        };
      case 'glass':
        return {
          backgroundColor: `rgba(${themeColor.rgb.slice(4, -1)}, 0.2)`,
          color: currentTheme.foreground.rgb,
          border: `1px solid ${themeColor.rgba}`,
          opacity: disabled ? 0.5 : 1
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: themeColor.rgb,
          border: `1px solid ${themeColor.rgb}`,
          opacity: disabled ? 0.5 : 1
        };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
        font-medium transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={getStyle()}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// Glass Input Component
interface GlassInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const GlassInput = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  className = ''
}: GlassInputProps) => {
  // Detect dark mode
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const inputStyle = {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    border: `1px solid ${currentTheme.border.rgba}`,
    color: currentTheme.foreground.rgb
  };

  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full rounded-xl px-4 py-2.5 placeholder-white/50
          focus:outline-none focus:ring-2 focus:ring-primary/50
          focus:border-primary/50 transition-all
          ${Icon ? 'pl-10' : ''}
          ${className}
        `}
        style={inputStyle}
      />
    </div>
  );
};

// Status Badge Glass Component
interface GlassBadgeProps {
  status: 'healthy' | 'sick' | 'dead' | 'archived';
  text: string;
}

const GlassBadge = ({ status, text }: GlassBadgeProps) => {
  // Detect dark mode
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const getStyle = () => {
    switch (status) {
      case 'healthy':
        return {
          backgroundColor: currentTheme.success.rgba,
          color: isDarkMode ? 'rgb(34, 59, 46)' : 'rgb(21, 128, 61)',
          border: `1px solid ${isDarkMode ? 'rgba(158, 195, 170, 0.5)' : 'rgba(178, 222, 190, 0.5)'}`
        };
      case 'sick':
        return {
          backgroundColor: currentTheme.destructive.rgba,
          color: isDarkMode ? 'rgb(64, 25, 23)' : 'rgb(185, 28, 28)',
          border: `1px solid ${isDarkMode ? 'rgba(207, 102, 96, 0.5)' : 'rgba(225, 122, 116, 0.5)'}`
        };
      case 'dead':
        return {
          backgroundColor: isDarkMode ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.2)',
          color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)',
          border: `1px solid ${isDarkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(209, 213, 219, 0.3)'}`
        };
      case 'archived':
        return {
          backgroundColor: currentTheme.accent.rgba,
          color: isDarkMode ? 'rgb(91, 67, 50)' : 'rgb(124, 58, 237)',
          border: `1px solid ${isDarkMode ? 'rgba(198, 168, 148, 0.5)' : 'rgba(243, 223, 211, 0.5)'}`
        };
      default:
        return {};
    }
  };

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        ...getStyle(),
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
};

// Tree Card Glass Component
interface TreeCardGlassProps {
  tree: {
    id: string;
    code: string;
    zone: string;
    variety: string;
    status: 'healthy' | 'sick' | 'dead' | 'archived';
    plantedDate: string;
    lastActivity: string;
    healthScore: number;
  };
  onClick: () => void;
}

const TreeCardGlass = ({ tree, onClick }: TreeCardGlassProps) => {
  const statusText = {
    healthy: 'สุขภาพดี',
    sick: 'ป่วย',
    dead: 'ตาย',
    archived: 'เก็บรักษา'
  };

  const healthBarStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)'
  };

  return (
    <GlassCard onClick={onClick} className="p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">{tree.code}</h3>
          <p className="text-sm opacity-70">โซน: {tree.zone} | {tree.variety}</p>
        </div>
        <GlassBadge status={tree.status} text={statusText[tree.status]} />
      </div>

      {/* Health Score */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="opacity-70">คะแนนสุขภาพ</span>
          <span className="text-white font-medium">{tree.healthScore}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={healthBarStyle}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${tree.healthScore}%`,
              backgroundColor: tree.healthScore > 80 ? 'rgba(74, 222, 128)' :
                               tree.healthScore > 50 ? 'rgba(250, 204, 21)' : 'rgba(239, 68, 68)'
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm opacity-60">
        <span>ปลูก: {tree.plantedDate}</span>
        <span>ล่าสุด: {tree.lastActivity}</span>
      </div>
    </GlassCard>
  );
};

// Activity Card Glass Component
interface ActivityCardGlassProps {
  activity: {
    id: string;
    type: 'BATCH' | 'INDIVIDUAL';
    targetZone?: string;
    treeCode?: string;
    action: string;
    date: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
    note: string;
  };
}

const ActivityCardGlass = ({ activity }: ActivityCardGlassProps) => {
  const getBadgeStyle = () => {
    switch (activity.status) {
      case 'COMPLETED':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          color: '#bbf7d0',
          border: '1px solid rgba(74, 222, 128, 0.3)'
        };
      case 'IN_PROGRESS':
        return {
          backgroundColor: 'rgba(250, 204, 21, 0.2)',
          color: '#fef3c7',
          border: '1px solid rgba(250, 204, 21, 0.3)'
        };
      case 'SCHEDULED':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          color: '#dbeafe',
          border: '1px solid rgba(96, 165, 250, 0.3)'
        };
      default:
        return {};
    }
  };

  const iconBgStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)'
  };

  const statusText = {
    COMPLETED: 'เสร็จสิ้น',
    IN_PROGRESS: 'กำลังดำเนินการ',
    SCHEDULED: 'กำหนดการ'
  };

  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={iconBgStyle}>
            {activity.type === 'BATCH' ? (
              <Droplets className="w-5 h-5 opacity-80" />
            ) : (
              <TreePine className="w-5 h-5 opacity-80" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-white">{activity.action}</h4>
            <p className="text-sm opacity-60">
              {activity.type === 'BATCH' ? `โซน ${activity.targetZone}` : activity.treeCode}
            </p>
          </div>
        </div>
        <span
          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
          style={{
            ...getBadgeStyle(),
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          {statusText[activity.status]}
        </span>
      </div>

      <p className="text-sm opacity-70">{activity.note}</p>

      <div className="flex items-center gap-2 text-sm opacity-50">
        <Calendar className="w-3 h-3" />
        {activity.date}
      </div>
    </GlassCard>
  );
};

// Glass Modal Demo
interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlassModal = ({ isOpen, onClose }: GlassModalProps) => {
  if (!isOpen) return null;

  const backdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={backdropStyle}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative max-w-md w-full">
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Glass Modal Demo</h2>
          <p className="opacity-70">
            นี่คือตัวอย่างของ Modal ที่ใช้ Glass Morphism effect
          </p>
          <div className="flex gap-2 justify-end">
            <GlassButton variant="outline" onClick={onClose}>
              ยกเลิก
            </GlassButton>
            <GlassButton onClick={onClose}>
              ตกลง
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Glass Navigation
interface GlassNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const GlassNav = ({ activeTab, onTabChange }: GlassNavProps) => {
  const tabs = [
    { id: 'dashboard', label: 'หน้าแรก', icon: Home },
    { id: 'trees', label: 'ต้นไม้', icon: TreePine },
    { id: 'activities', label: 'กิจกรรม', icon: Calendar },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings }
  ];

  return (
    <GlassCard className="p-2 mb-6">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default function ShowcasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const backgroundStyle = {
    background: isDarkMode
      ? `linear-gradient(to bottom right, ${currentTheme.primary.rgba}, ${currentTheme.secondary.rgba}, ${currentTheme.accent.rgba})`
      : `linear-gradient(to bottom right, ${currentTheme.primary.rgba}, ${currentTheme.secondary.rgba}, ${currentTheme.background.rgba})`
  };

  const glassTextureStyle = {
    backdropFilter: 'blur(100px)',
    WebkitBackdropFilter: 'blur(100px)'
  };

  const selectStyle = {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    border: `1px solid ${currentTheme.border.rgba}`,
    color: currentTheme.foreground.rgb
  };

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Base */}
        <div className="absolute inset-0" style={backgroundStyle} />

        {/* Moving Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob"
             style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }} />
        <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"
             style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }} />
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"
             style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }} />

        {/* Glass Texture */}
        <div className="absolute inset-0" style={glassTextureStyle} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 pb-24 md:pb-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: currentTheme.foreground.rgb }}>
            Modern Liquid Glass UI
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: currentTheme.mutedForeground.rgb, opacity: 0.8 }}>
            ตัวอย่างการออกแบบ UI แบบ Glass Morphism สำหรับระบบจัดการสวนทุเรียน
          </p>
        </div>

        {/* Glass Navigation */}
        <GlassNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Search and Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <GlassInput
            placeholder="ค้นหาต้นไม้..."
            value={searchTerm}
            onChange={setSearchTerm}
            icon={Search}
            className="md:col-span-2"
          />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            style={selectStyle}
          >
            <option value="all" style={{ backgroundColor: '#1f2937' }}>ทุกโซน</option>
            <option value="A" style={{ backgroundColor: '#1f2937' }}>โซน A</option>
            <option value="B" style={{ backgroundColor: '#1f2937' }}>โซน B</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <GlassButton variant="solid" color="primary" icon={Plus}>
            เพิ่มต้นไม้
          </GlassButton>
          <GlassButton variant="glass" color="secondary" icon={Droplets}>
            บันทึกกิจกรรม
          </GlassButton>
          <GlassButton variant="outline" color="accent" icon={Filter}>
            ตัวกรอง
          </GlassButton>
          <GlassButton variant="glass" onClick={() => setShowModal(true)}>
            เปิด Modal
          </GlassButton>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Trees Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.foreground.rgb }}>
              <TreePine className="w-6 h-6" />
              รายการต้นไม้
            </h2>
            <div className="space-y-3">
              {mockTrees.map((tree) => (
                <TreeCardGlass
                  key={tree.id}
                  tree={tree as TreeCardGlassProps['tree']}
                  onClick={() => console.log('Clicked tree:', tree.code)}
                />
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.foreground.rgb }}>
              <Calendar className="w-6 h-6" />
              กิจกรรมล่าสุด
            </h2>
            <div className="space-y-3">
              {mockActivities.map((activity) => (
                <ActivityCardGlass key={activity.id} activity={activity as ActivityCardGlassProps['activity']} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ต้นไม้ทั้งหมด', value: '156', icon: TreePine, color: 'primary' },
            { label: 'สุขภาพดี', value: '142', icon: CheckCircle, color: 'success' },
            { label: 'กำลังป่วย', value: '8', icon: AlertCircle, color: 'warning' },
            { label: 'กิจกรรมวันนี้', value: '12', icon: Calendar, color: 'accent' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} variant="secondary" className="p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme[stat.color as keyof typeof currentTheme].rgb }} />
                <div className="text-2xl font-bold" style={{ color: currentTheme.foreground.rgb }}>{stat.value}</div>
                <div className="text-sm" style={{ color: currentTheme.mutedForeground.rgb }}>{stat.label}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* Form Demo */}
        <GlassCard variant="accent" className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: currentTheme.foreground.rgb }}>ฟอร์มตัวอย่าง</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <GlassInput
              placeholder="รหัสต้นไม้"
              value=""
              onChange={() => {}}
            />
            <GlassInput
              placeholder="วันที่ปลูก"
              type="date"
              value=""
              onChange={() => {}}
            />
          </div>
          <div className="mt-4">
            <GlassInput
              placeholder="หมายเหตุ..."
              value=""
              onChange={() => {}}
            />
          </div>
        </GlassCard>
      </div>

      {/* Glass Modal */}
      <GlassModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}