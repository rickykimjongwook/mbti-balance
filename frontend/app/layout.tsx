import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MBTI 밸런스 게임",
  description: "내 MBTI는 어떤 선택을 할까? 실시간으로 같은 MBTI의 선택을 확인해보세요.",
  openGraph: {
    title: "MBTI 밸런스 게임",
    description: "내 MBTI는 어떤 선택을 할까? 실시간 투표로 확인해보세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
