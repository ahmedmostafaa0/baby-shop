"use client";

import useAuth from "@/hooks/useAuth";
import { User } from "lucide-react";
import Link from "next/link";
import React from "react";

const UserButton = () => {
  const { isAuthenticated, user } = useAuth();


  return (
    <Link
      href={isAuthenticated && user ? "/user/profile" : "/auth/signin"}
      className="flex items-center gap-2 group hover:text-babyshopSky hoverEffect"
    >
      {isAuthenticated && user ? (
        <span className="w-10 h-10 border rounded-full p-1 group-hover:border-babyshopSky hoverEffect">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="userImage"
              className="h-full w-full rounded-full object-contain"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
              {user.name?.slice(0,3).toUpperCase() || "?"}
            </div>
          )}
        </span>
      ) : (
        <User size={30} />
      )}
      <span>
        <p className="text-xs font-medium">Welcome</p>
        <p className="font-semibold text-sm">
          {isAuthenticated && user
            ? user.name || "My Profile"
            : "Sign in / Register"}
        </p>
      </span>
    </Link>
  );
};

export default UserButton;