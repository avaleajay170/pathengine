# Implementation Order

This order minimizes disruption and keeps the current prototype runnable after every phase.

1. **Contract and infrastructure**: agree backend DTOs/error semantics from `03-api-contract.md`; add the thin API client, environment configuration, adapters, and mock-backed repository functions. Keep `src/data/mock.ts` and `src/lib/learning-path.ts` as fallbacks.
2. **Profile and onboarding**: extend profile types for interests/objectives/transcript metadata as needed; connect profile save and generation; add duplicate-generation protection, validation/error/retry, and truthful transcript upload/review.
3. **Read migration**: migrate path detail/catalogue, dashboard, explore, course detail, activity, and skill history to query hooks one surface at a time. Add loading/empty/error/retry states before removing direct mock reads from that surface.
4. **Progress mutations**: connect enrollment, node completion, and add-to-path. Preserve local optimistic behavior only when rollback/error semantics are explicit; invalidate affected queries on success.
5. **Feedback and adaptation**: replace timer success claims with the feedback mutation, returned-path rendering, change summary, affected-node indication, and dashboard refresh.
6. **Assistant integration**: extend the existing `AssistantProvider` boundary for real message requests, context, metadata/actions, errors/retry, and optional streaming. Keep `ChatThread` and widget as the shared renderers.
7. **Cross-cutting quality**: add chart alternatives, live regions, skip navigation, reduced motion, focus/contrast checks, responsive checks, and focused tests.
8. **Verification**: run the acceptance scenarios, `npm test`, `npm run typecheck`, `npm run lint`, and production build. Confirm no existing route, fallback, or local prototype flow was regressed.

## Change discipline
Extend `onboarding.tsx`, `path.$id.tsx`, `dashboard.tsx`, `PathNode.tsx`, `CourseCard.tsx`, `Chat.tsx`, and existing providers where they already own the behavior. Add a new file only for the API/repository/hook/type boundary or genuinely shared state UI. Do not replace TanStack Router, React, Tailwind, Radix, Recharts, or the current provider order.
