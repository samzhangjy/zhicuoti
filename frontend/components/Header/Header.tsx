"use client";
import { useAuthStore } from "@/app/store";
import { Logo } from "@/components/Logo";
import { Anchor, Box, Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import classes from "./Header.module.css";

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const router = useRouter();

  const studentLinks = [
    { link: "/problem", label: "我的题目" },
    { link: "/analyze", label: "学情概览" },
  ];

  const teacherLinks = [
    { link: "/teacher/class", label: "班级管理" },
    { link: "/teacher/analyze", label: "学情分析" },
  ];

  const mainLinks =
    user?.role === "student"
      ? studentLinks
      : user?.role === "teacher"
      ? teacherLinks
      : [];

  const mainItems = mainLinks.map((item) => (
    <Anchor
      component={Link}
      href={item.link}
      key={item.label}
      className={classes.mainLink}
      data-active={pathname.startsWith(item.link) || undefined}
    >
      {item.label}
    </Anchor>
  ));

  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Anchor component={Link} href="/">
          <Logo size={40} />
        </Anchor>
        <Box className={classes.links} visibleFrom="sm">
          <Group justify="flex-end">
            {user ? (
              <>
                {user.role === "student" && (
                  <>
                    {user.class_ ? (
                      <Anchor className={classes.secondaryLink}>
                        班级：{user.class_.name}
                      </Anchor>
                    ) : (
                      <Anchor
                        component={Link}
                        className={classes.secondaryLink}
                        href="/class/join"
                      >
                        加入班级
                      </Anchor>
                    )}
                  </>
                )}
                <Anchor
                  component={Link}
                  className={classes.secondaryLink}
                  href="/user"
                >
                  我的账户
                </Anchor>
                <Anchor
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    notifications.show({
                      title: "登出成功",
                      message: "您已成功退出登录",
                      color: "blue",
                    });
                    router.push("/");
                  }}
                  className={classes.secondaryLink}
                >
                  退出登录
                </Anchor>
              </>
            ) : (
              <>
                <Anchor
                  component={Link}
                  className={classes.secondaryLink}
                  href="/auth/login"
                >
                  登录
                </Anchor>
                <Anchor
                  component={Link}
                  className={classes.secondaryLink}
                  href="/auth/register"
                >
                  注册
                </Anchor>
              </>
            )}
          </Group>
          <Group gap={0} justify="flex-end" className={classes.mainLinks}>
            {mainItems}
          </Group>
        </Box>
        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size="sm"
          hiddenFrom="sm"
        />
      </Container>
    </header>
  );
}
