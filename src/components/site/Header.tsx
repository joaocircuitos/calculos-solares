"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Site Header
 *
 * Provides a reusable top navigation bar used across all pages.
 * - Left: brand/logo linking to the homepage
 * - Right: primary navigation links for key tools/pages
 * - Mobile: hamburger menu with slide-down navigation
 *
 * This component is intentionally lightweight and client-rendered to allow
 * interactive behavior (e.g., mobile menu toggles).
 */
export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="border-b border-neutral-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-50">
            {/* Outer container to center content and constrain max width */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                {/* Flex row: brand on the left, navigation on the right */}
                <div className="flex h-16 items-center justify-between">
                    {/* Brand / Logo */}
                    <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                        <div className="w-7 h-7 bg-neutral-900 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-bold">PC</span>
                        </div>
                        <span className="font-semibold tracking-tight">Projeto Circuitos</span>
                    </Link>

                    {/* Desktop navigation */}
                    <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm">
                        <Link href="/dimensionamento-cabos" className="hover:text-neutral-700 transition-colors">
                            Dimensionamento de Cabos
                        </Link>
                        <Link href="/calculos-sombras" className="hover:text-neutral-700 transition-colors">
                            Cálculos de Sombras
                        </Link>
                    </nav>


                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                        aria-label="Toggle mobile menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile navigation menu */}
                {isMobileMenuOpen && (

                    <div className="md:hidden border-t border-neutral-200 bg-white">
                        <nav aria-label="Mobile navigation" className="py-4 space-y-2">
                            <Link
                                href="/dimensionamento-cabos"
                                className="block px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                                onClick={closeMobileMenu}
                            >
                                📊 Dimensionamento de Cabos
                            </Link>
                            <Link
                                href="/calculos-sombras"
                                className="block px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                                onClick={closeMobileMenu}
                            >
                                🌤️ Cálculos de Sombras
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;


