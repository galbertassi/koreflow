import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://flow.koredigital.com.br",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    }
  ];
}
