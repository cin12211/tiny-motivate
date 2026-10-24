<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useDebounceFn } from '@vueuse/core'
import type { AdminUserItem } from '~/composables/useAdmin'

definePageMeta({
  middleware: ['admin'],
})

useHead({ title: 'Admin Dashboard · Tiny Motivate' })

const { user: currentUser } = useAuth()
const { listUsers, setRole, banUser, unbanUser } = useAdmin()

const loading = ref(true)
const users = ref<AdminUserItem[]>([])
const total = ref(0)
const search = ref('')
const page = ref(1)
const limit = 15

// Ban dialog state
const banModalOpen = ref(false)
const targetUser = ref<AdminUserItem | null>(null)
const banReason = ref('')
const banDuration = ref<'permanent' | '7d' | '30d'>('permanent')
const actionPending = ref(false)

async function loadData() {
  loading.value = true
  try {
    const offset = (page.value - 1) * limit
    const res = await listUsers({
      limit,
      offset,
      searchValue: search.value.trim() || undefined,
    })
    users.value = res.users
    total.value = res.total
  }
  catch (err: any) {
    toast.error(err.message || 'Không thể tải danh sách người dùng')
  }
  finally {
    loading.value = false
  }
}

const onSearchInput = useDebounceFn(() => {
  page.value = 1
  loadData()
}, 350)

watch(search, () => {
  onSearchInput()
})

watch(page, () => {
  loadData()
})

onMounted(loadData)

async function handleRoleToggle(u: AdminUserItem) {
  if (u.id === currentUser.value?.id) {
    const ok = window.confirm('Cảnh báo: Bạn đang tự đổi vai trò của chính mình! Bạn có chắc chắn muốn tiếp tục không?')
    if (!ok) return
  }
  const nextRole = u.role === 'admin' ? 'user' : 'admin'
  actionPending.value = true
  try {
    await setRole(u.id, nextRole)
    u.role = nextRole
    toast.success(`Đã đổi vai trò của ${u.name} thành ${nextRole}`)
    if (u.id === currentUser.value?.id && nextRole !== 'admin') {
      if (currentUser.value) {
        currentUser.value.role = nextRole
      }
      await navigateTo('/settings')
    }
  }
  catch (err: any) {
    toast.error(err.message || 'Lỗi khi đổi vai trò')
  }
  finally {
    actionPending.value = false
  }
}

function openBanModal(u: AdminUserItem) {
  targetUser.value = u
  banReason.value = ''
  banDuration.value = 'permanent'
  banModalOpen.value = true
}

async function submitBan() {
  if (!targetUser.value) return
  actionPending.value = true
  try {
    let expiresIn: number | undefined
    if (banDuration.value === '7d') expiresIn = 60 * 60 * 24 * 7
    else if (banDuration.value === '30d') expiresIn = 60 * 60 * 24 * 30

    await banUser(targetUser.value.id, banReason.value.trim() || undefined, expiresIn)
    targetUser.value.banned = true
    targetUser.value.banReason = banReason.value.trim() || null
    if (expiresIn) {
      targetUser.value.banExpires = new Date(Date.now() + expiresIn * 1000).toISOString()
    }
    else {
      targetUser.value.banExpires = null
    }
    toast.success(`Đã khóa tài khoản ${targetUser.value.name}`)
    banModalOpen.value = false
  }
  catch (err: any) {
    toast.error(err.message || 'Lỗi khi khóa tài khoản')
  }
  finally {
    actionPending.value = false
  }
}

async function handleUnban(u: AdminUserItem) {
  actionPending.value = true
  try {
    await unbanUser(u.id)
    u.banned = false
    u.banReason = null
    u.banExpires = null
    toast.success(`Đã mở khóa tài khoản cho ${u.name}`)
  }
  catch (err: any) {
    toast.error(err.message || 'Lỗi khi mở khóa tài khoản')
  }
  finally {
    actionPending.value = false
  }
}

function formatDate(isoString?: string | null) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }
  catch {
    return isoString
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))
</script>

<template>
  <div class="py-6">
    <!-- Top Navigation Header -->
    <div class="flex items-center justify-between pb-6 border-b border-line mb-6">
      <div class="flex items-center gap-3">
        <Button as-child variant="ghost" size="icon" class="text-indigo" aria-label="Quay lại Cài đặt">
          <NuxtLink to="/settings">
            <HandIcon name="arrow-left-01" class="size-5" />
          </NuxtLink>
        </Button>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Admin Dashboard</h1>
            <span class="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
              {{ total }} người dùng
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5">
            Quản lý người dùng, vai trò và phân quyền hệ thống
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="loading"
        class="text-xs h-8"
        @click="loadData"
      >
        <HandIcon name="loading-03" :class="loading ? 'animate-spin' : ''" />
        <span class="hidden sm:inline">Làm mới</span>
      </Button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6 flex items-center gap-3">
      <div class="relative flex-1">
        <input
          v-model="search"
          type="search"
          placeholder="Tìm theo email..."
          class="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-indigo"
        />
      </div>
    </div>

    <!-- Users List -->
    <div class="rounded-2xl border border-line bg-surface overflow-hidden">
      <div v-if="loading && !users.length" class="p-8 text-center text-sm text-muted-foreground">
        Đang tải dữ liệu...
      </div>
      <div v-else-if="!users.length" class="p-8 text-center text-sm text-muted-foreground">
        Không tìm thấy người dùng nào.
      </div>
      <div v-else class="divide-y divide-line">
        <div
          v-for="u in users"
          :key="u.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition"
        >
          <!-- User info -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {{ (u.name || u.email || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-sm text-foreground truncate">{{ u.name || 'Chưa đặt tên' }}</span>
                <span
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  :class="u.role === 'admin' ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-line'"
                >
                  {{ u.role }}
                </span>
                <span
                  v-if="u.banned"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 border border-red-500/20 dark:text-red-400"
                  :title="u.banReason ? `Lý do: ${u.banReason}` : undefined"
                >
                  Bị khóa
                </span>
              </div>
              <p class="text-xs text-muted-foreground truncate">{{ u.email }}</p>
              <p v-if="u.banned && u.banReason" class="text-[11px] text-red-600/90 dark:text-red-400/90 mt-0.5">
                Lý do khóa: {{ u.banReason }}
              </p>
              <p class="text-[11px] text-muted-foreground mt-0.5">
                Ngày tạo: {{ formatDate(u.createdAt) }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              :disabled="actionPending"
              class="text-xs h-8"
              @click="handleRoleToggle(u)"
            >
              {{ u.role === 'admin' ? 'Hạ xuống User' : 'Lên Admin' }}
            </Button>

            <Button
              v-if="!u.banned"
              variant="outline"
              size="sm"
              :disabled="actionPending"
              class="text-xs h-8 text-red-600 border-red-500/30 hover:bg-red-500/10 dark:text-red-400"
              @click="openBanModal(u)"
            >
              Khóa
            </Button>
            <Button
              v-else
              variant="outline"
              size="sm"
              :disabled="actionPending"
              class="text-xs h-8 text-primary border-primary/30 hover:bg-primary/10"
              @click="handleUnban(u)"
            >
              Mở khóa
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="mt-4 flex items-center justify-between text-xs text-muted-foreground px-1">
      <span>Trang {{ page }} / {{ totalPages }} (Tổng: {{ total }} người dùng)</span>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Sau
        </Button>
      </div>
    </div>

    <!-- Ban Modal -->
    <Dialog v-model:open="banModalOpen">
      <DialogContent class="max-w-[420px] p-6 gap-4">
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold">Khóa tài khoản</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Bạn sắp khóa tài khoản của <strong class="text-foreground">{{ targetUser?.name || 'người dùng' }}</strong> ({{ targetUser?.email }}).
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-2">
          <div>
            <label class="block text-xs font-medium mb-1.5 text-foreground">Thời hạn khóa</label>
            <select
              v-model="banDuration"
              class="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo"
            >
              <option value="permanent">Vĩnh viễn</option>
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5 text-foreground">Lý do khóa (tùy chọn)</label>
            <input
              v-model="banReason"
              type="text"
              placeholder="Ví dụ: Vi phạm quy định sử dụng..."
              class="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo"
            />
          </div>
        </div>

        <DialogFooter class="flex justify-end gap-2 sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            :disabled="actionPending"
            @click="banModalOpen = false"
          >
            Hủy
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="actionPending"
            class="border-red-500/40 bg-red-600 text-white hover:bg-red-700"
            @click="submitBan"
          >
            Xác nhận khóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
