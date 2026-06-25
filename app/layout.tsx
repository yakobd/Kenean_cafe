import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { RoleProvider } from "@/context/RoleContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "ከነአን Café",
  description: "Experience the finest coffee and pastries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <AppProvider>
            <NotificationProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </NotificationProvider>
          </AppProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
