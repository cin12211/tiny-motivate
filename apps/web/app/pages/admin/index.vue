<script setup lang="ts">
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import { toast } from 'vue-sonner'
import type { AdminUserItem } from '~/composables/useAdmin'

/**
 * Admin page (v70, Settings › quản trị): every user with their role and lock
 * state, search, make admin / user, lock / unlock. Drawn in the app's own
 * style: mono type, the accent colour only (no red), dashed separators.
 * Phones get the lock box as a bottom sheet, the web a centred box.
 */
definePageMeta({ middleware: ['admin'] })

const { t } = useI18n()
useHead({ title: () => `${t('admin.title')} · Tiny Motivate` })

const isWeb = useMediaQuery('(min-width: 768px)')
const { user: me } = useAuth()
const { listUsers, setRole, banUser, unbanUser } = useAdmin()

const PER = 15
const loading = ref(true)
const users = ref<AdminUserItem[]>([])
const total = ref(0)
const search = ref('')
const page = ref(1)
const pages = computed(() => Math.max(1, Math.ceil(total.value / PER)))
const pending = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await listUsers({ limit: PER, offset: (page.value - 1) * PER, searchValue: search.value.trim() || undefined })
    users.value = res.users
    total.value = res.total
  }
  catch {
    toast(t('admin.errLoad'))
  }
  finally {
    loading.value = false
  }
}
onMounted(load)
watch(page, load)
// typing again goes back to page 1
const onSearch = useDebounceFn(() => {
  if (page.value === 1) load()
  else page.value = 1
}, 350)
watch(search, onSearch)

const nameOf = (u: AdminUserItem) => u.name || t('admin.noName')
const initial = (u: AdminUserItem) => (u.name || u.email || '?').charAt(0).toUpperCase()
/** dd/mm/yyyy */
function day(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

/* ---------- role ---------- */
const selfOpen = ref(false)

function onRole(u: AdminUserItem) {
  if (u.id === me.value?.id && u.role === 'admin') selfOpen.value = true
  else changeRole(u)
}

async function changeRole(u: AdminUserItem) {
  const next = u.role === 'admin' ? 'user' : 'admin'
  pending.value = true
  try {
    await setRole(u.id, next)
    u.role = next
    toast(t(next === 'admin' ? 'admin.toastAdmin' : 'admin.toastUser', { name: nameOf(u) }))
    if (u.id === me.value?.id && next !== 'admin') {
      me.value!.role = next
      await navigateTo('/settings')
    }
  }
  catch {
    toast(t('admin.errSave'))
  }
  finally {
    pending.value = false
  }
}

async function demoteSelf() {
  selfOpen.value = false
  const self = users.value.find(u => u.id === me.value?.id)
  if (self) await changeRole(self)
}

/* ---------- lock ---------- */
type Duration = 'forever' | '7' | '30'
const lockOpen = ref(false)
const target = ref<AdminUserItem | null>(null)
const duration = ref<Duration>('7')
const reason = ref('')

function openLock(u: AdminUserItem) {
  target.value = u
  duration.value = '7'
  reason.value = ''
  lockOpen.value = true
}

async function lock() {
  const u = target.value
  if (!u) return
  const seconds = duration.value === 'forever' ? undefined : Number(duration.value) * 24 * 60 * 60
  pending.value = true
  try {
    await banUser(u.id, reason.value.trim() || undefined, seconds)
    u.banned = true
    u.banReason = reason.value.trim() || null
    u.banExpires = seconds ? new Date(Date.now() + seconds * 1000).toISOString() : null
    toast(t(duration.value === 'forever' ? 'admin.toastLockedForever' : duration.value === '7' ? 'admin.toastLocked7' : 'admin.toastLocked30', { name: nameOf(u) }))
    lockOpen.value = false
  }
  catch {
    toast(t('admin.errSave'))
  }
  finally {
    pending.value = false
  }
}

async function unlock(u: AdminUserItem) {
  pending.value = true
  try {
    await unbanUser(u.id)
    u.banned = false
    u.banReason = null
    u.banExpires = null
    toast(t('admin.toastUnlocked', { name: nameOf(u) }))
  }
  catch {
    toast(t('admin.errSave'))
  }
  finally {
    pending.value = false
  }
}

const durations: { key: Duration, label: string }[] = [
  { key: 'forever', label: 'admin.forever' },
  { key: '7', label: 'admin.days7' },
  { key: '30', label: 'admin.days30' },
]

// bottom sheet on phones, a centred 400px box on the web
const box = 'flex flex-col gap-2 border-line bg-paper px-[18px] pt-5 pb-6 text-ink md:w-[400px] md:max-w-[400px] md:rounded-[18px] max-md:top-auto max-md:bottom-0 max-md:max-w-full max-md:translate-y-0 max-md:rounded-none max-md:rounded-t-[24px] max-md:border-x-0 max-md:border-b-0 max-md:pb-[max(24px,env(safe-area-inset-bottom))] max-md:data-[state=open]:slide-in-from-bottom max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:zoom-in-100 max-md:data-[state=closed]:zoom-out-100'
const pill = 'inline-flex h-7 items-center gap-[5px] rounded-full border border-indigo px-[11px] text-[11.5px] font-medium text-indigo transition-colors hover:bg-surface disabled:opacity-50 [&_.iconify]:size-3.5'
</script>

<template>
  <div class="mx-auto flex w-full flex-col gap-3 pt-1.5 pb-6 md:mt-1.5 md:max-w-[760px]">
    <!-- head -->
    <div class="flex items-center gap-1.5 pt-1.5">
      <NuxtLink v-if="!isWeb" to="/settings" class="-ml-2 grid size-9 shrink-0 place-items-center rounded-lg text-indigo hover:bg-surface" :aria-label="$t('admin.back')">
        <HandIcon name="arrow-left-01" />
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <h1 class="text-[18px] font-semibold text-indigo">{{ $t('admin.title') }}</h1>
        <p class="mt-0.5 text-[11.5px] text-muted-foreground">{{ $t(isWeb ? 'admin.usersWeb' : 'admin.users', { n: total }) }}</p>
      </div>
      <button type="button" class="grid size-[38px] shrink-0 place-items-center rounded-full border border-line bg-surface text-indigo" :aria-label="$t('admin.refresh')" :disabled="loading" @click="load">
        <HandIcon name="refresh" class="size-[18px]" :class="loading && 'animate-spin'" />
      </button>
    </div>

    <label class="flex h-[42px] items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-muted-foreground focus-within:border-indigo">
      <HandIcon name="search-01" class="size-4" />
      <input v-model="search" type="search" :placeholder="$t('admin.search')" :aria-label="$t('admin.searchAria')" class="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-0 placeholder:text-muted-foreground">
    </label>

    <!-- loading: 5 skeleton rows -->
    <ul v-if="loading && !users.length" class="flex flex-col" aria-busy="true">
      <li v-for="i in 5" :key="i" class="grid grid-cols-[38px_1fr] gap-x-3 border-t border-dashed border-faint py-3.5 first:border-t-0">
        <span class="size-[38px] animate-pulse rounded-full bg-surface" />
        <div>
          <i class="my-[5px] block h-2.5 w-[46%] animate-pulse rounded-[5px] bg-surface" />
          <i class="my-2 block h-2.5 w-[70%] animate-pulse rounded-[5px] bg-surface" />
          <i class="block h-2.5 w-[34%] animate-pulse rounded-[5px] bg-surface" />
        </div>
      </li>
    </ul>

    <!-- nobody -->
    <div v-else-if="!users.length" class="flex flex-col items-center gap-1.5 py-10 text-center text-indigo">
      <Germi pose="sleepy" :size="96" />
      <p class="mt-1.5 text-sm font-medium">{{ $t('admin.emptyTitle') }}</p>
      <small class="text-[11.5px] text-muted-foreground">{{ $t('admin.emptyHint') }}</small>
    </div>

    <template v-else>
      <ul class="flex flex-col">
        <li
          v-for="u in users"
          :key="u.id"
          class="grid gap-x-3 gap-y-1 border-t border-dashed border-faint py-3.5 first:border-t-0"
          :class="isWeb ? 'grid-cols-[38px_minmax(0,1fr)_130px_212px] items-center' : 'grid-cols-[38px_1fr]'"
        >
          <span
            class="grid size-[38px] place-items-center rounded-full border text-[15px] font-semibold text-indigo"
            :class="[u.banned ? 'border-dashed border-line bg-transparent' : 'border-line bg-surface', !isWeb && 'row-span-2']"
          >
            <HandIcon v-if="u.banned" name="square-lock-02" class="size-4" />
            <template v-else>{{ initial(u) }}</template>
          </span>

          <div class="min-w-0">
            <p class="flex flex-wrap items-center gap-1.5 text-sm text-ink" :class="u.banned && 'opacity-55'">
              <b :class="u.name ? 'font-semibold' : 'font-normal text-muted-foreground'">{{ nameOf(u) }}</b>
              <span
                class="inline-flex h-[18px] items-center rounded-[5px] border border-indigo px-1.5 text-[10.5px] leading-none font-medium"
                :class="u.role === 'admin' ? 'bg-indigo text-on-indigo' : 'text-indigo'"
              >{{ u.role }}</span>
              <span v-if="u.id === me?.id" class="text-[10.5px] text-muted-foreground">{{ $t('admin.you') }}</span>
            </p>
            <p class="mt-0.5 truncate text-xs text-muted-foreground" :class="u.banned && 'opacity-55'">{{ u.email }}</p>
            <p v-if="u.banned" class="mt-[5px] flex items-center gap-[5px] text-[11.5px] text-ink">
              <HandIcon name="square-lock-02" class="size-3.5 text-indigo" />
              <span>{{ u.banExpires ? $t('admin.lockedUntil', { date: day(u.banExpires) }) : $t('admin.lockedForever') }}<template v-if="u.banReason"> · {{ u.banReason }}</template></span>
            </p>
            <p v-if="!isWeb" class="mt-[3px] text-[11px] text-muted-foreground" :class="u.banned && 'opacity-55'">{{ $t('admin.joined', { date: day(u.createdAt) }) }}</p>
          </div>
          <p v-if="isWeb" class="text-[11px] text-muted-foreground" :class="u.banned && 'opacity-55'">{{ $t('admin.joined', { date: day(u.createdAt) }) }}</p>

          <span class="flex flex-wrap gap-1.5" :class="isWeb ? 'justify-end' : 'col-start-2 mt-2'">
            <button type="button" :class="pill" :disabled="pending" @click="onRole(u)">
              <template v-if="u.role === 'admin'"><HandIcon name="user" />{{ $t('admin.makeUser') }}</template>
              <template v-else><HandIcon name="shield-user" />{{ $t('admin.makeAdmin') }}</template>
            </button>
            <template v-if="u.id !== me?.id">
              <button v-if="u.banned" type="button" :class="pill" :disabled="pending" @click="unlock(u)">
                <HandIcon name="square-unlock-02" />{{ $t('admin.unlock') }}
              </button>
              <button v-else type="button" :class="pill" :disabled="pending" @click="openLock(u)">
                <HandIcon name="square-lock-02" />{{ $t('admin.lock') }}
              </button>
            </template>
          </span>
        </li>
      </ul>

      <nav v-if="pages > 1" class="flex items-center justify-center gap-3.5 pt-1 pb-1.5 text-xs text-indigo" :aria-label="$t('admin.pages')">
        <button type="button" class="grid size-[34px] place-items-center rounded-full border border-line bg-surface disabled:opacity-35" :disabled="page <= 1 || loading" :aria-label="$t('admin.prev')" @click="page--">
          <HandIcon name="arrow-left-01" />
        </button>
        <span>{{ $t('admin.page', { page, pages }) }}</span>
        <button type="button" class="grid size-[34px] place-items-center rounded-full border border-line bg-surface disabled:opacity-35" :disabled="page >= pages || loading" :aria-label="$t('admin.next')" @click="page++">
          <HandIcon name="arrow-right-01" />
        </button>
      </nav>
    </template>

    <!-- lock account -->
    <Dialog v-model:open="lockOpen">
      <DialogContent :class="box" :show-close-button="false">
        <span class="grid size-11 place-items-center rounded-full border border-line bg-surface text-indigo">
          <HandIcon name="square-lock-02" class="size-[22px]" />
        </span>
        <DialogTitle class="text-[17px] font-semibold text-indigo">{{ $t('admin.lockTitle') }}</DialogTitle>
        <DialogDescription as-child>
          <i18n-t keypath="admin.lockBody" tag="p" scope="global" class="text-[12.5px] leading-[1.55] text-ink">
            <template #name><b class="font-semibold">{{ target ? nameOf(target) : '' }}</b></template>
            <template #email>{{ target?.email }}</template>
          </i18n-t>
        </DialogDescription>
        <p class="mt-1.5 text-[11.5px] text-muted-foreground">{{ $t('admin.duration') }}</p>
        <div class="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1" role="radiogroup" :aria-label="$t('admin.duration')">
          <button
            v-for="d in durations"
            :key="d.key"
            type="button"
            role="radio"
            :aria-checked="duration === d.key"
            class="h-[34px] rounded-[9px] text-[12.5px] text-indigo"
            :class="duration === d.key && 'bg-indigo font-medium text-on-indigo'"
            @click="duration = d.key"
          >
            {{ $t(d.label) }}
          </button>
        </div>
        <p class="mt-1.5 text-[11.5px] text-muted-foreground">{{ $t('admin.reason') }}</p>
        <textarea v-model="reason" rows="2" :placeholder="$t('admin.reasonPh')" class="resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-[12.5px] text-ink outline-0 placeholder:text-muted-foreground focus:border-indigo" />
        <div class="mt-2.5 flex gap-2">
          <button type="button" :class="[pill, 'h-[42px] shrink-0 justify-center px-[18px] text-[13px]']" @click="lockOpen = false">{{ $t('admin.cancel') }}</button>
          <button type="button" :class="[pill, 'h-[42px] flex-1 justify-center bg-indigo text-[13px] whitespace-nowrap text-on-indigo hover:bg-indigo [&_.iconify]:size-4']" :disabled="pending" @click="lock">
            <HandIcon name="square-lock-02" />{{ $t('admin.lockConfirm') }}
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- making yourself a user -->
    <Dialog v-model:open="selfOpen">
      <DialogContent :class="box" :show-close-button="false">
        <Germi pose="sleepy" :size="72" class="self-center" />
        <DialogTitle class="text-[17px] font-semibold text-indigo">{{ $t('admin.selfTitle') }}</DialogTitle>
        <DialogDescription class="text-[12.5px] leading-[1.55] text-ink">{{ $t('admin.selfBody') }}</DialogDescription>
        <div class="mt-2.5 flex gap-2">
          <button type="button" :class="[pill, 'h-[42px] shrink-0 justify-center px-[18px] text-[13px]']" @click="selfOpen = false">{{ $t('admin.cancel') }}</button>
          <button type="button" :class="[pill, 'h-[42px] flex-1 justify-center bg-indigo text-[13px] whitespace-nowrap text-on-indigo hover:bg-indigo']" :disabled="pending" @click="demoteSelf">
            {{ $t('admin.selfConfirm') }}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
