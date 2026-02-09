'use client'
import useAuth from "@/hooks/useAuth";
import React, { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { restoreAuth, isRestoring } = useAuth();

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  if (isRestoring) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
