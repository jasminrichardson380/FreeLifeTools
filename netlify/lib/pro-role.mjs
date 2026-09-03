import { admin } from '@netlify/identity'

// Canonical name of the paid-member role. `netlify.toml` gates the AI Store
// Builder on this role, and it is also accepted with a capital P so a role
// added by hand in the Netlify Identity dashboard still matches.
export const PRO_ROLE = 'pro'

const PRO_ROLE_ALIASES = ['pro', 'Pro', 'PRO']

// Roles live in `app_metadata.roles`, which is the path Netlify's CDN reads
// when evaluating `conditions = {Role = [...]}`.
export function readRoles(user) {
  if (!user) {
    return []
  }

  if (Array.isArray(user.roles)) {
    return user.roles
  }

  const appMetadata = user.appMetadata || user.app_metadata || {}

  return Array.isArray(appMetadata.roles) ? appMetadata.roles : []
}

export function hasProRole(user) {
  return readRoles(user).some((role) => PRO_ROLE_ALIASES.includes(role))
}

// Adds the Pro role to a user without dropping any roles or app metadata they
// already have. `extraMetadata` records where the grant came from.
export async function grantProRole(userId, extraMetadata = {}) {
  const current = await admin.getUser(userId)
  const appMetadata = { ...(current.appMetadata || {}) }
  const roles = Array.isArray(appMetadata.roles) ? [...appMetadata.roles] : []

  if (!roles.some((role) => PRO_ROLE_ALIASES.includes(role))) {
    roles.push(PRO_ROLE)
  }

  await admin.updateUser(userId, {
    app_metadata: { ...appMetadata, ...extraMetadata, roles },
  })
}
