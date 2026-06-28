import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import CursorGlow from "@/components/CursorGlow";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "UniCare | One Companion. Every Body. Every Stage of Life.",
  description:
    "UniCare is an AI-powered personalized healthcare companion helping users manage physical, mental, and preventive health at every stage of life.",
  keywords: [
    "AI healthcare",
    "personalized medicine",
    "mental wellness",
    "women's health",
    "men's health",
    "fitness companion",
    "nutrition tracking",
  ],
  authors: [{ name: "UniCare Health Technologies" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CursorGlow />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
