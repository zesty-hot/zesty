## 🚨 CRITICAL RULES FOR AI ASSISTANTS (GitHub Copilot, Cursor, etc.)

### ⛔ ABSOLUTE PROHIBITION: NEVER DROP/RESET DATABASE
- ❌ **NEVER** run `prisma migrate reset` or use `prisma-migrate-reset` tool
- ❌ **NEVER** run any command that drops or resets the database
- ⚠️  For schema drift: **ALWAYS ASK USER FIRST**, then suggest non-destructive SQL solutions
- 📖 See `.github/copilot-instructions.md` and `.cursorrules` for complete rules

### 🔒 User Privacy: NEVER Access Private Fields
- ❌ Never select: `name`, `email`, or `image` fields from User model
- ✅ Use: `id`, `slug`, `bio`, `location`, `suburb`, public attributes
- 🖼️  For images: use `images` relation with `default: true`
- 🔄 Always wrap Prisma queries in `withRetry()` wrapper

**These rules apply to ALL AI models and chat sessions. No exceptions.**