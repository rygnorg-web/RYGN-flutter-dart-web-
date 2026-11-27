# RYGN Firebase Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Centralized Published Content (`/cms_published/{itemId}`)**
   - Public `get` and `list` are permitted only when `resource.data.isPublic == true`. Public queries MUST include `where('isPublic', '==', true)`.
   - Only verified admins (`request.auth.token.email_verified == true` and either bootstrapped admin `rygnorg@gmail.com` or an existing `/admins/{uid}` record) may create, update, or delete published items.
   - Immutable identity/structural fields (`itemId`, `pageId`, `sectionId`, `contentType`) cannot be changed on update.
   - Text values are bounded (`1..100000` chars); media values (`image`, `logo`, `banner`) must match `https://...` or `data:image/(jpeg|png|webp);base64,...` (`10..750000` chars).
   - `updatedBy`, `updatedByEmail`, and `updatedAt` are bound to `request.auth.uid`, `request.auth.token.email`, and `request.time`.

2. **Private Admin Drafts (`/cms_drafts/{itemId}`)**
   - Zero public access (`get` and `write` strictly require `isAdmin()`, and `allow list: if false;` prevents collection enumeration).
   - Immutable structural fields (`itemId`, `pageId`, `sectionId`, `contentType`) and identical volumetric validation as `cms_published`.

3. **Immutable CMS Audit History (`/cms_history/{historyId}`)**
   - Admin-only `get`, verified-admin `create`, and `update`/`delete` permanently denied (`if false`) for tamper-evident audit logging.
   - `allow list` uses no `get()`/`exists()` calls (Pillar 8 compliance), permitting bootstrapped admin listing or author-filtered queries (`updatedBy == request.auth.uid`).

4. **Legacy Configurations (`/site_config/{configId}`, `/page_texts/{pageId}`)**
   - Scoped strictly to known document IDs (`hero`, `donate`, `mission`, `leadership` and `home`, `donate`, `mission`, `leadership`).
   - Collection `list` disabled; writes restricted to verified admins with `hasOnly(...)` field whitelisting.

5. **Admin Role Directory (`/admins/{adminUid}`)**
   - Contains PII (`email`), so `get` is restricted to self (`isOwner(adminUid)`) or verified admins; `list` is restricted to the bootstrapped admin.
   - Non-admins cannot self-assign or modify admin records.

6. **Private User Preferences (`/users/{userId}/preferences/{prefId}`)**
   - Strictly isolated to the verified authenticated owner (`request.auth.uid == userId`).
   - `ownerId` and `createdAt` are immutable after creation; `fontScale` bounded `0.8..1.5`, `country` bounded `2..80` chars.
