import { MetadataRoute } from "next";

export const revalidate = 0;

const PUBLIC_DOMAIN = "https://flow.koredigital.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${PUBLIC_DOMAIN}`,
      changeFrequency: "weekly",
      priority: 1,
    }
  ];
}
