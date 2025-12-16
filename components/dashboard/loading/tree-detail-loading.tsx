import React from 'react';

/**
 * Loading component shown when accessing a tree detail page directly via deep link
 */
export function TreeDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>

        <h3 className="text-lg font-medium mb-2">
          กำลังโหลดข้อมูลต้นไม้...
        </h3>

        <p className="text-gray-600 text-sm max-w-xs mx-auto">
          กรุณารอสักครู่ เรากำลังดึงข้อมูลต้นไม้ที่คุณเลือก
        </p>
      </div>
    </div>
  );
}