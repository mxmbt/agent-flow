---
name: next-best-practices
description: "Next.js App Router: RSC, data patterns, Suspense, hydration."
---

# Next.js Best Practices

## 1. RSC Boundaries (Server vs Client Components)

### Default: Server Components
Everything is a Server Component unless explicitly marked `'use client'`.

### Invalid Patterns — DETECT AND FIX

```typescript
// WRONG: hooks in Server Component (no 'use client')
export default function Page() {
  const [state, setState] = useState(''); // ERROR at runtime
  return <div>{state}</div>;
}

// WRONG: async Client Component
'use client';
export default async function Widget() { // Will error
  const data = await fetch('/api/data');
  return <div>{data}</div>;
}

// WRONG: non-serializable props to Client Component
<ClientComponent onSubmit={handleSubmit} /> // Functions aren't serializable

// RIGHT: Use Server Actions instead
<ClientComponent submitAction={submitAction} /> // Server Action is serializable
```

### Rules
- `'use client'` -> ONLY for interactivity (useState, useEffect, event handlers)
- Server Components -> data fetching, DB access, sensitive logic
- Push `'use client'` boundary as LOW as possible in component tree
- **Exception:** Server Actions (`'use server'`) CAN be passed as props

---

## 2. Data Fetching Patterns

### Decision Matrix

| Need | Use | NOT |
|------|-----|-----|
| Read data for rendering | Server Component + tRPC server caller | Client-side fetch |
| User mutation | Server Action OR tRPC mutation | Direct DB in component |
| External API webhook | Route Handler (`route.ts`) | Server Action |
| Real-time data | Client Component + tRPC subscription | Polling in Server Component |

### Avoid Data Waterfalls

```typescript
// WRONG: Sequential — slow
const user = await getUser(id);
const posts = await getPosts(id);

// RIGHT: Parallel
const [user, posts] = await Promise.all([
  getUser(id),
  getPosts(id),
]);
```

### Preload Pattern with `cache`
```typescript
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
});
```

---

## 3. Error Handling

### File Conventions
```
app/
  error.tsx          <- catches errors in this route segment (must be 'use client')
  not-found.tsx      <- custom 404 for this segment
  global-error.tsx   <- catches errors in root layout (must be 'use client')
```

### Error Functions
```typescript
import { notFound, redirect } from 'next/navigation';

if (!doc) notFound();              // -> not-found.tsx
if (!session) redirect('/login');  // -> redirect
```

### unstable_rethrow in catch blocks
```typescript
// WRONG: swallows Next.js internal errors (redirect, notFound)
try {
  const data = await riskyOperation();
} catch (error) {
  return { error: 'Something went wrong' }; // Catches redirect too!
}

// RIGHT: rethrow Next.js errors
import { unstable_rethrow } from 'next/navigation';
try {
  const data = await riskyOperation();
} catch (error) {
  unstable_rethrow(error); // Let Next.js errors pass through
  return { error: 'Something went wrong' };
}
```

---

## 4. Async APIs (Next.js 15+)

Dynamic APIs are now **async**:

```typescript
// Old (Next.js 14)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}

// New (Next.js 15+)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// Same for cookies, headers:
const cookieStore = await cookies();
const headersList = await headers();
```

---

## 5. Suspense Boundaries

### When Required

```typescript
// useSearchParams causes CSR bailout without Suspense
// WRONG: entire page becomes client-rendered
'use client';
export default function Page() {
  const searchParams = useSearchParams(); // CSR bailout!
  return <div>{searchParams.get('q')}</div>;
}

// RIGHT: wrap in Suspense
function SearchContent() {
  const searchParams = useSearchParams();
  return <div>{searchParams.get('q')}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
```

### Hooks requiring Suspense boundary
- `useSearchParams()` — always wrap
- `usePathname()` — during static rendering

---

## 6. Hydration Errors

### Common Causes & Fixes

| Cause | Fix |
|-------|-----|
| `typeof window !== 'undefined'` in render | Use `useEffect` for browser-only code |
| `Date.now()` / `new Date()` in render | Pass from server as prop or use `useEffect` |
| Browser extensions modifying DOM | Use `suppressHydrationWarning` |
| Invalid HTML nesting (`<div>` in `<p>`) | Fix HTML structure |
| Different content server vs client | Use `useEffect` + state for client-only |

```typescript
// WRONG: Hydration mismatch
function Component() {
  return <p>Time: {Date.now()}</p>; // Different on server vs client
}

// RIGHT
function Component() {
  const [time, setTime] = useState<number>();
  useEffect(() => setTime(Date.now()), []);
  return <p>Time: {time ?? 'Loading...'}</p>;
}
```

---

## 7. Image & Font Optimization

```typescript
// Always use next/image
import Image from 'next/image';
<Image src="/hero.png" alt="Hero" width={800} height={400} priority />

// LCP images: add priority prop
// Responsive: use sizes prop
<Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" />

// Fonts: use next/font
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin', 'cyrillic'] });
```

---

## 8. Route Handlers

```typescript
// app/api/webhook/route.ts
// RULE: GET handler + page.tsx in same route -> conflict
// Route handlers for: webhooks, external APIs, non-UI endpoints
// Server Actions for: form submissions, mutations from UI

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ ok: true });
}
```

---

## 9. Directives

| Directive | Source | Purpose |
|-----------|--------|---------|
| `'use client'` | React | Marks Client Component boundary |
| `'use server'` | React | Marks Server Action (inline or file-level) |
| `'use cache'` | Next.js | Opts into caching (experimental) |

---

## 10. Self-Hosting (Docker / On-Premise)

```javascript
// next.config.js
module.exports = {
  output: 'standalone', // Required for Docker
};
```

- `standalone` creates minimal `node_modules`
- ISR: configure cache handler for multi-instance setups
- Environment variables: `NEXT_PUBLIC_` prefix for client-side only
