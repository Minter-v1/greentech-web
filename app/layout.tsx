import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// MARK: - 본문 서체
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "greentech 인사관리시스템",
  description: "사원·근태·휴가·급여 통합 관리",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
