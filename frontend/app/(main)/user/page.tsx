"use client";
import { useAuthStore } from "@/app/store";
import {
  authGetMe,
  StudentUpdate,
  subjectGetSubjectsRoute,
  SubjectPublic,
  TeacherUpdate,
  userEditStudentRoute,
  userEditTeacherRoute,
  UserMe,
} from "@/client";
import {
  Button,
  Container,
  Select,
  Skeleton,
  Space,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewUserPage() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const [currUser, setCurrUser] = useState<UserMe>();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectPublic[]>([]);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const studentForm = useForm<StudentUpdate>({
    initialValues: {
      phone_number: "",
    },
  });

  const teacherForm = useForm<TeacherUpdate>({
    initialValues: {
      phone_number: "",
      subject_id: "",
    },
  });

  const fetchUser = async () => {
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
      setLoading(false);
      return;
    }

    setCurrUser(data!);
    if (data!.role === "student") {
      studentForm.setInitialValues({
        phone_number: data!.phone_number,
      });
      studentForm.setValues({
        phone_number: data!.phone_number,
      });
    } else {
      teacherForm.setInitialValues({
        phone_number: data!.phone_number,
        subject_id: data!.subject!.id!,
      });
      teacherForm.setValues({
        phone_number: data!.phone_number,
        subject_id: data!.subject!.id!,
      });
    }
    setLoading(false);
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

  const handleStudentSubmit = async (val: StudentUpdate) => {
    setEditing(true);
    const { error } = await userEditStudentRoute({
      auth: () => token || "",
      body: val,
    });

    if (error) {
      notifications.show({
        title: "编辑用户失败",
        message: JSON.stringify(error),
        color: "red",
      });
      setEditing(false);
      return;
    }

    notifications.show({
      title: "编辑用户成功",
      message: "用户信息已修改",
      color: "green",
    });
    setEditing(false);
  };

  const handleTeacherSubmit = async (val: TeacherUpdate) => {
    setEditing(true);
    const { error } = await userEditTeacherRoute({
      auth: () => token || "",
      body: val,
    });

    if (error) {
      notifications.show({
        title: "编辑用户失败",
        message: JSON.stringify(error),
        color: "red",
      });
      setEditing(false);
      return;
    }

    notifications.show({
      title: "编辑用户成功",
      message: "用户信息已修改",
      color: "green",
    });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    notifications.show({
      title: "登出成功",
      message: "您已退出登录。",
      color: "blue",
    });
    router.push("/");
  };

  useEffect(() => {
    if (!token) return;
    fetchUser();
    fetchSubejcts();
  }, [token]);

  return (
    <Container>
      <Title>用户中心</Title>
      <Space h={60} />
      {loading || !currUser ? (
        <Skeleton h={300} />
      ) : (
        <>
          <TextInput label="姓名" value={currUser.name} disabled mb="md" />
          <Select
            label="用户角色"
            data={[
              { label: "学生", value: "student" },
              { label: "教师", value: "teacher" },
            ]}
            value={currUser.role}
            disabled
            my="md"
          />
          {currUser.role === "student" && (
            <>
              {currUser.class_ ? (
                <>
                  <Text>所在班级：{currUser.class_.name}</Text>
                  {currUser.class_.description && (
                    <Text c="gray">{currUser.class_.description}</Text>
                  )}
                </>
              ) : (
                <Text c="red">你还没有加入班级。</Text>
              )}
            </>
          )}
          {currUser.role === "student" ? (
            <form onSubmit={studentForm.onSubmit(handleStudentSubmit)}>
              <TextInput
                label="手机号"
                placeholder="请输入手机号"
                required
                my="md"
                {...studentForm.getInputProps("phone_number")}
              />
              <Button
                type="submit"
                fullWidth
                mt="md"
                loading={editing}
                disabled={!studentForm.isDirty()}
              >
                确认修改
              </Button>
            </form>
          ) : (
            <form onSubmit={teacherForm.onSubmit(handleTeacherSubmit)}>
              <TextInput
                label="手机号"
                placeholder="请输入手机号"
                required
                my="md"
                {...teacherForm.getInputProps("phone_number")}
              />
              <Select
                label="科目"
                placeholder="请选择科目"
                data={subjects.map((subject) => ({
                  label: subject.name,
                  value: subject.id,
                }))}
                my="md"
                {...teacherForm.getInputProps("subject_id")}
              />
              <Button
                type="submit"
                fullWidth
                mt="md"
                loading={editing}
                disabled={!teacherForm.isDirty()}
              >
                确认修改
              </Button>
            </form>
          )}
          <Button fullWidth color="red" variant="light" onClick={handleLogout} mt="xl">
            退出登录
          </Button>
        </>
      )}
    </Container>
  );
}
