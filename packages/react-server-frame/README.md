# A new type of RSC routing based on `<Frame />`

New type of RSC routing inspired by iFrames and Remix 3.

## How it works

### Define your routes

```ts
import { route } from "remix/fetch-router/routes";

export const routes = route({
  frames: {
    home: "/",
    about: "/about",
    partials: {
      sidebar: "/frame/sidebar",
    },
  },
});
```

### Map your components and render a `<Frame />` for the current location

```tsx
const router = createRouter();

router.route("ANY", "*", {
  handler: ({ request }) => {
    return render(
      request,
      <ProvideFrames
        frames={routes.frames}
        components={{
          about: About,
          home: Home,
          partials: {
            sidebar: Sidebar,
          },
        }}
      >
        <Frame src={request.url} />
      </ProvideFrames>,
    );
  },
});
```

### Nest frames

```tsx
<Suspense fallback={<p>Loading sidebar...</p>}>
  <Frame src={routes.frames.partials.sidebar.href()} />
</Suspense>
```

### Revalidate frames

```tsx
"use client";

import { useFrame } from "react-server-frame/client";

export function ReloadFrame() {
  const { pending, reload } = useFrame();

  return <button onClick={reload}>Reload{pending ? "ing..." : ""}</button>;
}
```
