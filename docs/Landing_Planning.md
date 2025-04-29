# ESC/APE Landing Page Builder Specification

This builder allows creators to design a beautiful, customizable landing page for their IP — without writing code, powered by an integrated and forked version of Puck.

Puck is a powerful open-source CMS block editor, designed for React, enabling true WYSIWYG editing experiences. We are integrating and our own custom fork of Puck inside the CreatorHub to dramatically accelerate the Landing Page Builder development.

* Add content blocks (About, NFTs, Lore, Community)

* Customize layout, colors, and fonts (60/30/10 theme)

* View live landing page exactly as the public would see it

* Publish to IPFS with ENS-compatible domains

## Overview
A no-code, page builder that allows creators to design beautiful, customizable landing pages for their IP and community without writing code. The builder serves as the public-facing home for a creator’s Escape project and Town Protocol community.

## Core Functionality
* Add and arrange content blocks (Hero, IP Showcase, Community, NFTs, CTA)
* Customize layout, colors, and fonts using a 60/30/10 theme system
* View live preview in desktop/tablet/mobile modes
* Publish to IPFS with ENS-compatible domains
* Fully integrated with Escape’s dashboard (`/creatorhub/landing`)


## 🧱 Landing Page Builder (Using PUCK - No-Code Shopify-Style for Creators)

This builder allows creators to design a beautiful, customizable landing page for their IP — without writing code, powered by an integrated and forked version of [**Puck**](https://github.com/measuredco/puck).

Puck is a powerful open-source CMS block editor, designed for React, enabling true WYSIWYG editing experiences. We are integrating and customizing Puck in a standalone editor page to dramatically accelerate the Landing Page Builder development.

It works like a **Shopify storefront**, but for creator communities:

- Add content blocks (About, NFTs, Lore, Community)
- Customize layout, colors, and fonts (60/30/10 theme)
- View live landing page exactly as the public would see it
- Publish to IPFS with ENS-compatible domains

---

## 🎨 User Experience Flow

| Action                              | Result                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Navigate to `/creatorhub/landing`   | You see the **public-facing landing page** preview (read-only)          |
| Click `CUSTOMISE` button (top left) | Opens the **Puck-powered builder** at `/editor` in a separate page      |
| Edit page using Puck                | Drag/drop blocks, edit text, images, styles                             |
| Save changes                        | Page updates and publishes to IPFS automatically                        |

---

## 📁 Updated Folder Structure for Landing Page Builder

```bash
/web/app
  /creatorhub
    /landing
      layout.tsx              # Layout with Navbar
      page.tsx                # Landing page preview (public view)
  /editor
    layout.tsx                # Standalone layout for the editor
    page.tsx                  # Puck editor entry (builder mode)
    /puck
      puck.config.ts          # Puck schema + block definitions
      /blocks
        HeroBlock.tsx
        IPShowcaseBlock.tsx
        CommunityHubBlock.tsx
        NFTDisplayBlock.tsx
        CTA.tsx
        Roadmap.tsx           # (Future expansion)
        FAQ.tsx               # (Future expansion)
        Partners.tsx          # (Future expansion)
      Editor.tsx              # Mounts the Puck editor (builder mode)
      Viewer.tsx              # Renders the live landing page preview
    /hooks
      useLandingPageStore.ts  # Zustand state management
      useThemeTokens.ts       # Design token management
    /utils
      defaultBlocks.ts        # Starter template blocks
      colorUtils.ts           # 60/30/10 palette validation
      themePresets.ts         # Pre-defined color schemes
      mediaUploader.ts        # For image/video inputs
    /types
      BlockTypes.ts           # TypeScript types for blocks
      ThemeTypes.ts           # TypeScript types for theming
```

---

## 🛠 Puck Integration Details

| Item              | Description                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **SDK**           | [Puck SDK GitHub Repository](https://github.com/measuredco/puck)                                          |
| **Install**       | `npm install @measured/puck` or use a forked customized version                                           |
| **Schema**        | Block configuration is defined in `puck.config.ts` (block types, settings, styles)                        |
| **Customization** | Ability to override Puck toolbar, editing themes, and integrate Escape-specific block presets             |
| **Hosting**       | Puck outputs JSON structures that are saved either on IPFS (for production) or local storage (for drafts) |

---

## 🧩 Block System

The following blocks are available inside the builder:

- `HeroBlock`
- `IPShowcaseBlock`
- `CommunityHubBlock`
- `NFTDisplayBlock`
- `CTA`
- `Roadmap`
- `FAQ`
- `Partners`

All blocks are registered in `puck.config.ts` and are fully theme-aware.

---

## 🔐 NFT-Gated Blocks System

Escape will extend Puck functionality by allowing certain blocks to dynamically change based on the NFTs a user holds.

**Gated Blocks**: Each block can optionally specify a `gatedBy` field (NFT contract address or trait requirement).

**Dynamic Rendering**:
  - If the user holds the required NFT → the full block is shown.
  - If the user does **not** hold the NFT → a teaser or locked state message appears.

**Implementation**:
  - Wallet state is fetched using a `useNFTGates()` hook.
  - Gating logic is injected inside `/puck/Viewer.tsx`.

**Example Use Case**:
  - "Unlock secret lore panels by owning the `Genesis Escape NFT`."

This approach allows the Landing Page to be a living, evolving experience — rewarding active community members and collectors with richer, exclusive content.


---

## 📚 References

- [Puck GitHub Repository](https://github.com/measuredco/puck)
- [Puck SDK Documentation](https://puck-editor.dev/)
- Escape Landing Page customization fork (internal repository TBD)

---

## 📦 Publishing

- Once saved, the Landing Page will be uploaded to IPFS using Fleek, and will be available via ENS domains (e.g., `escapeproject.eth.limo`).

---

**Note:** We no longer manually create the builder canvas, sidebar, or block renderer from scratch — we leverage and modify Puck for a battle-tested WYSIWYG editing experience, dramatically reducing debugging and custom complexity.



## Editor Structure

## 60/30/10 Color Theme System

### Color Distribution Principle
The builder implements the classic 60/30/10 design rule through a design token system:
- **60%** - Primary/Base color (dominant background and major elements)
- **30%** - Secondary color (supporting elements, sections, cards)
- **10%** - Accent color (calls-to-action, highlights, important buttons)

### Design Token Implementation

#### Token Structure
```typescript
interface ColorThemeTokens {
  // 60% - Primary/Base
  base: {
    primary: string;   // HEX value
    lighter: string;   // Auto-generated variation
    darker: string;    // Auto-generated variation
  };

  // 30% - Secondary
  secondary: {
    primary: string;   // HEX value
    lighter: string;   // Auto-generated variation
    darker: string;    // Auto-generated variation
  };

  // 10% - Accent
  accent: {
    primary: string;   // HEX value
    lighter: string;   // Auto-generated variation
    darker: string;    // Auto-generated variation
  };

  // Text colors that work with the theme
  text: {
    onBase: string;
    onSecondary: string;
    onAccent: string;
    muted: string;
  };
}
```

### Theme Controls UI
In the Theme tab of the builder sidebar:
1. Color pickers for primary, secondary, and accent colors
2. Auto-generated palette preview showing variations
3. Real-time application to the canvas
4. Preset themes with curated color combinations

### Theme Presets System
The system includes pre-built themes such as:
- Neo Cyberpunk (dark purples/blues with neon accent)
- Ethereal (soft pastels with vibrant highlight)
- Monochrome (grayscale with single color accent)
- Creator Brand (customizable to match creator's existing brand)

### Accessibility Considerations
The theme system includes built-in checks for:
- WCAG AA compliant contrast ratios
- Visual indicators for poor contrast combinations
- Alternative color suggestions to improve accessibility

### Editor UI Layout
* **Sidebar (Left Side)**
   * **Split into two primary tabs:**
      1. **Sections Tab** - For adding and arranging content blocks
      2. **Theme Tab** - For global styling and design controls
* **Main Canvas (Right Side)**
   * Real-time WYSIWYG preview area
   * Interactive blocks with direct editing capabilities
   * Device preview toggle (desktop/tablet/mobile)



## Simplified Core Blocks for MVP

### 1. Hero Block
A clean, impactful introduction block.
* **Visible Components:**
  * Background image/video upload
  * Headline text (click-to-edit)
  * Brief subheading (click-to-edit)
  * Single CTA button with customizable text and link
  * Alignment options (center/left/right)

### 2. IP Showcase Block
A straightforward display of your intellectual property.
* **Visible Components:**
  * Section title (click-to-edit)
  * Media gallery (3-5 images in a simple grid/row)
  * Short description field (click-to-edit)
  * Optional "Learn more" link

### 3. Community Hub Block
A simplified community preview.
* **Visible Components:**
  * Section title (click-to-edit)
  * Member count display
  * 2-3 testimonial slots with avatar, name, and quote
  * Social media link icons

### 4. NFT Collection Block
A basic showcase of digital assets.
* **Visible Components:**
  * Section title (click-to-edit)
  * Gallery view of 4-6 NFTs in grid format
  * Collection description (click-to-edit)
  * "View collection" button

### 5. Call-to-Action Block
A clean conversion point.
* **Visible Components:**
  * Headline text (click-to-edit)
  * Supporting text paragraph (click-to-edit)
  * Primary action button with customizable text and link
  * Optional email capture field

## User Workflow

1. Creator clicks "Customize" on Landing Page in creator hub
2. Builder interface loads with default template
3. Creator adds/removes/reorders blocks via sidebar
4. In-place editing of text and media through click-to-edit fields
5. Theme customization through the Theme tab
6. Real-time preview on different device sizes
7. Publish to make changes live or save as draft

## Technical Architecture

### Folder Structure
```
/web/app
  /creatorhub
    /landing
      layout.tsx   # Layout with Navbar
      page.tsx     # Landing page preview (public view)
  /editor
    layout.tsx     # Standalone layout for the editor
    page.tsx       # Puck editor entry (builder mode)
    /puck
      puck.config.ts   # Puck schema + block definitions
      /blocks
        HeroBlock.tsx
        IPShowcaseBlock.tsx
        CommunityHubBlock.tsx
        NFTDisplayBlock.tsx
        CTA.tsx
        Roadmap.tsx   # (Future expansion)
        FAQ.tsx       # (Future expansion)
        Partners.tsx  # (Future expansion)
      Editor.tsx    # Mounts the Puck editor (builder mode)
      Viewer.tsx    # Renders the live landing page preview
    /hooks
      useLandingPageStore.ts # Zustand state management
      useThemeTokens.ts     # Design token management
    /utils
      defaultBlocks.ts      # Starter template blocks
        colorUtils.ts         # 60/30/10 palette validation
        themePresets.ts       # Pre-defined color schemes
        mediaUploader.ts      # For image/video inputs
      /types
        BlockTypes.ts         # TypeScript types for blocks
        ThemeTypes.ts         # TypeScript types fortheming
```

### CSS Variable Implementation
The tokens are converted to CSS variables:

```css
:root {
  /* 60% - Base */
  --color-base-primary: #1a1a2e;
  --color-base-lighter: #2a2a3e;
  --color-base-darker: #0a0a1e;

  /* 30% - Secondary */
  --color-secondary-primary: #16213e;
  --color-secondary-lighter: #26314e;
  --color-secondary-darker: #06112e;

  /* 10% - Accent */
  --color-accent-primary: #0f3460;
  --color-accent-lighter: #1f4470;
  --color-accent-darker: #0f2450;

  /* Text colors */
  --color-text-on-base: #ffffff;
  --color-text-on-secondary: #f0f0f0;
  --color-text-on-accent: #ffffff;
  --color-text-muted: #a0a0a0;
}
```

### Component Examples

#### Block Component
```tsx
// components/blocks/HeroBlock.tsx
import React from 'react';
import { LiveEditorField } from '../LiveEditorField';

export const HeroBlock = ({
  title = 'Welcome to Your World',
  subtitle = 'This is the starting point of your lore.',
  image,
  alignment = 'center'
}) => {
  return (
    <section className={`py-12 px-6 text-${alignment} bg-base-primary`}>
      {image && <img src={image} alt="Hero Visual" className="mx-auto mb-6 max-w-[200px]" />}
      <LiveEditorField
        as="h1"
        value={title}
        className="text-4xl font-bold text-on-base mb-2"
      />
      <LiveEditorField
        as="p"
        value={subtitle}
        className="text-lg text-on-base-muted"
      />
      <button className="mt-6 px-6 py-2 bg-accent-primary text-on-accent rounded-md hover:bg-accent-lighter transition-colors">
        Get Started
      </button>
    </section>
  );
};
```

#### Block Wrapper
```tsx
// components/BlockWrapper.tsx
import React from 'react';

export const BlockWrapper = ({
  children,
  isActive,
  onActivate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <div
      onClick={onActivate}
      className={`relative border ${isActive ? 'border-accent-primary shadow-xl' : 'border-transparent'} rounded-xl p-4 mb-6 transition-all duration-200`}
    >
      {isActive && (
        <div className="absolute -top-4 right-2 flex space-x-2 bg-secondary-primary rounded-md p-1">
          <button onClick={onMoveUp} className="text-on-secondary opacity-70 hover:opacity-100">↑</button>
          <button onClick={onMoveDown} className="text-on-secondary opacity-70 hover:opacity-100">↓</button>
          <button onClick={onDuplicate} className="text-on-secondary opacity-70 hover:opacity-100">⧉</button>
          <button onClick={onDelete} className="text-red-400 opacity-70 hover:opacity-100">×</button>
        </div>
      )}
      {children}
    </div>
  );
};
```

#### Theme Token Hook
```tsx
// hooks/useThemeTokens.ts
import { useMemo } from 'react';
import { useLandingPageStore } from './useLandingPageStore';
import { generateColorVariations, getContrastColor } from '../utils/colorUtils';

export function useThemeTokens() {
  const { theme } = useLandingPageStore();

  const tokens = useMemo(() => {
    const baseVariations = generateColorVariations(theme.baseColor);
    const secondaryVariations = generateColorVariations(theme.secondaryColor);
    const accentVariations = generateColorVariations(theme.accentColor);

    return {
      base: {
        primary: theme.baseColor,
        lighter: baseVariations.lighter,
        darker: baseVariations.darker,
      },
      secondary: {
        primary: theme.secondaryColor,
        lighter: secondaryVariations.lighter,
        darker: secondaryVariations.darker,
      },
      accent: {
        primary: theme.accentColor,
        lighter: accentVariations.lighter,
        darker: accentVariations.darker,
      },
      text: {
        onBase: getContrastColor(theme.baseColor),
        onSecondary: getContrastColor(theme.secondaryColor),
        onAccent: getContrastColor(theme.accentColor),
        muted: theme.textMutedColor || '#a0a0a0',
      }
    };
  }, [theme]);

  return tokens;
}
```

## State Management

The builder will use Zustand for state management with a structure like:

```typescript
interface LandingPageState {
  blocks: Block[];
  activeBlockId: string | null;
  theme: {
    baseColor: string;      // 60%
    secondaryColor: string; // 30%
    accentColor: string;    // 10%
    fontFamily: string;
    headingFontFamily: string;
    textMutedColor: string;
  };
  devicePreview: 'desktop' | 'tablet' | 'mobile';

  // Actions
  addBlock: (type: BlockType, position?: number) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  updateBlockContent: (id: string, content: Partial<BlockContent>) => void;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
  applyThemePreset: (presetId: string) => void;
  setDevicePreview: (device: 'desktop' | 'tablet' | 'mobile') => void;
}
```

## Opportunities for Improvement

1. **Live Editor Enhancement:**
   * Add rich text editing capabilities to text fields
   * Support for markdown or basic formatting options

2. **Drag-and-Drop Implementation:**
   * Implement react-dnd or similar library for true drag-and-drop reordering
   * Add visual feedback during drag operations

3. **Theme System Expansion:**
   * Add font pairing presets that complement color themes
   * Create advanced gradient and texture options

4. **Block Templates:**
   * Provide pre-designed variations of each block
   * Allow saving custom block configurations as templates

5. **Media Management:**
   * More robust media library integration
   * Image optimization for different device sizes

6. **Animations and Interactions:**
   * Add animation options for block transitions
   * Support for interactive elements (hover states, reveals)

7. **Preview Mode:**
   * Add a dedicated preview mode that removes editing UI
   * Share preview links with stakeholders before publishing

8. **SEO Controls:**
   * Add meta title, description fields
   * Social media preview customization





