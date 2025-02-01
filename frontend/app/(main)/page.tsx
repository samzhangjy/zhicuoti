"use client";
import {
  Button,
  Container,
  Group,
  Image,
  List,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import image from "./banner-art.svg";
import classes from "./Home.module.css";
import { useAuthStore } from "../store";
import Link from "next/link";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  console.log(user);
  return (
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            <span className={classes.highlight}>智能</span> 错题分析平台
          </Title>
          <Text c="dimmed" mt="md">
            智错题分析平台可通过错题的智能识别、分类和统计分析，提供个性化的学习建议和复习计划。
            <br />
            通过数据挖掘和分析，平台能够生成详细的错题报告，为学生提供可视化的学习反馈，并帮助教师了解班级整体的学习状况，以便实施
            有针对性的教学策略。
          </Text>

          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={20} radius="xl" mr="xs">
                <IconCheck size={12} stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>自动化错题识别与分类系统</b> –
              通过应用先进的深度学习算法，开发⼀个系统能够自动识别学生的错题，并对其进行多标签分类。这将有助于提高错误分类的精确度和效率，从而为后续的分析与辅导提供坚实的基础。
            </List.Item>
            <List.Item>
              <b>综合错题统计与分析报告</b> –
              为学生和教师提供详尽的错题统计与分析报告，包括错误分布、知识点掌握情况和错误趋势。这些报告将帮助学生理解自身学习进展，并为教师提供教学策略调整的依据。
            </List.Item>
            <List.Item>
              <b>教师教学支持功能</b> –
              为教师提供班级整体错题情况的分析，帮助他们识别共性问题和个性化需求，以便调整教学内容和方法，从而提高教学效果和效率。
            </List.Item>
          </List>

          <Group mt={30}>
            <Button
              size="md"
              className={classes.control}
              variant="filled"
              component={Link}
              href="/auth/register"
            >
              立即体验
            </Button>
            <Button variant="light" size="md">
              了解更多
            </Button>
          </Group>
        </div>
        <Image src={image.src} className={classes.image} alt="Banner" />
      </div>
    </Container>
  );
}
