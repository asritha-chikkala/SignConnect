# SignBridge Architecture

- `app/`: Next.js 14 App Router pages, API routes, and protected flows.
- `components/`: UI primitives and feature components including VRM stage.
- `services/`: External integrations (Claude, Neo4j, Deepgram-ready adapters).
- `lib/`: Shared runtime logic such as fallback orchestration and Supabase clients.
- `hooks/`: Browser hooks (IndexedDB cache and offline support).
- `data/`: Stable emergency/demo phrase datasets.
- `mobile/`: Expo companion skeleton with offline quick-phrase mode.

## Fallback Pipeline

1. Direct dictionary lookup
2. Semantic nearest mapping (Neo4j path)
3. Procedural fingerspelling fallback

Unknown words are logged and never crash the translator.
