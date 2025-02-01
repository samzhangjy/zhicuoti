"use client";
import { useAuthStore } from "@/app/store";
import {
  authGetMe,
  authLogin,
  authRegister,
  subjectGetSubjectsRoute,
  SubjectPublic,
  UserCreate,
  userEditTeacherRoute,
} from "@/client";
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Select,
  Text,
  Title,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import classes from "./RegisterPage.module.css";

export default function RegisterPage() {
  const form = useForm<UserCreate & { subject?: string }>({
    initialValues: {
      name: "",
      role: "student",
      phone_number: "",
      password: "",
      subject: undefined,
    },
  });
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectPublic[]>([]);

  const handleSubmit = async (val: UserCreate & { subject?: string }) => {
    if (val.role === "teacher" && !val.subject) {
      notifications.show({
        title: "请选择科目",
        message: "请选择您教授的科目",
        color: "red",
      });
      return;
    }
    setLoading(true);
    const { error } = await authRegister({
      body: val,
    });

    if (error) {
      setLoading(false);
      notifications.show({
        title: "注册失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      return;
    }

    const { data: dataLogin, error: errorLogin } = await authLogin({
      body: {
        username: val.phone_number,
        password: val.password,
      },
    });

    if (errorLogin) {
      setLoading(false);
      notifications.show({
        title: "登录失败",
        message: errorLogin.detail?.toString(),
        color: "red",
      });
      return;
    }

    const token = dataLogin.access_token;
    const { data: userData } = await authGetMe({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    login(userData!, token);

    if (val.role === "teacher") {
      const { error: editError } = await userEditTeacherRoute({
        auth: () => token || "",
        body: {
          subject_id: val.subject!,
          phone_number: userData!.phone_number,
        },
      });

      if (editError) {
        notifications.show({
          title: "编辑教师信息失败",
          message: JSON.stringify(editError.detail),
          color: "red",
        });
        return;
      }
    }

    setLoading(false);
    notifications.show({
      title: "注册成功",
      message: `您好，${val.name}，欢迎加入！`,
      color: "green",
    });
    router.push("/");
  };

  const fetchSubejcts = async () => {
    const { data, error } = await subjectGetSubjectsRoute();

    if (error) {
      notifications.show({
        title: "获取科目失败",
        message: JSON.stringify((error as { detail: string }).detail),
        color: "red",
      });
      return;
    }

    setSubjects(data!);
  };

  useEffect(() => {
    fetchSubejcts();
  }, []);

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        注册账号
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        已经有账号?{" "}
        <Anchor size="sm" component={Link} href="/auth/login">
          登录
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="姓名"
            placeholder="请输入姓名"
            required
            {...form.getInputProps("name")}
          />
          <Select
            label="账号角色"
            required
            data={[
              { label: "学生", value: "student" },
              { label: "教师", value: "teacher" },
            ]}
            my="md"
            {...form.getInputProps("role")}
          />
          {form.getValues().role === "teacher" && (
            <Select
              label="科目"
              required
              data={subjects.map((subject) => ({
                label: subject.name,
                value: subject.id,
              }))}
              my="md"
              {...form.getInputProps("subject")}
            />
          )}
          <TextInput
            label="手机号"
            placeholder="请输入手机号"
            required
            {...form.getInputProps("phone_number")}
          />
          <PasswordInput
            label="密码"
            placeholder="请输入密码"
            required
            mt="md"
            {...form.getInputProps("password")}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            注册
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
