<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ACCENTS, LANGS, LOGOS, THEMES } from '#shared/utils/settings'
import type { UserSettings } from '#shared/types'

const { t } = useI18n()
useHead({ title: () => `${t('settings.pageTitle')} · Motivation` })

const { settings, update } = useSettings()
const { logout } = useAuth()
type Panel = 'color' | 'logo' | 'lang'
const open = ref<Panel | null>(null)

const THEME_ICONS: Record<UserSettings['theme'], string> = { system: 'theme-auto', light: 'sun', dark: 'g-moon' }
const LANG_NAMES: Record<UserSettings['lang'], string> = { vi: 'Tiếng Việt', en: 'English' }

async function save(patch: Partial<UserSettings>, message?: () => string) {
  try {
    await update(patch)
    if (message) toast(message())
  }
  catch (err) {
    toast(errorMessage(err, t('settings.errSave')))
  }
}

function toggle(panel: Panel) {
  open.value = open.value === panel ? null : panel
}

function onTime(e: Event) {
  const time = (e.target as HTMLInputElement).value
  save({ time }, () => t('settings.remindAt', { time }))
}

const tile = 'relative grid h-[72px] w-[124px] shrink-0 place-items-center rounded-2xl border bg-surface text-indigo shadow-[0_10px_22px_-14px_var(--m-glow)] transition-[transform,box-shadow] duration-150'
const pressable = 'hover:-translate-y-px active:scale-[.97]'
const rowTitle = 'mb-1.5 text-base font-medium'
const rowDesc = 'max-w-[190px] leading-normal text-indigo opacity-85'
</script>

<template>
  <div>
    <!-- back bar (sticky under the web header on md+) -->
    <div class="sticky top-0 z-10 -mx-[22px] bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-4 pb-2.5 md:top-0 md:-mx-6 md:px-6 md:pt-3">
      <Button as-child variant="ghost" size="icon" class="text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" :aria-label="$t('common.back')">
        <NuxtLink to="/"><HandIcon name="arrow-left-01" class="size-6" /><span class="hidden md:inline">{{ $t('common.allGoals') }}</span></NuxtLink>
      </Button>
    </div>

    <div class="mx-auto max-w-[420px] px-1.5 pb-8">
      <div class="flex flex-col items-center gap-1.5 pt-3.5 pb-[18px] text-center">
        <LogoTile :size="64" />
        <TypographyH1 class="mt-2 text-[18px] font-semibold">{{ $t('settings.title') }}</TypographyH1>
        <TypographyMuted>{{ $t('settings.subtitle') }}</TypographyMuted>
      </div>

      <!-- notifications -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.notify') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ settings.notify ? $t('settings.notifyOn') : $t('settings.notifyOff') }}</TypographySmall>
        </div>
        <div :class="[tile, 'border-line p-1.5']">
          <input
            type="time"
            :value="settings.time"
            :disabled="!settings.notify"
            :aria-label="$t('settings.time')"
            class="size-full rounded-[10px] border-0 px-2 text-center text-[17px] font-medium outline-none [&::-webkit-calendar-picker-indicator]:hidden"
            :class="settings.notify ? 'bg-primary text-primary-foreground' : 'bg-line text-muted-foreground'"
            @change="onTime"
          >
          <button
            type="button"
            class="absolute -top-2 -right-1.5 h-5 rounded-full border border-line bg-background px-[7px] text-[10px] text-indigo"
            :aria-label="settings.notify ? $t('settings.turnOffAria') : $t('settings.turnOnAria')"
            @click="save({ notify: !settings.notify }, () => settings.notify ? $t('settings.remindOn', { time: settings.time }) : $t('settings.remindOff'))"
          >
            {{ settings.notify ? $t('settings.turnOff') : $t('settings.turnOn') }}
          </button>
        </div>
      </div>

      <!-- appearance -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.theme') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ $t('settings.themeDesc') }}<br>{{ $t('settings.themeCurrent', { name: $t(`settings.themes.${settings.theme}`) }) }}</TypographySmall>
        </div>
        <div :class="[tile, 'border-line grid-cols-3 gap-1 p-1.5']" role="radiogroup" :aria-label="$t('settings.theme')">
          <button
            v-for="theme in THEMES"
            :key="theme"
            type="button"
            role="radio"
            :aria-checked="settings.theme === theme"
            :aria-label="$t(`settings.themes.${theme}`)"
            :title="$t(`settings.themes.${theme}`)"
            class="grid size-full place-items-center rounded-[9px] transition-colors"
            :class="settings.theme === theme ? 'bg-primary text-primary-foreground' : 'text-indigo hover:bg-background'"
            @click="save({ theme })"
          >
            <HandIcon :name="THEME_ICONS[theme]" class="size-[26px]" />
          </button>
        </div>
      </div>

      <!-- language -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.language') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ $t('settings.languageDesc') }}</TypographySmall>
        </div>
        <div :class="[tile, 'border-line grid-cols-2 gap-1 p-1.5']" role="radiogroup" :aria-label="$t('settings.language')">
          <button
            v-for="lang in LANGS"
            :key="lang"
            type="button"
            role="radio"
            :aria-checked="settings.lang === lang"
            :title="LANG_NAMES[lang]"
            class="grid size-full place-items-center rounded-[10px] text-[15px] font-semibold uppercase transition-colors"
            :class="settings.lang === lang ? 'bg-primary text-primary-foreground' : 'text-indigo hover:bg-background'"
            @click="save({ lang })"
          >
            {{ lang }}
          </button>
        </div>
      </div>

      <!-- accent colour -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.color') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ $t('settings.colorDesc') }}<br>{{ $t('settings.colorCurrent', { name: $t(`accents.${ACCENTS[settings.accent]?.key}`) }) }}</TypographySmall>
        </div>
        <button type="button" :class="[tile, pressable, open === 'color' ? 'border-indigo' : 'border-line']" :aria-expanded="open === 'color'" :aria-label="$t('settings.colorPick')" @click="toggle('color')">
          <span class="size-[30px] rounded-full bg-primary shadow-[0_0_0_4px_var(--m-paper),0_0_0_5px_var(--m-indigo)]" />
        </button>
      </div>
      <div v-if="open === 'color'" class="-mt-1 mb-2 grid grid-cols-4 gap-x-2 gap-y-3 rounded-xl border border-dashed border-faint p-3.5">
        <button
          v-for="(accent, i) in ACCENTS"
          :key="accent.key"
          type="button"
          class="flex flex-col items-center gap-1.5"
          :aria-label="$t(`accents.${accent.key}`)"
          :aria-pressed="settings.accent === i"
          @click="save({ accent: i })"
        >
          <i
            class="block size-[30px] rounded-full"
            :style="{ background: accent.light, boxShadow: settings.accent === i ? `0 0 0 3px var(--m-paper), 0 0 0 4.5px ${accent.light}` : undefined }"
          />
          <TypographySmall as="span" class="text-center text-[10.5px] leading-tight" :class="settings.accent === i && 'font-semibold text-indigo'">{{ $t(`accents.${accent.key}`) }}</TypographySmall>
        </button>
      </div>

      <!-- logo -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.logo') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ $t('settings.logoDesc') }}</TypographySmall>
        </div>
        <button type="button" :class="[tile, pressable, open === 'logo' ? 'border-indigo' : 'border-line']" :aria-expanded="open === 'logo'" :aria-label="$t('settings.logoPick')" @click="toggle('logo')">
          <LogoTile :size="40" />
        </button>
      </div>
      <div v-if="open === 'logo'" class="-mt-1 mb-2 flex flex-col gap-3 rounded-xl border border-dashed border-faint p-3.5">
        <div class="grid max-h-[300px] grid-cols-7 gap-1 overflow-y-auto">
          <button
            v-for="id in LOGOS"
            :key="id"
            type="button"
            class="grid aspect-square place-items-center rounded-[9px] border transition-colors"
            :class="settings.logo === id ? 'border-indigo bg-primary text-primary-foreground' : 'border-transparent text-indigo hover:bg-surface'"
            :aria-label="`logo ${id}`"
            :aria-pressed="settings.logo === id"
            @click="save({ logo: id })"
          >
            <GardenIcon :icon="id" class="size-[86%]" />
          </button>
        </div>
        <TypographyMuted class="text-[11px]">{{ $t('settings.logoNoteNative') }}</TypographyMuted>
      </div>

      <!-- review -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.review') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ $t('settings.reviewDesc') }}</TypographySmall>
        </div>
        <button type="button" :class="[tile, pressable, 'border-line']" :aria-label="$t('settings.review')" @click="toast($t('settings.reviewThanks'))">
          <HandIcon name="favourite" class="size-[30px]" />
        </button>
      </div>

      <!-- help -->
      <div class="flex items-center justify-between gap-4 py-4">
        <div>
          <TypographyH2 :class="rowTitle">{{ $t('settings.help') }}</TypographyH2>
          <TypographySmall as="p" :class="rowDesc">{{ $t('settings.helpDesc') }}</TypographySmall>
        </div>
        <a href="mailto:hello@motivation.app?subject=Motivation" :class="[tile, pressable, 'border-line']" :aria-label="$t('settings.helpAria')">
          <GardenIcon icon="p4" class="size-[34px]" />
        </a>
      </div>

      <Button variant="ghost" size="sm" class="mx-auto mt-[22px] flex text-[11.5px]" @click="logout">
        <HandIcon name="logout-03" class="size-[18px]" /> {{ $t('common.logout') }}
      </Button>
    </div>
  </div>
</template>
