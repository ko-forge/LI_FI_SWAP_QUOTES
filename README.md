# LI.FI Swap Quotes

A small React web app for browsing cross-chain swap quotes from the [LI.FI](https://li.fi/) public API.

Users can choose:

- a **from** chain + token
- a **to** chain + token
- an **amount**

…and see a live quote (receive amount, USD values, route, estimated time, gas, slippage).

There is **no wallet connection**, **no signing**, and **no swap execution**. Quotes only.

---

## Features

- Chain selection (EVM mainnets from LI.FI)
- Searchable token selection with virtualized lists
- Debounced live quotes as inputs change
- Quote details: receive amount, min received, route/tool, timing, gas, slippage
- Switch button to flip from/to sides
- Loading skeletons, error states, and previous-quote retention while refetching

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Bundler | Vite 8 |
| Routing | TanStack Router (file-based SPA) |
| Data fetching | TanStack Query |
| Lists | TanStack Virtual |
| Styling | Tailwind CSS 4 + custom CSS variables |
| API | LI.FI public REST API (no API key) |
| Tooling | ESLint (`@tanstack/eslint-config`) + Prettier |

---

## Prerequisites

- Node.js 20+ (developed on Node 24)
- npm (comes with Node)

---

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run preview
```

---

## How to use the app

1. Open the app in the browser.
2. Under **You pay**, set amount, chain, and token.
3. Under **You receive**, set destination chain and token.
4. Wait a moment — the quote updates automatically after a short debounce.
5. Optionally use the switch control to flip from/to.

Default starting route:

- From: Ethereum / ETH
- To: Base / USDC
- Amount: `1`

---

## LI.FI API integration

Base URL: `https://li.quest/v1`

| Endpoint | Purpose | Used for |
| --- | --- | --- |
| `GET /chains` | List supported chains | Chain dropdowns (`chainTypes=EVM`, mainnets only) |
| `GET /tokens` | List tokens for a chain | Token pickers (`?chains={chainId}`) |
| `GET /quote` | Request a swap quote | Live quote panel |

### Quote parameters

Required by LI.FI:

- `fromChain`, `toChain`
- `fromToken`, `toToken` (address or symbol)
- `fromAmount` (base units, including decimals)
- `fromAddress` (wallet address)

This app never connects a wallet. Quotes use a **fixed placeholder address** from LI.FI’s docs:

```text
0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0
```

Defined in `src/lib/constants.ts` as `QUOTE_FROM_ADDRESS`.

No API key is required for these public endpoints.

---

## Project structure

```text
src/
├── api/lifi/
│   ├── client.ts        # fetch wrapper + LifiApiError
│   ├── endpoints.ts     # getChains / getTokenCatalog / getQuote
│   ├── query-keys.ts    # TanStack Query key factory
│   └── types.ts         # API response types
├── components/
│   ├── amount-input.tsx
│   ├── chain-select.tsx
│   ├── quote-result.tsx
│   ├── swap-form.tsx    # main form + quote orchestration
│   ├── token-logo.tsx
│   └── token-select.tsx # searchable + virtualized dropdown
├── hooks/
│   ├── use-chains.ts
│   ├── use-tokens.ts    # catalog fetch + popular-chain prefetch
│   ├── use-quote.ts
│   └── use-debounced-value.ts
├── lib/
│   ├── constants.ts
│   ├── format.ts        # amount / USD / duration helpers
│   ├── query-client.ts
│   └── tokens.ts        # slim, sort, index, filter tokens
├── routes/
│   ├── __root.tsx       # app shell
│   └── index.tsx        # home page
├── main.tsx
├── router.tsx
└── styles.css
```

---

## Architecture notes

### Data flow

1. `useChains` loads EVM mainnets once (long `staleTime`).
2. Selecting a chain triggers `useTokens(chainId)`.
3. Tokens are normalized into a **catalog**:
   - slimmed fields
   - popularity-sorted list
   - `byAddress` map for O(1) lookup
4. When amount + tokens are valid, `useQuote` fetches `/quote`.
5. Amount input is debounced (~400ms) to avoid spamming the API.

### Performance choices

- Token JSON is large (thousands per chain) — slim + sort once in the query function
- Token dropdown uses `@tanstack/react-virtual` so only visible rows render
- Search is debounced; results are ranked (prefix matches first)
- Popular chains (Ethereum, Base, Arbitrum, Optimism, Polygon) are prefetched
- Quotes use `keepPreviousData` so the UI stays stable while refetching
- Failed token logos are cached so broken images aren’t retried repeatedly

### UI

- Outfit for UI text, IBM Plex Mono for amounts
- Soft green/slate theme with light grid atmosphere
- Stacked swap layout: pay → switch → receive → quote card

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run generate-routes` | Regenerate TanStack Router route tree |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier + ESLint autofix |
| `npm run check` | Check Prettier formatting |

---

## What was built (changelog)

1. **Scaffold** — TanStack Router SPA (Vite + React + TypeScript + Tailwind).
2. **TanStack Query** — shared `QueryClient`, router context, Query Devtools.
3. **LI.FI API layer** — typed client for chains, tokens, and quotes.
4. **Swap form** — chain/token/amount selection with live quotes.
5. **UI polish** — branded shell, stacked swap layout, skeletons, motion.
6. **Performance** — token catalogs, virtualized search, prefetch, quote placeholder data.

---

## Out of scope

- Wallet connect / account abstraction
- Transaction signing or broadcasting
- Approvals, balances, or portfolio views
- Non-EVM chains in the UI (API may support them; this app filters to EVM mainnets)

---

## Product Deployment

- The project is online on Vercel.

https://li-fi-swap-quotes.vercel.app/
