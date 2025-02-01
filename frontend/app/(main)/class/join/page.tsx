"use client";
import { useAuthStore } from "@/app/store";
import { classJoinClassRoute } from "@/client";
import {
  ActionIcon,
  Center,
  Container,
  Group,
  PinInput,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinClassPage() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const form = useForm({
    initialValues: {
      code: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (val: { code: string }) => {
    const { data, error } = await classJoinClassRoute({
      query: {
        invitation_code: val.code,
      },
      auth: () => token || "",
    });

    if (error) {
      notifications.show({
        title: "加入失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoading(false);
      return;
    }

    notifications.show({
      title: "加入成功",
      message: `已成功加入班级 「${data.name}」，请重新登录`,
    });

    logout();
    router.push("/auth/login");
  };

  return (
    <Container>
      <Title>加入班级</Title>
      <Space h={60} />
      <Text>请输入邀请码以加入班级。如果没有邀请码，请联系教师取得。加入后须重新登录以生效。</Text>
      <Space h="xl" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Center>
          <Group gap="md">
            <PinInput
              length={6}
              {...form.getInputProps("code")}
              my="md"
              size="sm"
            />
            <ActionIcon
              type="submit"
              loading={loading}
              variant="light"
              size="lg"
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Center>
      </form>
    </Container>
  );
}
