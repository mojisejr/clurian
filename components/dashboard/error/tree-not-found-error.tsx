import React from 'react';
import { Button } from '@/components/ui/button';

interface TreeNotFoundErrorProps {
  onBackToDashboard: () => void;
}

/**
 * Component displayed when a treeId is provided but no matching tree is found
 */
export function TreeNotFoundError({ onBackToDashboard }: TreeNotFoundErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto">
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2 text-red-600">
          ไม่พบข้อมูลต้นไม้
        </h3>

        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          ไม่พบต้นไม้ที่ตรงกับลิงก์ที่คุณเข้าถึง
          <br />
          ต้นไม้อาจถูกลบไปแล้วหรือมีการพิมพ์ผิด
        </p>

        <Button
          onClick={onBackToDashboard}
          className="px-6"
        >
          กลับหน้าหลัก
        </Button>
      </div>
    </div>
  );
}