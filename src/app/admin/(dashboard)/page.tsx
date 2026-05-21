import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import LettersDashboard from '@/components/LettersDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 1. Strict Server Auth Validation
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  // 2. Fetch submissions directly from Neon PostgreSQL database in the Server Component
  let letters: any[] = [];
  try {
    letters = await db`SELECT * FROM letters ORDER BY id DESC` as any[];
  } catch (error) {
    console.error('Error reading letters from Neon PostgreSQL database:', error);
  }

  // Map database entries to match types exactly
  const formattedLetters = letters.map(letter => ({
    id: letter.id,
    reference_id: letter.reference_id,
    name: letter.name,
    mobile: letter.mobile,
    location: letter.location,
    subject: letter.subject,
    letter_content: letter.letter_content,
    status: letter.status as 'Pending' | 'Reviewed' | 'Resolved',
    created_at: letter.created_at
  }));

  // 3. Render high-fidelity dashboard client component
  return <LettersDashboard initialLetters={formattedLetters} />;
}
