"use client";
import { useAuthStore } from "@/app/store";
import {
  ClassPublic,
  classGetClassRoute,
  classInviteClassRoute,
} from "@/client";
import {
  ActionIcon,
  Container,
  CopyButton,
  Group,
  Skeleton,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClassInvitePage() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(true);
  const [loadingCode, setLoadingCode] = useState(true);
  const [cls, setCls] = useState<ClassPublic>();
  const [code, setCode] = useState<string>();
  const { classId } = useParams<{ classId: string }>();

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

  const fetchClassInvitationCode = async () => {
    setLoadingCode(true);
    const { data, error } = await classInviteClassRoute({
      path: {
        class_id: classId,
      },
    });

    if (error) {
      notifications.show({
        title: "获取邀请码失败",
        message: JSON.stringify(error.detail),
        color: "red",
      });
      setLoadingCode(false);
      return;
    }

    setCode((data as { invitation_code: string }).invitation_code);
    setLoadingCode(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchClass();
  }, [token]);

  useEffect(() => {
    if (!cls) return;
    fetchClassInvitationCode();
  }, [cls]);

  return (
    <Container>
      <Title>
        邀请加入{" "}
        {loading ? (
          <Skeleton w={70} h={40} display="inline-block" />
        ) : (
          cls?.name
        )}{" "}
      </Title>
      <Space h={60} />
      {loading || !cls ? (
        <Skeleton h={300} />
      ) : (
        <>
          <Title order={4}>
            邀请码
            {loadingCode || !code ? (
              <Skeleton w={70} h="lg" />
            ) : (
              <Group display="inline-block">
                <Text span ml="lg" size="lg" fw={600}>
                  {code}
                </Text>
                <CopyButton value={code}>
                  {({ copied, copy }) => (
                    <ActionIcon
                      color={copied ? "teal" : "blue"}
                      onClick={copy}
                      ml="md"
                      variant="light"
                    >
                      {copied ? (
                        <IconCopyCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>
            )}
          </Title>
          <Text mt="lg">
            复制邀请码至班级群，引导同学在智错题上加入 「{cls.name}」
            ：进入智错题，根据信息创建账号，点击右上角 「加入班级」
            并输入班级邀请码。
          </Text>
        </>
      )}
    </Container>
  );
}
