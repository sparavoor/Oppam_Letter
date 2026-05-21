import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  LayoutDashboard, 
  LogOut, 
  User, 
  FileText,
  Home
} from 'lucide-react';
import { getAdminSession } from '@/lib/auth';
import { logoutAdminAction } from '@/app/actions';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Strict double-check auth on server-side
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 md:h-screen sticky top-0 z-20">
        
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-600/10">
              ഒ
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                ഒപ്പം (Oppam)
              </h2>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">
                Admin Console
              </p>
            </div>
          </div>
          <Link 
            href="/"
            title="Go to Public Portal" 
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors duration-200"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all duration-200"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* User Session Profile Card */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/30 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {session.username}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {session.email}
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-950/40 text-slate-450 font-semibold rounded-lg text-xs tracking-wider transition-all duration-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out session</span>
            </button>
          </form>
        </div>

      </aside>

      {/* Main Administrative Work Area */}
      <main className="flex-1 flex flex-col md:h-screen md:overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
