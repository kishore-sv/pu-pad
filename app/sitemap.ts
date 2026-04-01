import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        "",
        "/about",
        "/blog",
    ].map((route) => ({
        url: `${siteConfig.url}${route}`,
        lastModified: new Date().toISOString().split("T")[0],
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1.0 : 0.8,
    }));

    const blogPosts = getAllBlogPosts().map((post) => ({
        url: `${siteConfig.url}/blog/${post.slug}`,
        lastModified: post.date,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogPosts];
}
