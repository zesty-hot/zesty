---
applyTo: "**"
---
**CRITICAL: Never access private User fields**

The following User model fields are PRIVATE and must NEVER be selected, accessed, or used in any query:
- `name` - This field must never be selected or accessed
- `email` - Only use for authentication/uniqueness checks, never display
- `image` - Use the default image from the user's Images relation instead (SELECT THE DEFAULT IMAGE (AN IMAGE WHERE DEFAULT = TRUE) FROM THE IMAGES ON THE USER AND THEN APPEND IT TO THE USER AND USE THAT AS THE DEFAULT IMAGE)

**Required approach for user data:**

When fetching user profile information, ONLY select these non-sensitive fields:
- `id` - Primary identifier
- `slug` - Public identifier for URLs
- `bio` - Public profile description
- `location` - Geographic coordinates
- `suburb` - City/area name
- `verified`, `bodyType`, `race`, `gender` - Public profile attributes

**For images:** Always fetch from the `images` relation and select the image marked as `default: true`, never use the `image` field directly.

**For user reference:** Always use `id` or `slug`, never use `name` or `email`.

**Database operations:**

If you're using a prisma query, ensure that you use withRetry() wrapper for database operations to enhance reliability and handle transient errors effectively.

**Example - CORRECT:**
```typescript
const user = await prisma.user.findUnique({
  where: { slug: userSlug },
  select: {
    id: true,
    slug: true,
    bio: true,
    location: true,
    suburb: true,
    verified: true,
    images: {
      where: { default: true },
      select: { url: true }
    }
  }
});
```

**Example - WRONG (DO NOT DO THIS):**
```typescript
// ❌ NEVER access name, email, or image fields
const user = await prisma.user.findUnique({
  where: { slug: userSlug },
  select: {
    name: true,     // ❌ PRIVATE FIELD
    email: true,    // ❌ PRIVATE FIELD
    image: true,    // ❌ PRIVATE FIELD
  }
});
```