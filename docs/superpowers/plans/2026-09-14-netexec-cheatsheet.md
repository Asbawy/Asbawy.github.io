# NetExec (nxc) Operational Cheat Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive, production-grade operational MDX cheatsheet for NetExec (`nxc`) at `src/data/cheatsheets/Tools/NetExec.mdx` reflecting modern v1.x+ features, multi-protocol coverage, OPSEC comparisons, and detection telemetry.

**Architecture:** Create an MDX document adhering to the site's `CheatsheetMeta` type contract and UI standard. The content is organized across 8 operational assessment phases with structured markdown tables, realistic command examples, operational callouts, and a Windows Event ID detection matrix.

**Tech Stack:** React 19, MDX, Vite, TanStack Router/Start, TypeScript, Tailwind CSS.

## Global Constraints
- Target path: `src/data/cheatsheets/Tools/NetExec.mdx`
- Category: `"Tools"` (matching `CheatsheetMeta` in `src/data/cheatsheets.ts`)
- Difficulty: `"Intermediate"`
- No placeholders, no `TODO`, no unformatted command dumps
- Strict MDX compliance (valid HTML/JSX attributes, no unclosed tags, escaped entities if necessary)

---

### Task 1: Create the NetExec Operational MDX Cheatsheet

**Files:**
- Create: `src/data/cheatsheets/Tools/NetExec.mdx`

**Interfaces:**
- Consumed by: `src/data/cheatsheets.ts` via eager glob `import.meta.glob("./cheatsheets/**/*.mdx")`
- Frontmatter schema:
  - `title`: `"NetExec (nxc) Operational Cheat Sheet"`
  - `excerpt`: `"Comprehensive, tradecraft-driven reference for NetExec (nxc). Covers multi-protocol enumeration (SMB, LDAP, WinRM, MSSQL, RDP, WMI, SSH, VNC, FTP), safe password spraying, credential harvesting, BloodHound CE collection, execution methods, and detection telemetry."`
  - `url`: `"https://asbawy.github.io/cheatsheet/Tools/NetExec"`
  - `date`: `"2026-09-14"`
  - `updated`: `"2026-09-14"`
  - `category`: `"Tools"`
  - `tags`: `["netexec", "nxc", "active-directory", "pentesting", "lateral-movement", "tools"]`
  - `difficulty`: `"Intermediate"`
  - `readTime`: `"22 mins"`

- [ ] **Step 1: Write `src/data/cheatsheets/Tools/NetExec.mdx`**
  Generate the complete MDX document containing all 8 operational phases, protocol matrix, execution method comparisons, and detection telemetry table.

- [ ] **Step 2: Commit document to Git**
  ```bash
  git add src/data/cheatsheets/Tools/NetExec.mdx
  git commit -m "feat(cheatsheet): add comprehensive NetExec operational cheatsheet"
  ```

---

### Task 2: Validate Build & Integration

**Files:**
- Verified: `src/data/cheatsheets/Tools/NetExec.mdx`
- Verified: `src/data/cheatsheets.ts`

- [ ] **Step 1: Run Vite build check to verify MDX compilation**
  Run: `npm run build` or `npx vite build`
  Expected: Successful compilation of all `.mdx` pages with 0 syntax or bundle errors.

- [ ] **Step 2: Verify Cheatsheet Tree Ingestion**
  Confirm `src/data/cheatsheets.ts` automatically discovers and mounts `Tools/NetExec`.

- [ ] **Step 3: Commit and summarize walkthrough**
