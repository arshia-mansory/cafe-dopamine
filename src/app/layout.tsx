import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "کافه دوپامین | بهترین قهوه و نوشیدنی‌ها",
  description: "کافه دوپامین در اسلامشهر، فضایی دلنشین برای لذت بردن از بهترین قهوه و نوشیدنی‌ها",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{ fontFamily: "'Vazirmatn', sans-serif" }}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}