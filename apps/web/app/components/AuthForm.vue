<script setup lang="ts">
import { toast } from 'vue-sonner'

/** Login / signup card from the Mini design. The link under the form switches between them. */
const props = defineProps<{ mode: 'login' | 'signup' }>()
const up = computed(() => props.mode === 'signup')
const { login, signup } = useAuth()
const { t } = useI18n()

const name = ref('')
const email = ref(up.value ? '' : 'cinny@motivation.app')
const password = ref(up.value ? '' : 'mochi1234')
const remember = ref(true)
const showPw = ref(false)
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = up.value && !name.value.trim()
    ? t('auth.errName')
    : !/^\S+@\S+\.\S+$/.test(email.value.trim())
        ? t('auth.errEmail')
        : password.value.length < 8
          ? t('auth.errPw')
          : ''
  if (error.value) return
  busy.value = true
  try {
    if (up.value) {
      await signup(name.value.trim(), email.value.trim(), password.value)
      toast(t('auth.signedUp'))
      await navigateTo('/goals/new')
    }
    else {
      await login(email.value.trim(), password.value)
      toast(t('auth.welcomeBack', { name: useAuth().user.value?.name ?? '' }))
      await navigateTo('/')
    }
  }
  catch (err) {
    error.value = authErrorMessage(err)
  }
  finally {
    busy.value = false
  }
}

const soon = (what: string) => toast(t('common.soon', { what }))
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col gap-[18px]">
    <div class="mb-1.5 flex flex-col items-center gap-1 text-center">
      <Mochi :pose="up ? 'gift' : 'wave'" :size="up ? 84 : 78" />
      <TypographyH1 class="mt-2 text-[19px] font-semibold">{{ up ? $t('auth.titleSignup') : $t('auth.titleLogin') }}</TypographyH1>
      <TypographyLead class="text-[12.5px] opacity-75">
        <template v-if="up">{{ $t('auth.leadSignup1') }}<br>{{ $t('auth.leadSignup2') }}</template>
        <template v-else>{{ $t('auth.leadLogin1') }}<br>{{ $t('auth.leadLogin2') }}</template>
      </TypographyLead>
    </div>

    <form class="flex flex-col gap-2.5" novalidate @submit.prevent="submit">
      <label v-if="up" class="auth-field">
        <HandIcon name="user" class="size-[18px]" />
        <input v-model="name" name="name" :placeholder="$t('auth.name')" autocomplete="name">
      </label>
      <label class="auth-field">
        <HandIcon name="mail-01" class="size-[18px]" />
        <input v-model="email" name="email" type="email" :placeholder="$t('auth.email')" autocomplete="email" inputmode="email">
      </label>
      <label class="auth-field">
        <HandIcon name="lock-password" class="size-[18px]" />
        <input v-model="password" name="password" :type="showPw ? 'text' : 'password'" :placeholder="$t('auth.password')" :autocomplete="up ? 'new-password' : 'current-password'">
        <Button type="button" variant="ghost" size="icon-sm" class="-mr-1.5" :aria-label="showPw ? $t('auth.hidePw') : $t('auth.showPw')" @click="showPw = !showPw">
          <HandIcon :name="showPw ? 'view-off' : 'view'" />
        </Button>
      </label>

      <TypographyMuted v-if="up" class="text-[11.5px]">{{ $t('auth.pwNote') }}</TypographyMuted>
      <div v-else class="flex items-center justify-between text-xs">
        <label class="inline-flex cursor-pointer items-center gap-2 text-ink">
          <Checkbox v-model="remember" />
          <TypographySmall as="span">{{ $t('auth.remember') }}</TypographySmall>
        </label>
        <Button type="button" variant="link" size="xs" class="h-auto px-0 text-xs" @click="soon($t('auth.resetPw'))">{{ $t('auth.forgot') }}</Button>
      </div>

      <TypographySmall v-if="error" as="p" class="rounded-md border border-dashed border-indigo px-2.5 py-2 text-indigo" role="alert">{{ error }}</TypographySmall>

      <Button type="submit" class="group mt-1 font-semibold" :disabled="busy">
        <span>{{ busy ? (up ? $t('auth.busySignup') : $t('auth.busyLogin')) : (up ? $t('auth.submitSignup') : $t('auth.submitLogin')) }}</span>
        <HandIcon name="arrow-right-01" class="transition-transform group-hover:translate-x-[3px]" />
      </Button>
    </form>

    <div class="flex items-center gap-3 text-[11px] text-muted-foreground before:flex-1 before:border-t before:border-dashed before:border-faint after:flex-1 after:border-t after:border-dashed after:border-faint">
      {{ $t('auth.or') }}
    </div>
    <div class="grid grid-cols-2 gap-2.5">
      <Button type="button" variant="outline" size="sm" class="h-[42px]" @click="soon($t('auth.googleSoon'))">
        <HandIcon name="google" /> google
      </Button>
      <Button type="button" variant="outline" size="sm" class="h-[42px]" @click="soon($t('auth.appleSoon'))">
        <HandIcon name="apple" /> apple
      </Button>
    </div>

    <TypographyMuted class="text-center">
      <template v-if="up">{{ $t('auth.hasAccount') }} <NuxtLink to="/login" class="text-indigo underline decoration-dotted underline-offset-[3px]">{{ $t('auth.login') }}</NuxtLink></template>
      <template v-else>{{ $t('auth.noAccount') }} <NuxtLink to="/signup" class="text-indigo underline decoration-dotted underline-offset-[3px]">{{ $t('auth.signup') }}</NuxtLink></template>
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
