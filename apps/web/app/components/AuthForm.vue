<script setup lang="ts">
import { toast } from 'vue-sonner'

/** Login / signup card from the Mini design. Tabs switch routes. */
const props = defineProps<{ mode: 'login' | 'signup' }>()
const up = computed(() => props.mode === 'signup')
const { login, signup } = useAuth()

const name = ref('')
const email = ref(up.value ? '' : 'cinny@motivation.app')
const password = ref(up.value ? '' : 'mochi1234')
const remember = ref(true)
const showPw = ref(false)
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = up.value && !name.value.trim()
    ? 'cho Mochi biết tên bạn nhé'
    : !/^\S+@\S+\.\S+$/.test(email.value.trim())
        ? 'email chưa đúng định dạng'
        : password.value.length < 8
          ? 'mật khẩu cần ít nhất 8 ký tự'
          : ''
  if (error.value) return
  busy.value = true
  try {
    if (up.value) {
      await signup(name.value.trim(), email.value.trim(), password.value)
      toast('tạo tài khoản xong, gieo mầm đầu tiên nào')
      await navigateTo('/goals/new')
    }
    else {
      await login(email.value.trim(), password.value)
      toast(`chào mừng trở lại, ${useAuth().user.value?.name ?? ''}`)
      await navigateTo('/')
    }
  }
  catch (err) {
    error.value = errorMessage(err)
  }
  finally {
    busy.value = false
  }
}

const soon = (what: string) => toast(`${what} sẽ có sớm thôi, Mochi đang làm`)
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col gap-[18px]">
    <div class="flex flex-col items-center gap-1 text-center">
      <Mochi :pose="up ? 'gift' : 'wave'" :size="up ? 84 : 78" />
      <TypographyH1 class="mt-2 text-[19px] font-semibold">{{ up ? 'bắt đầu khu vườn' : 'chào mừng trở lại' }}</TypographyH1>
      <TypographyLead class="text-[12.5px] opacity-75">
        <template v-if="up">tạo tài khoản để gieo mầm đầu tiên.<br>xong một việc nhỏ, vườn thêm một cây.</template>
        <template v-else>khu vườn của bạn vẫn đang chờ.<br>đăng nhập để tưới tiếp nhé.</template>
      </TypographyLead>
    </div>

    <Tabs :model-value="mode" @update:model-value="v => navigateTo(`/${v}`)">
      <TabsList>
        <TabsTrigger value="login">đăng nhập</TabsTrigger>
        <TabsTrigger value="signup">đăng ký</TabsTrigger>
      </TabsList>
    </Tabs>

    <form class="flex flex-col gap-2.5" novalidate @submit.prevent="submit">
      <label v-if="up" class="auth-field">
        <Icon name="hugeicons:user" class="size-[18px]" />
        <input v-model="name" name="name" placeholder="tên của bạn" autocomplete="name">
      </label>
      <label class="auth-field">
        <Icon name="hugeicons:mail-01" class="size-[18px]" />
        <input v-model="email" name="email" type="email" placeholder="email" autocomplete="email" inputmode="email">
      </label>
      <label class="auth-field">
        <Icon name="hugeicons:lock-password" class="size-[18px]" />
        <input v-model="password" name="password" :type="showPw ? 'text' : 'password'" placeholder="mật khẩu" :autocomplete="up ? 'new-password' : 'current-password'">
        <Button type="button" variant="ghost" size="icon-sm" class="-mr-1.5" :aria-label="showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPw = !showPw">
          <Icon :name="showPw ? 'hugeicons:view-off' : 'hugeicons:view'" />
        </Button>
      </label>

      <TypographyMuted v-if="up" class="text-[11.5px]">tối thiểu 8 ký tự. Mochi sẽ giữ bí mật.</TypographyMuted>
      <div v-else class="flex items-center justify-between text-xs">
        <label class="inline-flex cursor-pointer items-center gap-2 text-ink">
          <Checkbox v-model="remember" />
          <TypographySmall as="span">nhớ tôi</TypographySmall>
        </label>
        <Button type="button" variant="link" size="xs" class="h-auto px-0 text-xs" @click="soon('Đặt lại mật khẩu')">quên mật khẩu?</Button>
      </div>

      <TypographySmall v-if="error" as="p" class="rounded-md border border-dashed border-indigo px-2.5 py-2 text-indigo" role="alert">{{ error }}</TypographySmall>

      <Button type="submit" class="group mt-1 font-semibold" :disabled="busy">
        <span>{{ busy ? (up ? 'đang gieo mầm…' : 'đang mở vườn…') : (up ? 'tạo tài khoản' : 'vào vườn') }}</span>
        <Icon name="hugeicons:arrow-right-01" class="transition-transform group-hover:translate-x-[3px]" />
      </Button>
    </form>

    <div class="flex items-center gap-3 text-[11px] text-muted-foreground before:flex-1 before:border-t before:border-dashed before:border-faint after:flex-1 after:border-t after:border-dashed after:border-faint">
      hoặc
    </div>
    <div class="grid grid-cols-2 gap-2.5">
      <Button type="button" variant="outline" size="sm" class="h-[42px]" @click="soon('Đăng nhập Google')">
        <Icon name="hugeicons:google" /> google
      </Button>
      <Button type="button" variant="outline" size="sm" class="h-[42px]" @click="soon('Đăng nhập Apple')">
        <Icon name="hugeicons:apple" /> apple
      </Button>
    </div>

    <TypographyMuted class="text-center">
      <template v-if="up">đã có tài khoản? <NuxtLink to="/login" class="text-indigo underline decoration-dotted underline-offset-[3px]">đăng nhập</NuxtLink></template>
      <template v-else>chưa có tài khoản? <NuxtLink to="/signup" class="text-indigo underline decoration-dotted underline-offset-[3px]">đăng ký</NuxtLink></template>
    </TypographyMuted>
  </div>
</template>

<style scoped>
.auth-field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 12px;
  background: var(--m-surface);
  border: 1px solid var(--m-line);
  border-radius: 8px;
  color: var(--m-muted);
  transition: border-color 0.15s;
}
.auth-field:focus-within {
  border-color: var(--m-indigo);
  color: var(--m-indigo);
}
.auth-field input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 13px;
  color: var(--m-ink);
}
.auth-field input::placeholder {
  color: var(--m-muted);
}
</style>
