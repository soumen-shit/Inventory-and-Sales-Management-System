"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import { queryClient } from "@/lib/queryClient";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
