"use client";
import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
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

  return (
    <header className="w-full flex justify-between gap-2 max-w-md mx-auto py-3 items-center">
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
      {/* Language Switcher aligned right */}
      <div className="flex justify-end items-center">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
