"use client";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AppShell, Space, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      {!isMobile && (
        <AppShell.Header>
          <Header />
        </AppShell.Header>
      )}

      {!isMobile && <Space h={100} />}

      <AppShell.Main>
        {children}
        <Space h={100} />
        {!isMobile && <Footer />}
      </AppShell.Main>

      {isMobile && (
        <AppShell.Footer>
          <BottomNavigation />
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
