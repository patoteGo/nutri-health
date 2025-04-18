"use client";
import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => (
  <header className="w-full flex justify-end max-w-md mx-auto py-2">
    <LanguageSwitcher />
  </header>
);

export default Header;
