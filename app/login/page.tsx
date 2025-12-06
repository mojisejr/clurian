"use client";

import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "line",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F5F7F5] text-[#1a2e22]">
      <Card className="w-full max-w-sm border-[#e0e9e3] shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-32 h-32 mx-auto mb-4 relative group">
            <div className="absolute inset-0 bg-[#e0eff0] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-md hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo-1.png"
                alt="Clurian Logo"
                width={128}
                height={128}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#26623d] tracking-tight">
            Clurian
          </h1>
        </CardHeader>
        <CardContent className="text-center space-y-8 pt-2">
          <p className="text-[#658571] text-sm font-medium">
            ระบบบริหารจัดการสวนทุเรียนอัจฉริยะ
          </p>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#06C755] hover:bg-[#05b64d] text-white font-bold h-14 text-lg rounded-xl shadow-lg transition-all transform active:scale-95"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <div className="bg-white text-[#06C755] w-7 h-7 rounded flex items-center justify-center font-black text-sm mr-2">
                  L
                </div>
                เข้าสู่ระบบด้วย LINE
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-[#e0e9e3] pt-6 mt-2">
          <p className="text-xs text-[#658571] text-center">
            สำหรับเจ้าของสวนและทีมงานดูแลสวน<br />
            v1.1.0 (Next.js)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
