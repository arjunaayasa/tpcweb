# TPC AI Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create a modern, professional landing page for Taxindo Prime Consulting (TPC) featuring AI capabilities with scroll-linked robotic animation.

**Architecture:** Next.js 14 App Router for structure, Tailwind CSS for styling, Framer Motion for complex scroll animations. The app will be a single page with a sticky header and a Hero section that reveals content on scroll.

**Tech Stack:** Next.js 14, React, Tailwind CSS, Framer Motion, Lucide React.

---

### Task 1: Project Initialization & Setup

**Files:**
- Create: `package.json` (via init)
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Initialize Next.js Project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --no-src-dir --app --import-alias "@/*"`
(Note: Using `.` to install in current directory. If that fails, I will create a `tpc-web` folder).

**Step 2: Install Dependencies**
Run: `npm install framer-motion lucide-react clsx tailwind-merge`

**Step 3: Setup Global Styles (Deep Blue Theme)**
Modify `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --tpc-blue: #0f172a; /* Slate 900 or similar deep blue */
  --tpc-gold: #fbbf24; /* Amber 400 */
}

body {
  background: white;
  color: var(--tpc-blue);
}
```

**Step 4: Verify Build**
Run: `npm run build`

---

### Task 2: Navbar Component

**Files:**
- Create: `components/navbar.tsx`
- Modify: `app/page.tsx` (to include it for testing)

**Step 1: Create Navbar Structure**
Create `components/navbar.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-transparent text-[#0f172a]'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold tracking-tight">
          Taxindo Prime Consulting
        </div>
        <div className="hidden md:flex gap-6">
            <span className="cursor-pointer hover:text-amber-400">Services</span>
            <span className="cursor-pointer hover:text-amber-400">About</span>
            <span className="cursor-pointer hover:text-amber-400">Contact</span>
        </div>
      </div>
    </motion.nav>
  );
}
```

---

### Task 3: Hero Section & Robot Animation

**Files:**
- Create: `components/hero.tsx`
- Create: `components/robot-head.tsx` (Placeholder SVG)
- Modify: `app/page.tsx`

**Step 1: Create Robot Placeholder**
Create `components/robot-head.tsx`:
```tsx
export default function RobotHead({ className }: { className?: string }) {
  // Simple Geometric SVG Robot Head
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="20" width="50" height="60" rx="8" fill="#0f172a" />
      <circle cx="35" cy="40" r="5" fill="#38bdf8" /> {/* Eye */}
      <circle cx="65" cy="40" r="5" fill="#38bdf8" /> {/* Eye */}
      <rect x="40" y="65" width="20" height="5" fill="#fbbf24" /> {/* Mouth */}
      <path d="M20 50 L10 40" stroke="#0f172a" strokeWidth="3" /> {/* Ear Antenna */}
      <path d="M80 50 L90 40" stroke="#0f172a" strokeWidth="3" />
    </svg>
  );
}
```

**Step 2: Create Hero with Scroll Animation**
Create `components/hero.tsx`.
Logic:
- Use `useScroll` to get scroll progress.
- Map scroll (0 to 300px) to Robot Position (Center -> Right).
- Reveal Content (Opacity 0 -> 1) as Robot moves away.

```tsx
'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import RobotHead from './robot-head';
import { MessageSquare, BookOpen } from 'lucide-react';

export default function Hero() {
  const { scrollY } = useScroll();
  
  // Transform values
  const robotX = useTransform(scrollY, [0, 300], ['0%', '40%']);
  const robotScale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const contentOpacity = useTransform(scrollY, [100, 400], [0, 1]);
  const contentY = useTransform(scrollY, [100, 400], [50, 0]);

  return (
    <section className="relative h-[200vh] bg-slate-50 overflow-hidden">
        {/* Sticky Container for Animation Area */}
        <div className="sticky top-0 h-screen flex items-center justify-center w-full">
            
            {/* Robot Container */}
            <motion.div 
                style={{ x: robotX, scale: robotScale }}
                className="absolute z-10 w-64 h-64 md:w-96 md:h-96"
            >
                <RobotHead className="w-full h-full drop-shadow-2xl" />
            </motion.div>

            {/* Revealed Content Container */}
            <motion.div 
                style={{ opacity: contentOpacity, y: contentY }}
                className="absolute left-10 md:left-24 max-w-xl z-0"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-[#0f172a] mb-4">
                    Intelligent Tax Solutions
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                    Powered by TPC AI. Experience the future of consulting.
                </p>
                
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Owlie Chat Button */}
                    <button className="flex items-center gap-3 bg-[#0f172a] text-white px-6 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl group">
                        <MessageSquare className="w-6 h-6 text-[#fbbf24] group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <div className="text-xs text-slate-400">Assistant</div>
                            <div className="font-bold">Owlie Chat</div>
                        </div>
                    </button>

                    {/* Tax Knowledge Button */}
                    <button className="flex items-center gap-3 bg-white text-[#0f172a] border border-slate-200 px-6 py-4 rounded-xl hover:border-[#fbbf24] transition-all shadow-md hover:shadow-lg group">
                        <BookOpen className="w-6 h-6 text-[#0f172a] group-hover:text-[#fbbf24] transition-colors" />
                        <div className="text-left">
                            <div className="text-xs text-slate-500">Database</div>
                            <div className="font-bold">Tax Knowledge AI</div>
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    </section>
  );
}
```

**Step 3: Update Main Page**
Modify `app/page.tsx`:
```tsx
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      {/* Additional empty space to allow scrolling if needed, handled by Hero h-[200vh] */}
    </main>
  );
}
```

---

### Task 4: Polish & Build Verification

**Step 1: Verify Animation**
- Check scroll smoothness.
- Ensure z-indexes are correct (Header > Robot > Content).

**Step 2: Final Build**
Run: `npm run build`
