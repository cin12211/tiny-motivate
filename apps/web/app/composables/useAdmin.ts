export interface AdminUserItem {
  id: string
  name: string
  email: string
  role: string
  banned: boolean
  banReason?: string | null
  banExpires?: string | null
  createdAt: string
}

export interface ListUsersResponse {
  users: AdminUserItem[]
  total: number
}

export function useAdmin() {
  const api = useApi()

  async function listUsers(params: {
    limit?: number
    offset?: number
    searchValue?: string
  } = {}): Promise<ListUsersResponse> {
    const query = new URLSearchParams()
    if (params.limit) query.set('limit', String(params.limit))
    if (params.offset) query.set('offset', String(params.offset))
    if (params.searchValue) {
      query.set('searchField', 'email')
      query.set('searchOperator', 'contains')
      query.set('searchValue', params.searchValue)
    }

    const res = await api<any>(`/api/auth/admin/list-users?${query.toString()}`, {
      method: 'GET',
    })

    const users = (res.users || res || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      banned: Boolean(u.banned),
      banReason: u.banReason ?? null,
      banExpires: u.banExpires ? new Date(u.banExpires).toISOString() : null,
      createdAt: u.createdAt,
    }))

    return {
      users,
      total: res.total ?? users.length,
    }
  }

  async function setRole(userId: string, role: string) {
    return api('/api/auth/admin/set-role', {
      method: 'POST',
      body: { userId, role },
    })
  }

  async function banUser(userId: string, banReason?: string, banExpiresIn?: number) {
    return api('/api/auth/admin/ban-user', {
      method: 'POST',
      body: {
        userId,
        banReason: banReason || undefined,
        banExpiresIn: banExpiresIn || undefined,
      },
    })
  }

  async function unbanUser(userId: string) {
    return api('/api/auth/admin/unban-user', {
      method: 'POST',
      body: { userId },
    })
  }

  return {
    listUsers,
    setRole,
    banUser,
    unbanUser,
  }
}
