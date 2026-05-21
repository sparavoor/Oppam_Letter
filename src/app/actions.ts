'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { signJWT, COOKIE_NAME } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Types for actions
export interface FormState {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    mobile?: string[];
    location?: string[];
    subject?: string[];
    letter_content?: string[];
    login?: string[];
  };
  referenceId?: string;
}

// 1. Submit Letter Server Action
export async function submitLetterAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const name = formData.get('name') as string;
  const mobile = formData.get('mobile') as string;
  const location = formData.get('location') as string;
  const subject = formData.get('subject') as string;
  const letter_content = formData.get('letter_content') as string;

  // Validation
  const errors: NonNullable<FormState['errors']> = {};
  let hasErrors = false;

  if (!name || name.trim().length === 0) {
    errors.name = ['Full name is required.'];
    hasErrors = true;
  } else if (name.trim().length > 100) {
    errors.name = ['Name must be less than 100 characters.'];
    hasErrors = true;
  }

  // Mobile check: only digits, 10 to 15 length
  const mobileRegex = /^[0-9+\s-]{10,15}$/;
  if (!mobile || mobile.trim().length === 0) {
    errors.mobile = ['Mobile number is required.'];
    hasErrors = true;
  } else if (!mobileRegex.test(mobile.trim())) {
    errors.mobile = ['Please enter a valid mobile number (10 to 15 digits).'];
    hasErrors = true;
  }

  if (!location || location.trim().length === 0) {
    errors.location = ['Location/Place is required.'];
    hasErrors = true;
  }

  if (!letter_content || letter_content.trim().length < 10) {
    errors.letter_content = ['Letter content must be at least 10 characters long.'];
    hasErrors = true;
  }

  if (hasErrors) {
    return {
      success: false,
      message: 'Submission failed. Please fix validation errors.',
      errors,
    };
  }

  try {
    // Generate secure, unique Reference ID
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Alphanumeric characters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded similar looking chars like I, O, 0, 1
    let randomStr = '';
    for (let i = 0; i < 4; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const referenceId = `OP-${dateStr}-${randomStr}`;

    // Insert into database via parameterized query (SQL Injection Protection)
    await db`
      INSERT INTO letters (reference_id, name, mobile, location, subject, letter_content)
      VALUES (${referenceId}, ${name.trim()}, ${mobile.trim()}, ${location.trim()}, ${subject ? subject.trim() : null}, ${letter_content.trim()})
    `;

    return {
      success: true,
      message: 'Your letter has been submitted successfully.',
      referenceId,
    };
  } catch (error) {
    console.error('Error inserting letter:', error);
    return {
      success: false,
      message: 'An unexpected database error occurred. Please try again later.',
    };
  }
}

// 2. Admin Login Server Action
export async function loginAdminAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const usernameOrEmail = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!usernameOrEmail || !password) {
    return {
      success: false,
      message: 'Please provide both username/email and password.',
      errors: {
        login: ['Username/Email and Password are required.'],
      },
    };
  }

  try {
    // Search user
    const users = await db`
      SELECT * FROM users WHERE email = ${usernameOrEmail.trim()} OR username = ${usernameOrEmail.trim()} LIMIT 1
    `;
    const user = users[0] as any;

    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials. Please try again.',
        errors: {
          login: ['The username or password you entered is incorrect.'],
        },
      };
    }

    // Verify hashed password
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return {
        success: false,
        message: 'Invalid credentials. Please try again.',
        errors: {
          login: ['The username or password you entered is incorrect.'],
        },
      };
    }

    // Sign JWT Token
    const token = signJWT({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Set secure HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

  } catch (error) {
    console.error('Error logging in admin:', error);
    return {
      success: false,
      message: 'An unexpected authentication error occurred.',
    };
  }

  // Redirect to admin panel
  redirect('/admin');
}

// 3. Admin Logout Server Action
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/admin/login');
}

// 4. Update Letter Status Action
export async function updateLetterStatusAction(id: number, status: 'Pending' | 'Reviewed' | 'Resolved'): Promise<boolean> {
  // Simple check for auth session before performing mutating actions
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const result = await db`UPDATE letters SET status = ${status} WHERE id = ${id} RETURNING id`;
    return result.length > 0;
  } catch (error) {
    console.error('Error updating letter status:', error);
    return false;
  }
}

// 5. Delete Letter Action
export async function deleteLetterAction(id: number): Promise<boolean> {
  // Simple check for auth session before performing mutating actions
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const result = await db`DELETE FROM letters WHERE id = ${id} RETURNING id`;
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting letter:', error);
    return false;
  }
}
