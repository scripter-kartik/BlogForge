import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { PostsProvider } from "@/context/PostsContext";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "BlogForge - Share Your Stories",
  description: "A platform to share and discover amazing blogs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        <Providers>
          <UserProvider>
            <PostsProvider>{children}</PostsProvider>
          </UserProvider>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
