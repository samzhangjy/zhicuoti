import logoLight from "./logo-light.png";
import logoDark from "./logo-dark.png";
import bannerLight from "./banner-light.png";
import bannerDark from "./banner-dark.png";
import { useComputedColorScheme } from "@mantine/core";
import NextImage from "next/image";
import { Image } from "@mantine/core";

export function Logo({ size }: { size: number | string }) {
  const colorScheme = useComputedColorScheme();
  const src = colorScheme === "dark" ? logoDark : logoLight;

  return (
    <Image component={NextImage} src={src} alt="智错题" w={size} h={size} />
  );
}

export function Banner({ w }: { w: number | string }) {
  const colorScheme = useComputedColorScheme();
  const src = colorScheme === "dark" ? bannerDark : bannerLight;

  return <Image component={NextImage} src={src} alt="智错题" w={w} h="auto" />;
}
