"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Leaf, ChevronDown, CheckCircle, PlusCircle } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrchard } from "@/components/providers/orchard-provider";
import { Button } from "./ui/button";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { orchards, currentOrchardId, currentOrchard, setCurrentOrchardId, addOrchard } = useOrchard();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const handleCreateOrchard = () => {
    const name = prompt("ตั้งชื่อสวนใหม่ของคุณ:");
    if (name) {
        addOrchard(name);
    }
  };

  // Only show nav if user is authenticated and not on login page
  if (pathname === "/login") return null;

  return (
    <nav className="bg-primary text-primary-foreground px-4 py-3 shadow-md sticky top-0 z-50 no-print">
      <div className="max-w-md mx-auto flex justify-between items-center md:max-w-6xl">
        <div className="flex items-center gap-2">
            {/* Logo Placeholder */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                <Leaf className="text-secondary" size={16} />
            </div>

            {/* Orchard Selector */}
            {orchards.length > 0 && currentOrchard ? (
              <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-bold text-lg hover:opacity-80 outline-none">
                      {currentOrchard.name}
                      <ChevronDown size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel className="text-muted-foreground text-xs">เลือกสวนของคุณ</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {orchards.map((o) => (
                          <DropdownMenuItem 
                              key={o.id} 
                              onClick={() => setCurrentOrchardId(o.id)}
                              className="flex justify-between items-center cursor-pointer"
                          >
                              <span className={cn(currentOrchardId === o.id && "font-bold text-primary")}>{o.name}</span>
                              {currentOrchardId === o.id && <CheckCircle size={14} className="text-primary" />}
                          </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleCreateOrchard} className="text-primary font-medium cursor-pointer">
                          <PlusCircle size={14} className="mr-2" />
                          เพิ่มสวนใหม่
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <span className="font-bold text-lg opacity-80">Clurian</span>
            )}
        </div>

        <div className="flex items-center gap-2">
            <div className="text-xs bg-black/20 px-2 py-1 rounded border border-white/20">Admin</div>
            <button 
                onClick={handleLogout} 
                className="text-primary-foreground hover:opacity-80 transition-opacity"
                aria-label="ออกจากระบบ"
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </nav>
  );
}
