# Design: TPC AI Landing Page (Taxindo Prime Consulting)

## 1. Overview
A modern, professional landing page for **Taxindo Prime Consulting (TPC)** featuring their AI capabilities. The page blends corporate trust (Deep Blue/Gold) with modern tech (AI/Robotics).

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (chosen over Anime.js for superior React scroll-linked animation support)
- **Icons:** Lucide React (or similar)

## 3. Visual & UI Design
- **Theme:** "Corporate Trust"
    - Primary: Deep Navy Blue
    - Accent: Gold/Bronze
    - Background: Clean White / Light Grey
- **Layout:**
    - **Header:** Transparent initially. Becomes solid Deep Blue upon scrolling.
    - **Hero Section:** 
        - Central Element: **Robotic Head** (2D illustration).
        - **Interaction:**
            - **Initial State:** Robot head is prominent/centered.
            - **Scroll Action:** As user scrolls, the Robot head moves (parallaxes) to the side, "revealing" or making space for the main CTA buttons.
        - **CTA Buttons:**
            1.  **Owlie Chat:** (Chat Assistant)
            2.  **Tax Knowledge AI:** (Knowledge Base)

## 4. Implementation Steps
1.  **Project Init:** Setup Next.js with Tailwind.
2.  **Assets:** Create/Get placeholder SVG for Robotic Head.
3.  **Components:**
    - `Navbar`: Scroll-aware background state.
    - `Hero`: Framer Motion `useScroll` and `useTransform` hooks to map scroll Y to Robot X/Opacity.
    - `ActionButtons`: Styled cards for Owlie and Tax Knowledge.
4.  **Polish:** Ensure smooth transitions and responsive design.
