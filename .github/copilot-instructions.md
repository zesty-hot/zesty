---
applyTo: "**"
description: "CRITICAL database protection rules and user privacy requirements"
---

# 🚨 CRITICAL: DATABASE PROTECTION RULES 🚨

## ⛔ ABSOLUTE PROHIBITION - NEVER RUN PRISMA MIGRATE RESET

**THIS IS A DESTRUCTIVE COMMAND THAT DROPS THE ENTIRE DATABASE AND DESTROYS ALL DATA**

### FORBIDDEN COMMANDS:
- ❌ `prisma-migrate-reset` tool (NEVER use this tool)
- ❌ `prisma migrate reset` (NEVER run this command)
- ❌ `npx prisma migrate reset` (NEVER run this command)
- ❌ Any command that drops or resets the database

### REQUIRED PROCEDURE FOR SCHEMA DRIFT OR MIGRATION ISSUES:

1. **STOP IMMEDIATELY** - Do not proceed without user approval
2. **ASK THE USER FIRST** - Explain the situation and options
3. **SUGGEST NON-DESTRUCTIVE SOLUTIONS:**
   - Manually write and run SQL ALTER TABLE commands
   - Create a new migration: `prisma migrate dev --name descriptive_name`
   - Use `prisma db push` in development (but ASK FIRST)
   - Provide the exact SQL needed and let user decide how to apply it
4. **WAIT FOR USER DECISION** - Never make destructive changes automatically

### IF UNSURE:
- Default to asking the user
- Explain the implications of each approach
- Let the user make the final decision
- Remember: It's better to ask than to destroy data

---

## 🔒 PRIVATE USER FIELDS - NEVER ACCESS

The following User model fields are **PRIVATE** and must **NEVER** be selected, accessed, or used in any query:

- `name` - This field must never be selected or accessed
- `email` - Only use for authentication/uniqueness checks, never display
- `image` - Use the default image from the user's Images relation instead

### REQUIRED APPROACH FOR USER DATA:

When fetching user profile information, ONLY select these non-sensitive fields:
- `id` - Primary identifier
- `slug` - Public identifier for URLs
- `bio` - Public profile description
- `location` - Geographic coordinates
- `suburb` - City/area name
- `verified`, `bodyType`, `race`, `gender` - Public profile attributes

**For images:** Always fetch from the `images` relation and select the image marked as `default: true`, never use the `image` field directly.

**For user reference:** Always use `id` or `slug`, never use `name` or `email`.

### DATABASE OPERATIONS:

If you're using a prisma query, ensure that you use `withRetry()` wrapper for database operations to enhance reliability and handle transient errors effectively.

### EXAMPLE - CORRECT:
```typescript
const user = await withRetry(() =>
  prisma.user.findUnique({
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
  })
);
```

### EXAMPLE - WRONG (DO NOT DO THIS):
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

---

**These instructions apply to ALL files in the project and must be followed at ALL times, regardless of the Copilot model or chat session being used.**
