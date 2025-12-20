import { Role } from '@prisma/client'

export function formatRole(role: Role): string {
  switch (role) {
    case Role.FOUNDER:
      return 'Creator'
    case Role.VALIDATOR:
      return 'Validator'
    case Role.MEMBER:
      return 'Member'
    default:
      return role
  }
}

