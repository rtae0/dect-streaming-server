import type { Metadata } from "next";
import "@/styles/globals.css";
import Nav from "@/app/nav/Nav";

export const metadata: Metadata = {
  title: "Dact",
  description: "personal video streaming server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container"> {/* 전체 레이아웃 감싸기 */}
          <Nav />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}