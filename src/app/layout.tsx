import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Escape Room",
  description:
    "Solve riddles together in real-time! Create or join an escape room match with your family and friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
