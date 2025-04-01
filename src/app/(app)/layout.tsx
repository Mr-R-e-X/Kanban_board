import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "An advanced todo manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
