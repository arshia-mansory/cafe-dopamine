import type { MetadataRoute } from "next";

const SITE_URL = "https://cafe-dopamine.vercel.app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "کافه دوپامین",
    short_name: "دوپامین",
    description:
      "کافه دوپامین — بهترین قهوه تخصصی و نوشیدنی‌ها در اسلامشهر",
    start_url: SITE_URL,
    display: "standalone",
    background_color: "#1a1a2e",
    theme_color: "#e2b04a",
    dir: "rtl",
    lang: "fa",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}