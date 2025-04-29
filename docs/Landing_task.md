# 📋 LandingTask.md

## 📌 Instructions
- **Task format**: `[ ]` means "to do", `[x]` means "done".
- **When complete**, strike through by changing `[ ]` → `[x]`.
- Example:
  ```
  - [x] Setup project folders
  ```

---

## 🧱 Landing Page Builder Setup Tasks

### 1. 📁 Project Structure
- [ ] Create `/web/app/creatorhub/landing/layout.tsx`
- [ ] Create `/web/app/creatorhub/landing/page.tsx`
- [ ] Create `/web/app/editor/layout.tsx`
- [ ] Create `/web/app/editor/page.tsx`
- [ ] Create `/web/app/editor/puck/`
- [ ] Create `/web/app/editor/puck/Editor.tsx`
- [ ] Create `/web/app/editor/puck/Viewer.tsx`
- [ ] Create `/web/app/editor/puck/puck.config.ts`
- [ ] Create `/web/app/editor/puck/blocks/` folder
  - [ ] `HeroBlock.tsx`
  - [ ] `IPShowcaseBlock.tsx`
  - [ ] `CommunityHubBlock.tsx`
  - [ ] `NFTDisplayBlock.tsx`
  - [ ] `CTA.tsx`
  - [ ] `Roadmap.tsx` (Future expansion)
  - [ ] `FAQ.tsx` (Future expansion)
  - [ ] `Partners.tsx` (Future expansion)
- [ ] Create `/web/app/editor/hooks/useLandingPageStore.ts`
- [ ] Create `/web/app/editor/hooks/useThemeTokens.ts`
- [ ] Create `/web/app/editor/hooks/useNFTGates.ts`
- [ ] Create `/web/app/editor/utils/defaultBlocks.ts`
- [ ] Create `/web/app/editor/utils/colorUtils.ts`
- [ ] Create `/web/app/editor/utils/themePresets.ts`
- [ ] Create `/web/app/editor/utils/mediaUploader.ts`
- [ ] Create `/web/app/editor/types/BlockTypes.ts`
- [ ] Create `/web/app/editor/types/ThemeTypes.ts`

---

### 2. 🛠 Puck Integration
- [ ] Install Puck SDK (`npm install @measured/puck`)
- [ ] Fork or clone Puck for ESC/APE customization
- [ ] Configure `puck.config.ts` with ESC/APE block schemas
- [ ] Implement `Editor.tsx` to mount the Puck Editor
- [ ] Implement `Viewer.tsx` to render Landing Page from Puck JSON

---

### 3. 🎨 Builder UI & Flow
- [ ] Implement `CUSTOMISE` button in landing page that links to `/editor`
- [ ] Create standalone editor layout without CreatorHub Navbar
- [ ] Enable direct editing of text, images, and links in blocks
- [ ] Implement Desktop/Tablet/Mobile preview toggle
- [ ] Create Save functionality to update JSON in state
- [ ] Implement Publish functionality to push to IPFS via Fleek

---

### 4. 🔐 NFT-Gated Blocks
- [ ] Build `useNFTGates.ts` hook to fetch wallet NFTs
- [ ] Update `Viewer.tsx` to detect `gatedBy` fields in blocks
- [ ] Implement teaser/fallback rendering for users without required NFTs
- [ ] Create UI for creators to specify `gatedBy` settings in blocks

---

### 5. 🎨 60/30/10 Theme System
- [ ] Implement `useThemeTokens.ts` for color theming
- [ ] Create `themePresets.ts` with default theme options
- [ ] Add WCAG AA accessibility validation for color selections
- [ ] Build theme editing UI in Sidebar → Theme tab

---

### 6. 📦 Publishing Pipeline
- [ ] Integrate Fleek IPFS upload functionality
- [ ] Implement ENS domain handling for public URLs
- [ ] Add validation for IPFS publishing success/failure

---

### 7. 📚 Documentation and Code Comments
- [ ] Create README.md in `/puck` explaining Puck customization
- [ ] Add usage examples and documentation in `puck.config.ts`
- [ ] Add comprehensive comments to main components (Editor, Viewer, hooks)

---

## ✅ Summary

| Area | Tasks |
|-----|------|
| Folder Setup | 22 |
| Puck Integration | 5 |
| UI & Flow | 6 |
| NFT-Gating | 4 |
| Theme System | 4 |
| Publishing | 3 |
| Documentation | 3 |
| **Total** | **47** |

---

## 🚀 Phased Implementation Plan

### Phase 1 (MVP)
- [ ] Basic folder structure and project setup
- [ ] Create `/editor` page with standalone layout
- [ ] Implement CUSTOMISE button in landing page that links to `/editor`
- [ ] Puck integration with ESC/APE styling
- [ ] Core blocks implementation:
  - [ ] HeroBlock
  - [ ] IPShowcaseBlock
  - [ ] CTA
- [ ] Basic theme system (60/30/10)
- [ ] Simple save/publish functionality

### Phase 2 (Enhanced Features)
- [ ] Remaining core blocks:
  - [ ] CommunityHubBlock
  - [ ] NFTDisplayBlock
- [ ] NFT-gated content implementation
- [ ] Advanced theme options
- [ ] Full IPFS & ENS integration

### Phase 3 (Future Expansion)
- [ ] Additional blocks:
  - [ ] Roadmap
  - [ ] FAQ
  - [ ] Partners
- [ ] Advanced styling options
- [ ] Performance optimizations
- [ ] Analytics integration
