---
applyTo: "**"
description: "CRITICAL database protection rules and user privacy requirements"
---

# 🚨 CRITICAL: DATABASE PROTECTION RULES 🚨

## 🚨 PRISMA MIGRATION RULES - NEVER BREAK THESE 🚨

### ABSOLUTE RULES:
1. ❌ **NEVER use `prisma db push`**
2. ❌ **NEVER edit existing migration files** - Once applied, they are immutable
3. ❌ **NEVER modify the `prisma/migrations/` directory manually**
4. ✅ **ALWAYS use `prisma migrate dev --name descriptive_name`** for schema changes
5. ✅ **ALWAYS create a NEW migration** for any schema changes, never modify old ones

### IF SCHEMA CHANGES ARE NEEDED:
- **Step 1:** Edit `prisma/schema.prisma`
- **Step 2:** Run `npx prisma migrate dev --name descriptive_name`
- **Step 3:** Verify the generated migration looks correct
- **Step 4:** Commit both schema.prisma AND the new migration directory

### POSTGRESQL ENUM GOTCHA:
When adding enum values that are immediately used as defaults or in column changes, you MUST split the migration into two transactions:
```sql
-- Step 1: Add enum value
ALTER TYPE "EnumName" ADD VALUE IF NOT EXISTS 'NEW_VALUE';
COMMIT;
BEGIN;
-- Step 2: Use the enum value
ALTER TABLE "TableName" ALTER COLUMN "column" SET DEFAULT 'NEW_VALUE';
```

### CUSTOM SQL MIGRATIONS:
When you need to add database features that Prisma can't express (triggers, custom indexes, check constraints, etc.):
1. **Create empty migration:** `npx prisma migrate dev --name add_custom_feature --create-only`
2. **Write custom SQL** in the generated `migration.sql` file
3. **Apply migration:** `npx prisma migrate dev`
4. **Commit the migration file** along with schema.prisma

Common use cases: CHECK constraints, partial indexes, triggers, GIN/GIST indexes, RLS policies, materialized views.

### NEVER DO THIS:
- `npx prisma db push`
- Editing files in `prisma/migrations/*/migration.sql`
- `npx prisma migrate resolve` without explicit user permission
- `npx prisma migrate reset` without explicit user permission (see database protection rules)

### IF DRIFT IS DETECTED:
- **ASK THE USER FIRST** before running any commands
- Explain the situation and options
- Let the user decide whether to reset, baseline, or manually fix

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
   - Provide the exact SQL needed and let user decide how to apply it
4. **WAIT FOR USER DECISION** - Never make destructive changes automatically

### IF UNSURE:
- Default to asking the user
- Explain the implications of each approach
- Let the user make the final decision
- Remember: It's better to ask than to destroy data

---

## DATABASE OPERATIONS:

If you're using a prisma query, ensure that you use `withRetry()` wrapper for database operations to enhance reliability and handle transient errors effectively.

### EXAMPLE - CORRECT:
```typescript
const user = await withRetry(() =>
  prisma.user.findUnique({
    where: { slug: userSlug },
    select: {
      zesty_id: true,
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

---

**These instructions apply to ALL files in the project and must be followed at ALL times, regardless of the Copilot model or chat session being used.**
