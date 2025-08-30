import { describe, it, expect } from 'vitest'
import { hasPermission, canAccessPage } from '../../../src/utils/permissions'
import type { UserRole } from '../../../src/utils/permissions'

describe('Permission Utils', () => {
  describe('hasPermission', () => {
    it('returns true for admin users with any permission', () => {
      expect(hasPermission('admin', 'canAccessDashboard')).toBe(true)
      expect(hasPermission('admin', 'canAccessUsers')).toBe(true)
      expect(hasPermission('admin', 'canCreate')).toBe(true)
      expect(hasPermission('admin', 'canDelete')).toBe(true)
    })

    it('returns true when user has specific permission', () => {
      expect(hasPermission('member', 'canAccessDashboard')).toBe(true)
      expect(hasPermission('member', 'canCreate')).toBe(true)
      expect(hasPermission('member', 'canEdit')).toBe(true)
    })

    it('returns false when user lacks permission', () => {
      expect(hasPermission('read_only', 'canCreate')).toBe(false)
      expect(hasPermission('read_only', 'canEdit')).toBe(false)
      expect(hasPermission('read_only', 'canDelete')).toBe(false)
      expect(hasPermission('scanner', 'canAccessDashboard')).toBe(false)
    })

    it('handles undefined user role', () => {
      expect(hasPermission(undefined, 'canAccessDashboard')).toBe(false)
    })
  })

  describe('canAccessPage', () => {
    it('allows access to dashboard for authorized roles', () => {
      expect(canAccessPage('admin', 'dashboard')).toBe(true)
      expect(canAccessPage('member', 'dashboard')).toBe(true)
      expect(canAccessPage('read_only', 'dashboard')).toBe(true)
      expect(canAccessPage('scanner', 'dashboard')).toBe(false)
    })

    it('restricts user access to admin users', () => {
      expect(canAccessPage('admin', 'users')).toBe(true)
      expect(canAccessPage('member', 'users')).toBe(false)
      expect(canAccessPage('scanner', 'users')).toBe(false)
      expect(canAccessPage('read_only', 'users')).toBe(false)
    })

    it('allows scanner access only to scanner users', () => {
      expect(canAccessPage('scanner', 'scanner')).toBe(true)
      expect(canAccessPage('member', 'scanner')).toBe(true)
      expect(canAccessPage('read_only', 'scanner')).toBe(false)
    })

    it('handles undefined user role', () => {
      expect(canAccessPage(undefined, 'dashboard')).toBe(false)
    })
  })
})
