"use client";
import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react"; // For authentication actions
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User as UserIcon } from "lucide-react"; // fallback icon
import Image from "next/image";


import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// Helper to convert segment to readable label
function segmentToLabel(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

const Header: React.FC = () => {
  const pathname = usePathname() ?? "/";
  const segments = typeof pathname === "string" ? pathname.split("/").filter(Boolean) : [];
  let pathSoFar = "";
  const { data: session, status } = useSession(); // Get session info

  return (
    <header className="w-full flex justify-between gap-2 max-w-md mx-auto py-3 px-4 sm:px-6 items-center">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.length > 0 && <BreadcrumbSeparator />}
          {segments.map((segment, idx) => {
            pathSoFar += `/${segment}`;
            const isLast = idx === segments.length - 1;
            return (
              <React.Fragment key={segment + idx}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{segmentToLabel(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={pathSoFar}>{segmentToLabel(segment)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {/* Language Switcher and Login Button aligned right */}
      <div className="flex justify-end items-center gap-2">
        <LanguageSwitcher />
        {/* Show Login button if not authenticated */}
        {status === "unauthenticated" && (
          <Button
            variant="outline"
            onClick={() => signIn()}
            data-testid="login-button"
          >
            Login
          </Button>
        )}
        {/* Show profile avatar and dropdown if authenticated */}
        {status === "authenticated" && session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full border border-muted-foreground w-9 h-9 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="profile-avatar"
                aria-label="Profile menu"
              >
                {session.user.image ? (
  <Image
    src={session.user.image}
    alt={session.user.name || session.user.email || "Profile"}
    width={32}
    height={32}
    className="w-8 h-8 rounded-full object-cover"
    priority
  />
) : (
  <UserIcon className="w-6 h-6 text-muted-foreground" />
)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuLabel>
                {session.user.name || session.user.email || "Profile"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                data-testid="signout-button"
                className="cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
