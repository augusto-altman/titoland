# Contributing Guidelines

## Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code formatting.

### Configuration

- Configuration file: `.prettierrc`
- Ignore patterns: `.prettierignore`

### Commands

```bash
# Format all files
npm run format

# Check formatting without modifying files
npm run format:check
```

### For AI Assistants / Automated Tools

**IMPORTANT**: Always run `npm run format` after creating or modifying any source files. This ensures consistent formatting across the codebase.

## Development Workflow

1. Make your changes
2. Run `npm run format` (or it runs automatically via git hook)
3. Run `npm run build` to verify TypeScript compilation
4. Commit your changes
