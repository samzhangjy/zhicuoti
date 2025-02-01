import { useAuthStore } from "@/app/store";
import { Center, Flex, Grid, Text, ThemeIcon } from "@mantine/core";
import {
  IconChartDots3,
  IconLogin,
  IconNotebook,
  IconSchool,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from "./BottomNavigation.module.css";

export function BottomNavigation() {
  const user = useAuthStore((state) => state.user);

  const studentLinks = [
    {
      icon: IconNotebook,
      label: "错题",
      link: "/problem",
    },
    {
      icon: IconChartDots3,
      label: "分析",
      link: "/analyze",
    },
    {
      icon: IconUser,
      label: "用户",
      link: "/user",
    },
  ];

  const teacherLinks = [
    {
      icon: IconSchool,
      label: "班级",
      link: "/teacher/class",
    },
    {
      icon: IconChartDots3,
      label: "分析",
      link: "/teacher/analyze",
    },
    {
      icon: IconUser,
      label: "用户",
      link: "/user",
    },
  ];

  const mainLinks =
    user?.role === "student"
      ? studentLinks
      : user?.role === "teacher"
      ? teacherLinks
      : [
          { icon: IconLogin, label: "登录", link: "/auth/login" },
          { icon: IconUserPlus, label: "注册", link: "/auth/register" },
        ];

  const pathname = usePathname();

  return (
    <Grid className={classes.container} gutter={0}>
      {mainLinks.map((item, index) => {
        const IconComponent = item.icon;
        const isActive = pathname.startsWith(item.link);
        return (
          <Grid.Col
            span={12 / mainLinks.length}
            className={classes.item}
            pb="md"
            key={index}
          >
            <Center h="100%">
              <Flex
                className={classes.inner}
                gap={5}
                justify="center"
                align="center"
                direction="column"
                wrap="wrap"
                component={Link}
                href={item.link}
              >
                <ThemeIcon
                  classNames={{
                    root: isActive ? classes.iconRootActive : classes.iconRoot,
                  }}
                  size={24}
                >
                  <IconComponent size={24} />
                </ThemeIcon>
                <Text
                  size="12px"
                  fw={600}
                  classNames={{
                    root: isActive
                      ? classes.itemLabelActive
                      : classes.itemLabel,
                  }}
                >
                  {item.label}
                </Text>
              </Flex>
            </Center>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
