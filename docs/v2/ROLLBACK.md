# Rollback Plan

## Current topology

- v1 remains deployed on Render.
- v2 is isolated in the `v2/` subdirectory.
- The domain only moves after v2 is approved.

## Fast rollback path

1. Point the domain back to the Render target.
2. Verify the DNS change at the root domain and `www`.
3. Confirm the v1 homepage, contact form, and key internal links are working.
4. Leave the v2 deployment intact for postmortem or further iteration.

## What should not be changed during v2 work

- The v1 code path.
- The canonical content JSON files used by v1.
- The live Render deployment unless the user explicitly requests it.

## Pre-cutover checks

- Build passes on v2.
- Mobile and desktop smoke tests pass.
- Contact form still works.
- SEO tags and sitemap are correct.
- The user has visually approved the design.

## Post-cutover checks

- The root domain resolves to v2.
- The canonical URL is correct.
- Search console verification still works.
- No mixed-content or broken-asset issues exist.

## Notes

- DNS rollback is the primary safety net.
- Keep the Render service warm during the grace window if possible.
- Document any future cutover or rollback experiments before touching production.
