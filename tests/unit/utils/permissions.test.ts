import { describe, it, expect } from 'vitest'
import { hasPermission } from '../../../src/utils/permissions'

describe('Permission Utils', () => {
  describe('hasPermission', () => {
    it('returns true for admin users with any permission', () => {
      expect(hasPermission('ADMIN', 'canAccessDashboard')).toBe(true)
      expect(hasPermission('ADMIN', 'canAccessUsers')).toBe(true)
      expect(hasPermission('ADMIN', 'canCreate')).toBe(true)
      expect(hasPermission('ADMIN', 'canDelete')).toBe(true)
    })

    it('returns true when user has specific permission', () => {
      expect(hasPermission('MEMBER', 'canAccessDashboard')).toBe(true)
      expect(hasPermission('MEMBER', 'canCreate')).toBe(true)
      expect(hasPermission('MEMBER', 'canEdit')).toBe(true)
    })

    it('returns false when user lacks permission', () => {
      expect(hasPermission('MEMBER', 'canAccessUsers')).toBe(false)
      expect(hasPermission('MEMBER', 'canManageUsers')).toBe(false)
      expect(hasPermission('MEMBER', 'canAccessAdmin')).toBe(false)
    })

    it('handles undefined user role', () => {
      expect(hasPermission(undefined, 'canAccessDashboard')).toBe(false)
    })
  })
})
