import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "@constants/appConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { template: `%s - ${APP_NAME}`, default: APP_NAME },
  description: "Generated by create next app",

  creator: `Chetan Seervi`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={`en`} className={`dark`}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
