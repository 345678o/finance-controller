import { Outlet } from "react-router-dom";
import TopNav from "@/components/common/TopNav";
import BottomNav from "@/components/common/BottomNav";
import useAndroidBackButton from "@/hooks/useAndroidBackButton";

export default function AppShell() {
  useAndroidBackButton();

  return (
    <div
      className="min-h-[100svh] flex flex-col safe-x"
      style={{ background: "var(--t-bg)" }}
    >
      <TopNav />

      <main className="flex-1 mx-auto w-full max-w-app safe-top px-5 md:px-8 lg:px-10 pt-4 md:pt-6 pb-28 md:pb-12">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
