import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
      title: "Calculos Solares - Ferramentas Profissionais de Engenharia Elétrica",
  description: "Plataforma profissional para dimensionamento de cabos elétricos conforme RTIEBT e cálculos precisos de sombras em sistemas fotovoltaicos. Ferramentas essenciais para engenheiros eletrotécnicos.",
  keywords: [
    "dimensionamento de cabos",
    "RTIEBT",
    "engenharia elétrica",
    "cálculos de sombras",
    "sistemas fotovoltaicos",
    "cabos elétricos",
    "queda de tensão",
    "corrente admissível",
    "Portugal",
    "engenharia"
  ],
  authors: [{ name: "Circuitos Energy Solutions" }],
  creator: "Circuitos Energy Solutions",
  publisher: "Circuitos Energy Solutions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://calculos-solares.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Calculos Solares - Ferramentas de Engenharia Elétrica",
    description: "Dimensionamento profissional de cabos elétricos e cálculos de sombras para sistemas fotovoltaicos",
    url: "https://calculos-solares.vercel.app",
    siteName: "Calculos Solares",
    locale: "pt_PT",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Calculos Solares - Ferramentas de Engenharia Elétrica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculos Solares - Ferramentas de Engenharia Elétrica",
    description: "Dimensionamento profissional de cabos elétricos e cálculos de sombras para sistemas fotovoltaicos",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
         * Global shell:
         * - Sticky Header at the top
         * - Main content area where each page is rendered
         * - Footer at the bottom
         */}
        <Header />
        <main className="min-h-[calc(100dvh-8rem)] w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
