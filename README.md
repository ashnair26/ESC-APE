# ESC-APE
ESCAPE Creator Community and Creator Engine admin interface

## Overview
ESCAPE (Extensible Server for Context-Aware Protocol Execution) is a Web3-native creation platform for IP storytelling, NFT evolution, community building, and gamified quests.

## 🎯 Features
- Build without writing code
- Manage gated content, quests, and NFT evolutions
- Connect directly with Farcaster and X.com followers
- Monetize NFTs, fan programs, and IP-based digital assets

## 🧱 Core Tech Stack

| Layer | Technology |
|-------------|-------------------------------------|
| Frontend | React + TailwindCSS + ShadcnUI |
| Auth/Social | Privy (Wallet + X + Farcaster) |
| Database | Supabase |
| CMS | Sanity (creator-managed content UI) |
| Blockchain | ERC-721 (NFTs) |

## 🚀 Getting Started

See the following documentation for more details:
- [Planning Document](docs/planning.md): Architecture, goals, style, and constraints
- [UI & Accessibility](docs/ui-accessibility.md): Tailwind + ARIA + mobile standards
- [Supabase Schema](docs/supabase-schema.md): Database tables and relationships
- [Social Integration](docs/social-integration.md): X + Farcaster casting + identity

## 🧪 Testing

Run tests with pytest:

```bash
pytest --cov=escape
```

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
