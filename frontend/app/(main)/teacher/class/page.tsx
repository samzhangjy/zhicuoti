"use client";
import { useAuthStore } from "@/app/store";
import { authGetMe, ClassPublic } from "@/client";
import {
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Skeleton,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ViewClassesPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassPublic[]>([]);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await authGetMe({
      auth: () => token || "",
    });
    if (error) {
      notifications.show({
        title: "获取用户信息失败",
        message: JSON.stringify(error),
        color: "red",
      });
      return;
    }
    setClasses(data!.owned_classes);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchClasses();
  }, [token]);

  return (
    <Container>
      <Group justify="space-between">
        <Title>班级管理</Title>
        <Group gap="xs">
          <Button component={Link} href="/teacher/class/new" size="sm">
            创建班级
          </Button>
          <Button component={Link} href="/class/join" variant="light" size="sm">
            加入班级
          </Button>
        </Group>
      </Group>
      <Space h={60} />
      {loading ? (
        <Skeleton h={300} />
      ) : (
        <SimpleGrid cols={{ md: 2, lg: 3 }} spacing="md">
          {classes.map((cls) => (
            <Card key={cls.id} withBorder radius="md">
              <Title order={3} mb={5}>
                {cls.name}
              </Title>
              {cls.description ? (
                <Text>{cls.description}</Text>
              ) : (
                <Text c="gray">暂无描述。</Text>
              )}
              <Space h="lg" />
              <SimpleGrid cols={2}>
                <Button
                  component={Link}
                  href={`/teacher/analyze/class/${cls.id}`}
                  variant="filled"
                >
                  学情分析
                </Button>
                <Button
                  component={Link}
                  href={`/teacher/class/${cls.id}`}
                  variant="light"
                >
                  查看班级
                </Button>
              </SimpleGrid>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
