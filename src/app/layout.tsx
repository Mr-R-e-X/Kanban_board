import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { ModalProvider } from "@/context/ModalContext";
import { MiscProvider } from "@/context/MiscContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "An advanced todo manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <MiscProvider>
            <ModalProvider>
              <AuthProvider>
                {children}
                <Toaster
                  position="bottom-center"
                  reverseOrder={false}
                  toastOptions={{
                    style: {
                      background: "transparent",
                      boxShadow: "none",
                      padding: "0px",
                    },
                  }}
                />
              </AuthProvider>
            </ModalProvider>
          </MiscProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
