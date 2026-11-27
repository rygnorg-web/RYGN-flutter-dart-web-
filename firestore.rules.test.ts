/**
 * Phase 0 Payload-First Security TDD Spec for firestore.rules.
 * Documents the 12 adversarial "Dirty Dozen" test cases against the ruleset.
 * Intended to run against the Firebase Emulator Suite (@firebase/rules-unit-testing).
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  actor: { uid?: string; email?: string; email_verified?: boolean } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_PAYLOADS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated hero write',
    actor: null,
    operation: 'create',
    path: 'site_config/hero',
    payload: { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', updatedBy: 'anon', updatedAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-admin verified user hero write',
    actor: { uid: 'user-1', email: 'visitor@example.com', email_verified: true },
    operation: 'update',
    path: 'site_config/hero',
    payload: { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', updatedBy: 'user-1', updatedAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoof attack',
    actor: { uid: 'spoof-1', email: 'rygnorg@gmail.com', email_verified: false },
    operation: 'create',
    path: 'site_config/hero',
    payload: { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', updatedBy: 'spoof-1', updatedAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field injection on hero config',
    actor: { uid: 'admin-1', email: 'rygnorg@gmail.com', email_verified: true },
    operation: 'update',
    path: 'site_config/hero',
    payload: { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', updatedBy: 'admin-1', updatedAt: 'SERVER_TIME', isSuperAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Client-spoofed timestamp on hero config',
    actor: { uid: 'admin-1', email: 'rygnorg@gmail.com', email_verified: true },
    operation: 'update',
    path: 'site_config/hero',
    payload: { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', updatedBy: 'admin-1', updatedAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Admin UID spoofing in updatedBy',
    actor: { uid: 'admin-1', email: 'rygnorg@gmail.com', email_verified: true },
    operation: 'update',
    path: 'site_config/hero',
    payload: { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', updatedBy: 'other-uid', updatedAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Invalid URL scheme (javascript:) in hero imageUrl',
    actor: { uid: 'admin-1', email: 'rygnorg@gmail.com', email_verified: true },
    operation: 'update',
    path: 'site_config/hero',
    payload: { imageUrl: 'javascript:alert(1)', updatedBy: 'admin-1', updatedAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Self-assigned admin privilege escalation',
    actor: { uid: 'user-1', email: 'attacker@example.com', email_verified: true },
    operation: 'create',
    path: 'admins/user-1',
    payload: { email: 'attacker@example.com', grantedBy: 'user-1', createdAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unauthorized admin directory list (PII scraping)',
    actor: { uid: 'user-1', email: 'visitor@example.com', email_verified: true },
    operation: 'list',
    path: 'admins',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Cross-user private preferences read',
    actor: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    operation: 'get',
    path: 'users/bob/preferences/simulator',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immutable ownerId tampering in preferences update',
    actor: { uid: 'alice', email: 'alice@example.com', email_verified: true },
    operation: 'update',
    path: 'users/alice/preferences/simulator',
    payload: { ownerId: 'bob', country: 'Global (English)', fontScale: 1.0, createdAt: 'EXISTING', updatedAt: 'SERVER_TIME' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized list query on site_config',
    actor: { uid: 'user-1', email: 'visitor@example.com', email_verified: true },
    operation: 'list',
    path: 'site_config',
    expected: 'PERMISSION_DENIED',
  },
];
