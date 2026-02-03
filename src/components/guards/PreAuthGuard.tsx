'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * PreAuthGuard - Redirects users in pre-auth state to 2FA verification
 * 
 * When a user has logged in but hasn't completed 2FA verification,
 * they are in "pre-auth" state. This guard ensures:
 * 1. Pre-auth users can ONLY access /login/2fa
 * 2. Any attempt to navigate elsewhere redirects to /login/2fa
 * 3. Once 2FA is complete, normal navigation resumes
 */
interface PreAuthGuardProps {
  children: React.ReactNode;
}

const ALLOWED_PREAUTH_PATHS = ['/login/2fa', '/login/recovery'];

export function PreAuthGuard({ children }: PreAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isPreAuth, preAuthToken } = useAuth();

  useEffect(() => {
    // If user is in pre-auth state and trying to access restricted pages
    if (isPreAuth && preAuthToken) {
      const isAllowedPath = ALLOWED_PREAUTH_PATHS.some(path => pathname.startsWith(path));
      
      if (!isAllowedPath) {
        // Redirect to 2FA page
        router.replace('/login/2fa');
      }
    }
  }, [isPreAuth, preAuthToken, pathname, router]);

  return <>{children}</>;
}

export default PreAuthGuard;
