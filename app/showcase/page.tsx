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
}

const GlassCard = ({ children, className = '', onClick }: GlassCardProps) => {
  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
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
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const GlassButton = ({
  children,
  variant = 'solid',
  onClick,
  className = '',
  disabled = false,
  icon: Icon
}: GlassButtonProps) => {
  const getStyle = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.9)',
          color: '#ffffff',
          border: 'none'
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)'
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
  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff'
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
  const getStyle = () => {
    switch (status) {
      case 'healthy':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          color: '#bbf7d0',
          border: '1px solid rgba(74, 222, 128, 0.3)'
        };
      case 'sick':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#fecaca',
          border: '1px solid rgba(248, 113, 113, 0.3)'
        };
      case 'dead':
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          color: '#e5e7eb',
          border: '1px solid rgba(156, 163, 175, 0.3)'
        };
      case 'archived':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          color: '#dbeafe',
          border: '1px solid rgba(96, 165, 250, 0.3)'
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

  const backgroundStyle = {
    background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.08))'
  };

  const glassTextureStyle = {
    backdropFilter: 'blur(100px)',
    WebkitBackdropFilter: 'blur(100px)'
  };

  const selectStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff'
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Modern Liquid Glass UI
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
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
          <GlassButton variant="solid" icon={Plus}>
            เพิ่มต้นไม้
          </GlassButton>
          <GlassButton variant="glass" icon={Droplets}>
            บันทึกกิจกรรม
          </GlassButton>
          <GlassButton variant="outline" icon={Filter}>
            ตัวกรอง
          </GlassButton>
          <GlassButton onClick={() => setShowModal(true)}>
            เปิด Modal
          </GlassButton>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Trees Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TreePine className="w-6 h-6" />
              รายการต้นไม้
            </h2>
            <div className="space-y-3">
              {mockTrees.map((tree) => (
                <TreeCardGlass
                  key={tree.id}
                  tree={tree}
                  onClick={() => console.log('Clicked tree:', tree.code)}
                />
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              กิจกรรมล่าสุด
            </h2>
            <div className="space-y-3">
              {mockActivities.map((activity) => (
                <ActivityCardGlass key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ต้นไม้ทั้งหมด', value: '156', icon: TreePine, color: '#4ade80' },
            { label: 'สุขภาพดี', value: '142', icon: CheckCircle, color: '#60a5fa' },
            { label: 'กำลังป่วย', value: '8', icon: AlertCircle, color: '#facc15' },
            { label: 'กิจกรรมวันนี้', value: '12', icon: Calendar, color: '#c084fc' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} className="p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm opacity-70">{stat.label}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* Form Demo */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">ฟอร์มตัวอย่าง</h2>
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