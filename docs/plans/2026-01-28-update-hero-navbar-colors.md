# Update Hero and Navbar Colors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Update the Hero and Navbar components to use the new color palette (light theme).

**Architecture:** Tailwind CSS class updates in React components.

**Tech Stack:** React, Tailwind CSS, Framer Motion.

---

### Task 1: Update Hero Component

**Files:**
- Modify: `components/hero.tsx`

**Instructions:**
1.  **Background:** Change `bg-gradient-to-b from-slate-900 to-slate-800` to `bg-gradient-to-b from-soft-bg to-neutral-light`.
2.  **Headline:** Change `text-white` to `text-text-dark` or `text-primary`. Let's use `text-text-dark` for better contrast on light bg, or `text-primary` if it fits the brand. I'll stick to `text-text-dark` for the main headline as per instructions.
3.  **Subtext:** Change `text-slate-300` to `text-secondary`.
4.  **Primary Button (Owlie Chat):**
    - Change `bg-amber-500` to `bg-primary`.
    - Change `hover:bg-amber-400` to `hover:bg-secondary`.
    - Ensure text is `text-white`.
5.  **Secondary Button (Tax Knowledge AI):**
    - Remove `bg-white/10` (glassmorphism might not look good on light bg, or adjust opacity).
    - Change `border-white/20` to `border-primary`.
    - Change `text-white` to `text-primary`.
    - Hover: Change `hover:bg-white/20` to `hover:bg-primary` and `hover:text-white`.

**Step 1: Apply changes to `components/hero.tsx`**

Modify the JSX to reflect the class changes.

**Step 2: Verify visually (conceptual)**
Ensure the classes match the requirements.

---

### Task 2: Update Navbar Component

**Files:**
- Modify: `components/navbar.tsx`

**Instructions:**
1.  **Initial State (Transparent):**
    - The background is `bg-transparent`.
    - The text needs to be visible on the new light Hero background.
    - Change `text-[#0f172a]` (which is Slate 900) to `text-text-dark` to match the new palette naming, or keep it if `text-text-dark` resolves to a similar dark color. Let's use `text-text-dark` for consistency.
2.  **Scrolled State:**
    - Currently `bg-[#0f172a] text-white`.
    - Change to `bg-primary` text-white` as per instructions ("bg-primary text-white when scrolled").
3.  **Links Hover:**
    - Change `hover:text-amber-400` to `hover:text-secondary` or `hover:text-primary` depending on background.
    - If initial (light bg), hover should probably be `text-primary`.
    - If scrolled (primary bg), hover should be `text-secondary` or kept white/light.
    - *Correction based on instructions:* "Update it to use `text-text-dark` initially, and `bg-primary` text-white when scrolled."
    - Let's assume the hover effect on links should be consistent or adapted. I'll use `hover:text-primary` for the initial state and `hover:text-secondary` (or lighter) for the scrolled state if needed.

**Step 1: Apply changes to `components/navbar.tsx`**

Modify the `className` logic and static classes.

**Step 2: Verify visually (conceptual)**
Ensure logic handles scroll state correctly with new colors.
