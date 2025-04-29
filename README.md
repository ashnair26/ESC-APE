## 📜 ESC/APE — Building Decentralized Cultural Infrastructure for Creators

ESC/APE is a decentralized cultural infrastructure layer built on top of the Towns Protocol, empowering creators to turn their IP into evolving, community-driven economies — without reliance on studios, publishers, or centralized platforms.

Our mission is to provide creators with sovereignty over their content, relationships, and revenue models — without dependency on centralized platforms.

## 🛠 Our Mission
We help creators build living, collaborative IP universes —
where fan communities become active participants, lore co-creators, and stakeholders in the worlds they love.


## 🧱 Core Tech Stack

| Layer | Technology |
|-------------|-------------------------------------|
| Frontend | React + TailwindCSS + ShadcnUI |
| Auth/Social | Privy (Wallet + X + Farcaster) |
| Database | Supabase |
| CMS | Sanity (creator-managed content UI) |
| Blockchain | ERC-721 (NFTs) |

## 🧩 Tech Stack

- **Frontend:** React + TailwindCSS
- **Backend:** FastAPI (Python)
- **Database:** Supabase (PostgreSQL, Auth)
- **Authentication:** Privy (Wallet + X + Farcaster)
- **Identity Layer:** JWT’s + Privy Sessions
- **Blockchain:** Base (ERC-721)
- **Communication:** Towns Protocol SDK
- **DnD Builder:** Puck SDK
- **CMS:** | Sanity (creator-managed content UI) 
- **Hosting:** Fleek (for decentralized hosting)

## 🧩 Core Features

**NFT Variable Blocks as living modular Landing Pages**
- Dynamic, Netflix-style community pages that evolve based on NFT ownership.

**Gamified Dynamic Graphic Novel Reader:**
- Lore panels become dynamic, mintable NFTs that unlock portals into shared worlds.

**Portal NFTs:**
- New NFTs formed from lore merges between communities, unlocking co-owned spaces.

**Towns Protocol Native:** 
- Real-time communication, coordination, and governance. 

**XP and Reputation Systems:** 
- Fans earn prestige, XP, and lore governance rights by contributing to communities.

**Shared Worlds:** 
- IP universes can organically link, evolve, and co-own story ecosystems together.

**Data & Analytics Layer**
- Track emerging IP, fan engagement, lore contribution metrics, and “Hype Scores” for creators and investors.

---

**Current State:**
Creators → Siloed Communities → Fragmented IP → Dependence on Web2 Platforms

**ESC/APE Future:**
Creators + Fans (NFT Ownership)  
→ Dynamic Landing Pages  
→ Shared Worlds  
→ Co-Owned IP Ecosystem  
→ Decentralized Creative Economies  
→ Shared World Unlock


## 🌐 How We Integrate with Towns Protocol
ESC/APE operates modularly alongside Towns’ core contracts (Diamond Standard).

We interact via wallet-based access controls and offchain metadata indexing — respecting Towns’ sovereignty without modifying base contracts.

Revenue flows: We extend value (Portal NFTs, Lore NFTs, XP systems) without interfering with Towns’ core fee structure.

Chain-agnostic design: Built for Base today, and architected to evolve with future EVM-compatible environments Towns may support.

🛡️ Towns decentralized where we gather.
ESC/APE adds the cultural layer — meaning is why communities stay.

## 💸 Revenue Model Summary
ESC/APE extends Towns’ ecosystem without interfering with its core transaction fees.
Our revenue generation model focuses on enhancing the cultural and creative economy built on top of Towns Spaces:

| Source | Description |
|:---|:---|
| **Portal NFT Mint Fees** | When two communities agree to open a shared lore space, ESC/APE charges a small minting fee (5–10%) on the Portal NFTs that enable access. |

| **Landing Page Marketplace** | Communities can sell modular NFT Blocks (themes, quest modules, lore pages) in an open marketplace. ESC/APE collects a small commission on secondary sales. |

| **Subscription Upgrades** | Communities can offer paid subscription tiers (e.g., early lore access, NFT evolution perks). ESC/APE offers optional tooling for this and takes a light platform fee (e.g., 5%). |

| **Lore Unlocks and Evolving NFTs** | Future models allow minting of dynamic NFTs tied to story progression, quest achievements, or lore discovery — with ESC/APE earning a % on initial mint sales. |

Important:
Towns retains ownership of all transaction fees tied to base Space minting, access NFTs, and standard activity.

ESC/APE operates modularly alongside, enhancing cultural interoperability and world-building without disrupting Towns’ economic flows.

## 🧠 FastAPI Modular Structure

- `main.py` – Entry point, mounts all routes
- `auth_routes.py` – Handles authentication and token logic via Privy
- `mcp_routes.py` – Unified tool call and server discovery logic
- `models.py` – All Pydantic schemas
- `session_utils.py` – MCP session handling and app lifecycle hooks

## 🛠 Modular Project Structure

api/
  ├── main.py               # Launches FastAPI app and includes routers
  ├── auth_routes.py         # Authentication endpoints (Privy, JWTs)
  ├── mcp_routes.py          # MCP server tool routing
  ├── models.py              # Pydantic schemas for requests/responses
  └── session_utils.py       # MCP sessions, startup/shutdown utilities



## 🔥 API Routes:

| Route | Method | Description |
|:---|:---|:---|
| `/auth/verify` | POST | Verify Privy token |
| `/auth/refresh` | POST | Refresh Privy session |
| `/servers` | GET | List all available MCP servers |
| `/servers/{server}/tools` | GET | List tools available on a specific MCP server |
| `/servers/{server}/tools/{tool}` | POST | Call a specific tool on an MCP server |
| `/tools` | POST | Call a tool on any server (unified endpoint) |

## 📖 API Documentation

While running locally, you can access the interactive Swagger UI:

[http://localhost:8000/docs](http://localhost:8000/docs)

It provides a live interface to explore and test all available API endpoints.


## 🔭 Next Steps
- 🧪 Implement first Portal NFT Lore Merge prototype.

- 📈 Expand Analytics dashboard (IP Hype Score, Crossover Intelligence).

- 🛡️ Explore minimal Facet extensions respecting Towns’ modular architecture.

- 🚀 Public beta launch with initial ESCAPE KIM IP universe as proof-of-concept.


## 🛠 Current Status

- ✅ Platform architecture designed
- ✅ Supabase integration for data management
- ✅ Privy authentication configured (wallet, email, Twitter logins)
- 🚧 Landing page builder under development
- 🚧 Towns integration in planning phase
- 🚧 NFT minting and XP reputation system in prototype stage


📚 License
© 2025 ESC/APE Labs. All Rights Reserved.
MIT License (with open future extensions for Towns-based community tools).

## 📘 Developer Docs

- [Landing Page Builder Plan](./docs/Landing_Planning.md)
- [Landing Page Task Breakdown](./docs/Landing_task.md)



