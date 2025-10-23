# Evolt Monorepo

> **Evolt** is a blockchain-powered investment platform that allows users to own fractionalized **Real World Assets (RWA)** — such as real estate, creator IP, agriculture, and private credit — directly from WhatsApp or web.  
> This monorepo hosts both the **backend (Fastify + Hedera SDK)** and **frontend (Next.js + WalletConnect)** applications.

---

evolt/
├── apps/
│ ├── evolt-be/ # Fastify + TypeScript backend
│ └── evolt-fe/ # Next.js frontend (dApp)
├── package.json # Root workspace configuration
└── README.md # This file

## Monorepo Overview

### Tech Stack

| Layer                | Technology                                           |
| :------------------- | :--------------------------------------------------- |
| **Frontend**         | Next.js 15, Tailwind CSS, React Query, WalletConnect |
| **Backend**          | Fastify 5, TypeScript, Hedera SDK                    |
| **Database**         | MongoDB (Atlas or local)                             |
| **Queue**            | BullMQ + Redis                                       |
| **Storage**          | Azure Blob Storage + Key Vault                       |
| **Messaging**        | WhatsApp Cloud API                                   |
| **AI (optional)**    | OpenAI GPT-4o / GPT-5                                |
| **Monorepo Tooling** | NPM Workspaces + Concurrently                        |

---

## 🧠 Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <your-monorepo-url> evolt
cd evolt
```

2️⃣ Install Dependencies

From the root directory:
yarn install

This installs dependencies for both:
• apps/evolt-be (backend)
• apps/evolt-fe (frontend)

3️⃣ Environment Configuration

Backend (apps/evolt-be/.env)

# ─── General ─────────────────────────────

DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/evolt
JWT_SECRET=your_jwt_secret

# ─── Redis ───────────────────────────────

UPSTASH_REDIS_URL=redis://...

# ─── Azure Storage ───────────────────────

AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=...
AZURE_STORAGE_CONTAINER=kyc-documents
AZURE_KEY_VAULT_URI=https://ev-wallet-kv.vault.azure.net/
KV_WRAP_KEY_NAME=ev-wrap-key

# ─── Hedera Network ──────────────────────

HEDERA_OPERATOR_ID=0.0.xxxxxxx
HEDERA_OPERATOR_KEY=302e02...
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api
HEDERA_VUSD_TOKEN_ID=0.0.7029847
HEDERA_USDC_TOKEN_ID=0.0.7098968
HEDERA_USDT_TOKEN_ID=0.0.7098970
VOLT_ESCROW_CONTRACT_ID=0.0.123789

# ─── WhatsApp Cloud API ──────────────────

WHATSAPP_TOKEN=<your_meta_token>
WHATSAPP_PHONE_ID=585552874640448
WHATSAPP_VERIFY_TOKEN=pmAuEo8mjEn97ca8JPow23rKslRB11Gg

# ─── Email ───────────────────────────────

SENDGRID_API_KEY=<your_sendgrid_key>
EMAIL_FROM=sadiq@mindcolony.tech

# ─── Optional AI Assistant ───────────────

OPENAI_API_KEY=<your_openai_key>

Frontend (apps/evolt-fe/.env.local)

# VoltPay Backend API URL

NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com/api/v1

# Volt Escrow Smart Contract Address

NEXT_PUBLIC_ESCROW_EVM_ADDRESS=0x803A0eF8ef6732d281A90901a3C9B5fb21ee84C1

# Volt USD Token ID

NEXT_PUBLIC_VUSD_TOKEN_ID=0.0.7029847

# WalletConnect Project ID

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=38297174ee7fce4541534856932bdeb8

NEXT_PUBLIC_LOGO_URL=http://localhost:2020/logo.png

NEXT_PUBLIC_HEDERA_VUSD_TOKEN_ID=0.0.7029847
NEXT_PUBLIC_HEDERA_VUSD_EVM_ADDRESS=0x00000000000000000000000000000000006b4457
NEXT_PUBLIC_HEDERA_USDC_TOKEN_ID=0.0.7098968

🚀 Running the Project

From the root directory, run both frontend and backend together:
yarn run dev

This command uses concurrently to start:
• Backend → apps/evolt-be on port 3000
• Frontend → apps/evolt-fe on port 2020

Or run them individually:

Backend only:
yarn run dev:be

Frontend only:
yarn run dev:fe

Backend (Fastify API)

Development

cd apps/evolt-be
yar run start:dev

Build

yarn run build
