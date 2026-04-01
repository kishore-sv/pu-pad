import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
}

/**
 * Get all blog post slugs (for static generation)
 */
export function getAllBlogSlugs(): string[] {
  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Get a single blog post by slug
 */
export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as BlogFrontmatter;

  // gray-matter parses YAML date fields as JS Date objects — normalise to ISO string
  const rawDate = data.date as unknown;
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString().split("T")[0]
      : String(rawDate);

  return {
    slug: frontmatter.slug || slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date,
    content,
  };
}

/**
 * Get all blog posts, sorted by date (newest first)
 */
export function getAllBlogPosts(): BlogPost[] {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map((slug) => getBlogPost(slug))
    .filter((post): post is BlogPost => post !== null);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Format a date string for display
 */
export function formatBlogDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
