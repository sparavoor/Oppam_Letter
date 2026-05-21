import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminLoginForm from '@/components/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // 1. Strict Cryptographic Verification of current session on server-side
  const session = await getAdminSession();
  
  if (session) {
    redirect('/admin');
  }

  // 2. Render client-side login form
  return <AdminLoginForm />;
}
