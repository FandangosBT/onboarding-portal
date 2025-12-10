import { describe, expect, it } from 'vitest';
import { canAccessModule } from '../permissions';

describe('canAccessModule', () => {
  it('allows dashboard for all roles', () => {
    expect(canAccessModule('dashboard', 'client_user')).toBe(true);
    expect(canAccessModule('dashboard', 'client_owner')).toBe(true);
    expect(canAccessModule('dashboard', 'internal_admin')).toBe(true);
    expect(canAccessModule('dashboard', 'internal_staff')).toBe(true);
  });

  it('blocks CRM for clientes', () => {
    expect(canAccessModule('crm', 'client_user')).toBe(false);
    expect(canAccessModule('crm', 'client_owner')).toBe(false);
    expect(canAccessModule('crm', 'internal_admin')).toBe(true);
    expect(canAccessModule('crm', 'internal_staff')).toBe(true);
  });

  it('returns false when role is null', () => {
    expect(canAccessModule('dashboard', null)).toBe(false);
  });
});
