import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { ThemeProvider } from "@evolt/components/common/theme-provider";
import "./globals.css";
import { Toaster } from "@evolt/components/ui/sonner";
import { ReactQueryClientProvider } from "@evolt/components/common/queryClientProvider";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Evolt - Real World Assets for Africa",
  description:
    "Join the future of accessible investing in Africa. Own real-world assets through blockchain technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.variable} font-sans antialiased  relative`}>
        <div className="w-[393px] h-[393px] bg-[#555CE4] rounded-full absolute top-[122.66px] left-1/2 -translate-x-1/2 blur-[1000px] z-[-1]"></div>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryClientProvider>
            <div className="relative z-10">{children}</div>

            <Toaster />
          </ReactQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
