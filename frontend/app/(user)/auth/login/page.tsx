"use client";
import { useAuthStore } from "@/app/store";
import { authGetMe, authLogin } from "@/client";
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  Title,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import classes from "./LoginPage.module.css";
import { useState } from "react";

export default function LoginPage() {
  const form = useForm({
    initialValues: {
      phone: "",
      password: "",
    },
  });
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (val: { phone: string; password: string }) => {
    setLoading(true);
    const { data, error } = await authLogin({
      body: {
        username: val.phone,
        password: val.password,
      },
    });
    if (error) {
      setLoading(false);
      notifications.show({
        title: "登录失败",
        message: error.detail?.toString(),
        color: "red",
      });
      return;
    }
    const token = data.access_token;
    const { data: userData } = await authGetMe({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    login(userData!, token);

    setLoading(false);
    notifications.show({
      title: "登录成功",
      message: `欢迎回来，${userData!.name}`,
      color: "green",
    });
    router.push("/");
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        欢迎回来!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        还没有账号?{" "}
        <Anchor size="sm" component={Link} href="/auth/register">
          注册
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="手机号"
            placeholder="请输入手机号"
            required
            {...form.getInputProps("phone")}
          />
          <PasswordInput
            label="密码"
            placeholder="请输入密码"
            required
            mt="md"
            {...form.getInputProps("password")}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            登录
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
