import { MetadataRoute } from "next";

export const revalidate = 0;

const PUBLIC_DOMAIN = "https://flow.koredigital.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${PUBLIC_DOMAIN}/sitemap.xml`,
  };
}
