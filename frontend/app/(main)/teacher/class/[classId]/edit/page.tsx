"use client";
import { useAuthStore } from "@/app/store";
import {
  ClassCreate,
  classEditClassRoute,
  classGetClassRoute,
  ClassPublic,
} from "@/client";
import {
  Button,
  Container,
  Skeleton,
  Space,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditClassPage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [cls, setCls] = useState<ClassPublic>();
  const token = useAuthStore((state) => state.token);
  const { classId } = useParams<{ classId: string }>();
  const form = useForm<ClassCreate>({
    initialValues: {
      name: "",
      description: "",
    },
  });
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
    form.setValues({
      name: data.name,
      description: data.description,
    });
    setLoading(false);
  };

  const handleSubmit = async (val: ClassCreate) => {
    setEditing(true);
    const { data, error } = await classEditClassRoute({
      auth: () => token || "",
      body: val,
      path: {
        class_id: classId,
      },
    });

    if (error) {
      notifications.show({
        title: "编辑班级失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setEditing(false);
      return;
    }

    router.push(`/teacher/class/${data.id}`);
    notifications.show({
      title: "编辑班级成功",
      message: "班级已修改",
    });
    setEditing(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchClass();
  }, [token]);

  return (
    <Container>
      <Title>编辑班级「{cls?.name}」</Title>
      <Space h={60} />
      {loading ? (
        <Skeleton h={300} />
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="班级名称"
            placeholder="请输入班级名称"
            required
            mb="md"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="班级描述"
            placeholder="（可留空）"
            my="md"
            {...form.getInputProps("description")}
          />
          <Button w="100%" type="submit" loading={editing} mt="md">
            确认修改
          </Button>
        </form>
      )}
    </Container>
  );
}
