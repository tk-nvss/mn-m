import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/admin-panal",
          "/admin-panal/*",
          "/owner-panal",
          "/owner-panal/*",
        ],
      },
    ],
    sitemap: "https://mlbbtopup.in/sitemap.xml",
    host: "https://mlbbtopup.in",
  };
}
