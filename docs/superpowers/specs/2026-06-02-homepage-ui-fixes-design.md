# Homepage UI/UX Fixes Design Specification

## Overview
This document outlines the step-by-step UI/UX improvements for the Agendain homepage (`/`) to resolve visual and layout issues and align with the brand's premium design standards.

## 1. Features Section (Bento Grid)
- **Current State:** The "Kenapa Memilih Agendain?" section has an asymmetrical 2-column layout (1st item spans 2 columns, leaving a hole at the bottom right).
- **Solution:** Implement a simple and clean **2x2 uniform grid**.
- **Changes Needed:** 
  - Update `featuresGrid` in `app/page.module.css` to maintain 2 equal columns.
  - Remove the `featureItemFeatured` class from the first item in `app/page.tsx` so all 4 items have the exact same size and structure.

## 2. Image Assets (Dummy Data)
- **Current State:** Some packages and destinations have broken or contextually inaccurate dummy images (e.g., San Francisco for Italy).
- **Solution:** Update the fallback Unsplash image URLs in the `DUMMY_PACKAGES` and `DUMMY_DESTINATIONS` arrays.
- **Changes Needed:** 
  - Update URLs in `app/page.tsx` to high-quality, relevant European travel photos.

## 3. Contrast and Color Adjustments
- **Current State:** The `SearchBar` focus outline uses a default browser color (blue/pink), and the secondary CTA ("Chat WhatsApp") in the footer band has low contrast over the dark green background.
- **Solution:** 
  - Force the SearchBar input focus outline to use the brand's primary color (`var(--color-dominant)` or Green).
  - Increase the opacity or border strength of `.btnSecondary` in `app/page.module.css` to improve WCAG contrast.

## Implementation Steps
1. Refactor the Features grid CSS and HTML.
2. Replace broken image URLs in `page.tsx`.
3. Fix the SearchBar focus styles.
4. Improve CTA button contrast.
5. Verify changes locally via browser preview.
