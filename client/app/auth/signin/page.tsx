'use client'
import SignInForm from "@/components/pages/auth/SignInForm";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

export default function SignInPage() {
    const { isAuthenticated, isRestoring, restoreAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && isRestoring) {
      restoreAuth();
    }
  }, [isAuthenticated, isRestoring, restoreAuth]);
  return (
    <div className="p-5 md:p-10">
      <div className="max-w-2xl mx-auto bg-babyshopWhite p-5 md:p-10 flex flex-col items-center rounded-md border shadow">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-1">Sign In</h3>
          <p>
            Login to access{" "}
            <span className="text-babyshopSky font-medium">Babaymart</span>
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}