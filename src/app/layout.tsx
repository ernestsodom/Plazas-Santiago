import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DataPanel · Plazas Santiago",
  description:
    "Panel de gestión para cargar archivos Excel y generar dashboards de KPIs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">
        <Sidebar />
        <div className="min-h-screen md:pl-64">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
