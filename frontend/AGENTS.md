# Frontend Agent

## Stack
Next.js 16.x (App Router) | React 19 | TypeScript | Node 24 LTS

## Accessibility (a11y)

### Semantic HTML
```tsx
// GOOD
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>
<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>

// BAD
<div class="nav">
  <div><span onclick="...">Home</span></div>
</div>
```

### Interactive Elements
```tsx
// GOOD - accessible button
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-pressed={isPressed}
>
  <CloseIcon aria-hidden="true" />
</button>

// GOOD - accessible form
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && <span id="email-error" role="alert">{errors.email}</span>}
```

## Responsive Design

### Mobile-First CSS
```tsx
// styles.module.css
.container {
  padding: 1rem;           /* mobile default */
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;         /* tablet+ */
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1200px;     /* desktop */
    margin: 0 auto;
  }
}
```

## SEO

### Metadata API
```tsx
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | My App",
  description: "Welcome to our application",
  openGraph: {
    title: "Home | My App",
    description: "Welcome to our application",
    images: ["/og-image.png"],
    type: "website",
  },
};
```

### Dynamic Metadata
```tsx
// app/posts/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.coverImage],
    },
  };
}
```

### Structured Data (JSON-LD)
```tsx
export default function ProductPage({ product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PLN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>{/* content */}</main>
    </>
  );
}
```

## Core Web Vitals

### Image Optimization
```tsx
import Image from "next/image";

// GOOD - optimized with next/image
<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  priority          // LCP image - preload
  placeholder="blur"
/>

// Lazy load below-fold images (default behavior)
<Image
  src="/feature.jpg"
  alt="Feature"
  width={400}
  height={300}
/>
```

### Avoid Layout Shift (CLS)
```tsx
// GOOD - dimensions prevent layout shift
<Image src="/photo.jpg" width={300} height={200} alt="Photo" />

// GOOD - aspect ratio container
<div className="aspect-video relative">
  <Image src="/video-thumb.jpg" fill alt="Video thumbnail" />
</div>

// BAD - no dimensions causes layout shift
<img src="/photo.jpg" alt="Photo" />
```

## Component Patterns

### Server vs Client Components
```tsx
// Server Component (default) - for data fetching
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await getPosts(); // direct DB/API call
  return <PostList posts={posts} />;
}

// Client Component - for interactivity
// components/LikeButton.tsx
"use client";
import { useState } from "react";

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>Like</button>;
}
```
