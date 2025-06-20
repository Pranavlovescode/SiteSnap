"use client";

import { useState } from "react";
import { Users, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-center">
      <div className="min-h-screen bg-white/10 flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-black/60 backdrop-blur-md text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SiteSnap</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Sidebar - Mobile */}
        {isMobileMenuOpen && (
          <aside className="lg:hidden bg-black/60 backdrop-blur-md text-white p-6">
            <nav className="space-y-2">
              <NavLink
                href="/dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                href="/dashboard/teams"
                icon={<Users className="w-5 h-5" />}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Teams
              </NavLink>
              <NavLink
                href="/dashboard/settings"
                icon={<Settings className="w-5 h-5" />}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </NavLink>
            </nav>
            <div className="mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
          </aside>
        )}

        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-black/60 backdrop-blur-md text-white p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">SiteSnap</h1>
          </div>
          <nav className="space-y-2">
            <NavLink
              href="/dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
            >
              Dashboard
            </NavLink>
            <NavLink
              href="/dashboard/teams"
              icon={<Users className="w-5 h-5" />}
            >
              Teams
            </NavLink>
            <NavLink
              href="/dashboard/settings"
              icon={<Settings className="w-5 h-5" />}
            >
              Settings
            </NavLink>
          </nav>
          <div className="mx-auto absolute bottom-5 w-full p-2">
            <Button
              variant="ghost"
              className="text-white flex justify-center items-center my-3 text-md"
              onClick={() => signOut()}
            >
              <img
                src={
                  (session?.user.image as string ) || "https://github.com/shadcn.png"
                }
                alt="avatar"
                className="space-x-3 w-8 h-8 rounded-full"
              />
              <span>Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, icon, children, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export default Dashboard;
