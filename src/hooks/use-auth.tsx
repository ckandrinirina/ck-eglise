"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "fr";

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  const logout = async () => {
    // Use localized path for logout redirect
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  const isAdmin = session?.user?.role === "admin";

  return {
    user,
    isAdmin,
    isAuthenticated,
    isLoading,
    logout,
  };
};
