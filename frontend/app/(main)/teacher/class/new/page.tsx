"use client";
import { useAuthStore } from "@/app/store";
import { ClassCreate, classCreateClassRoute } from "@/client";
import { Button, Container, Space, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateClassPage() {
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const form = useForm<ClassCreate>({
    initialValues: {
      name: "",
      description: "",
    },
  });
  const router = useRouter();

  const handleSubmit = async (val: ClassCreate) => {
    setLoading(true);
    const { data, error } = await classCreateClassRoute({
      auth: () => token || "",
      body: val,
    });

    if (error) {
      notifications.show({
        title: "创建班级失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoading(false);
      return;
    }

    router.push(`/teacher/class/${data.id}`);
    notifications.show({
      title: "创建班级成功",
      message: "班级已创建",
    });
    setLoading(false);
  };

  return (
    <Container>
      <Title>创建班级</Title>
      <Space h={60} />
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
        <Button w="100%" type="submit" loading={loading} mt="md">
          创建班级
        </Button>
      </form>
    </Container>
  );
}
