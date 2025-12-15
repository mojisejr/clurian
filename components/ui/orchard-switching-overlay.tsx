import { RotateCw } from "lucide-react";

interface OrchardSwitchingOverlayProps {
  isVisible: boolean;
  orchardName?: string;
}

export function OrchardSwitchingOverlay({ isVisible, orchardName }: OrchardSwitchingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
        <div className="flex items-center justify-center mb-4">
          <RotateCw size={24} className="animate-spin text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-center mb-2">
          กำลังเปลี่ยนสวน
        </h3>
        <p className="text-gray-600 text-center text-sm">
          {orchardName ? `กำลังโหลดข้อมูลสำหรับ "${orchardName}"` : 'กำลังโหลดข้อมูลสวนใหม่...'}
        </p>
        <p className="text-gray-500 text-center text-xs mt-2">
          กรุณารอสักครู่
        </p>
      </div>
    </div>
  );
}