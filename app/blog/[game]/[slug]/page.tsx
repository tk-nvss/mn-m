import { notFound } from "next/navigation";
import Script from "next/script";
import BlogPostLayout from "@/components/Blog/BlogPostLayout";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

type Props = {
  params: Promise<{ game: string; slug: string }>;
};

// Generate metadata dynamically
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const blog = await Blog.findOne({ slug });

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  const title = blog.seo?.title || blog.title;
  const description = blog.seo?.description || blog.excerpt;
  const keywords = blog.seo?.keywords || blog.tags || [];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://mlbbtopup.in/blog/${blog.game}/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://mlbbtopup.in/blog/${blog.game}/${slug}`,
      images: [{ url: blog.image || "https://mlbbtopup.in/og-blog.png" }],
      publishedTime: blog.publishedAt,
      authors: ["MLBB Topup India"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blog.image || "https://mlbbtopup.in/og-blog.png"],
    },
  };
}

export default async function DynamicBlogPage({ params }: Props) {
  const { slug } = await params;
  
  await connectDB();
  const blog = await Blog.findOne({ slug });

  if (!blog) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.excerpt || blog.seo?.description,
    "image": [blog.image || "https://mlbbtopup.in/og-blog.png"],
    "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date().toISOString(),
    "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : (blog.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date().toISOString()),
    "author": {
      "@type": "Organization",
      "name": "MLBB Topup India",
      "url": "https://mlbbtopup.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Blue Buff",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mlbbtopup.in/logoBB.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mlbbtopup.in/blog/${blog.game}/${slug}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mlbbtopup.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://mlbbtopup.in/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.game.toUpperCase(),
        "item": `https://mlbbtopup.in/blog/${blog.game}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": blog.title,
        "item": `https://mlbbtopup.in/blog/${blog.game}/${slug}`
      }
    ]
  };

  return (
    <>
      <Script
        id={`article-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id={`breadcrumb-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostLayout
        title={blog.title}
        category={blog.type}
        readTime="5 min read"
        date={new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        image={blog.image || "/blog/default.png"}
        imageAlt={blog.title}
        game={blog.game.toUpperCase()}
        description={blog.excerpt}
      >
        <div 
          className="prose dark:prose-invert max-w-none space-y-6 text-[var(--foreground)]" 
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        />
      </BlogPostLayout>
    </>
  );
}
