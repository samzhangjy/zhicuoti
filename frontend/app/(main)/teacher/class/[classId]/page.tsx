"use client";
import { useAuthStore } from "@/app/store";
import {
  classDeleteClassRoute,
  classGetClassRoute,
  ClassPublicWithRelations,
} from "@/client";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Popover,
  SimpleGrid,
  Skeleton,
  Space,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPhone, IconPlus, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewClassPage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cls, setCls] = useState<ClassPublicWithRelations>();
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();

  const fetchClass = async () => {
    setLoading(true);
    const { data, error } = await classGetClassRoute({
      path: {
        class_id: classId,
      },
      auth: () => token || "",
    });

    if (error) {
      notifications.show({
        title: "获取班级失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoading(false);
      return;
    }
    setCls(data);
    setLoading(false);
  };

  const deleteClass = async () => {
    setDeleting(true);
    const { error } = await classDeleteClassRoute({
      auth: () => token || "",
      path: {
        class_id: classId,
      },
    });
    if (error) {
      notifications.show({
        title: "删除班级失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setDeleting(false);
      return;
    }
    notifications.show({
      title: "删除班级成功",
      message: "班级已被删除。",
      color: "green",
    });
    router.push("/teacher/class");
    setDeleting(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchClass();
  }, [token]);

  return (
    <Container>
      <Group justify="space-between">
        <Title>{loading ? "查看班级" : cls!.name}</Title>
        <Group gap="xs">
          <Button
            component={Link}
            href={`/teacher/class/${classId}/invite`}
            leftSection={<IconPlus size={16} />}
          >
            邀请加入
          </Button>
          <ActionIcon
            variant="light"
            color="blue"
            size="input-sm"
            component={Link}
            href={`/teacher/class/${classId}/edit`}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <Popover width={200} position="bottom" shadow="md">
            <Popover.Target>
              <ActionIcon variant="light" color="red" size="input-sm">
                <IconTrash size={16} />
              </ActionIcon>
            </Popover.Target>

            <Popover.Dropdown>
              <Text size="sm">确认删除班级「{cls?.name}」? 操作不可逆。</Text>
              <Group gap="xs" mt="sm">
                <Button
                  color="red"
                  size="xs"
                  fullWidth
                  loading={deleting}
                  onClick={deleteClass}
                >
                  确认删除
                </Button>
              </Group>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
      <Text c={cls?.description ? undefined : "gray"} mt="md">
        {cls?.description ?? "暂无描述。"}
      </Text>
      <Space h={60} />
      {loading || !cls ? (
        <Skeleton h={300} />
      ) : (
        <>
          <Title order={2} mb="lg">
            教师
            <Text span c="gray" ml="md">
              共 {cls.teachers.length} 人
            </Text>
          </Title>
          <SimpleGrid cols={{ md: 2, lg: 3 }} spacing="md">
            {cls.teachers.map((teacher) => (
              <Card key={teacher.id} withBorder radius="md">
                <Group gap="xs">
                  <Text fz="xl">{teacher.name}</Text>
                  <Badge color="blue" variant="light" size="md">
                    {teacher.subject!.name}
                  </Badge>
                </Group>
                <Group gap={2} mt="xs">
                  <ThemeIcon c="gray" bg="none">
                    <IconPhone size={16} />
                  </ThemeIcon>
                  <Text c="gray">{teacher.phone_number}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
          <Space h={40} />
          <Title order={2} mb="lg">
            学生
            <Text span c="gray" ml="md">
              共 {cls.students.length} 人
            </Text>
          </Title>
          <SimpleGrid cols={{ md: 2, lg: 3 }} spacing="md">
            {cls.students.map((student) => (
              <Card key={student.id} withBorder radius="md">
                <Text fz="xl">{student.name}</Text>
                <Group gap={2} mt="xs">
                  <ThemeIcon c="gray" bg="none">
                    <IconPhone size={16} />
                  </ThemeIcon>
                  <Text c="gray">{student.phone_number}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}
