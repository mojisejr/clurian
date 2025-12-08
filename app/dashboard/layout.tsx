import { NavBar } from "@/components/nav-bar";
import { OrchardProvider } from "@/components/providers/orchard-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrchardProvider>
      <NavBar />
      {children}
    </OrchardProvider>
  );
}
