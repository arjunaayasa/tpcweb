# Design: TPC AI Feature Sections

## Overview
Add a feature-focused flow after the Hero section: a feature card grid, detailed feature sections, testimonials, and FAQ. Remove the current Services/Why Us focus from the page order. All animations are CSS keyframes (no Framer Motion).

## Goals
- Feature cards immediately after Hero: Owlie Chat and Tax Knowledge AI are larger than other cards.
- Separate feature detail sections for Owlie Chat, Tax Knowledge AI, and Studio AI with text preceding a horizontal image slot.
- Testimonials: 5 large floating cards with a quote mark in the top-right corner.
- FAQ section as the final content block before the footer.
- Maintain smooth color transition from Hero into the next section.

## Layout Structure
1. Hero (existing) with neutron particles and smooth bottom gradient.
2. Feature Cards (new): grid with two large cards (Owlie, Tax Knowledge) and two standard cards (Studio, Coming Soon).
3. Feature Details (new): three stacked sections, each with text on the left and image placeholder on the right.
4. Testimonials (new): 5 large cards in a responsive grid, floating animation.
5. FAQ (new): list of 4-6 questions and answers.
6. Footer (existing).

## Visual & Animation System
- Backgrounds: neutral-light and white alternation to avoid harsh contrast.
- Cards: white with soft shadow, rounded corners.
- Keyframes: fade-up for entrances, slide-in for feature detail imagery, float-y for testimonials.
- Quote icon: top-right of testimonial cards using a typographic quote or SVG.

## Components to Add
- `components/feature-cards.tsx`
- `components/feature-details.tsx`
- `components/testimonials.tsx`
- `components/faq.tsx`

## Files to Update
- `app/page.tsx`: update page order and remove Services/Why Us from layout.
- `app/globals.css`: add float-y keyframe and utilities.
