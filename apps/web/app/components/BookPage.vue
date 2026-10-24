<script setup lang="ts">
import type { BookGrowth, BookItem } from '~/utils/plant-book'
import { BOOK_TOTAL, bookChapters, bookHint } from '~/utils/plant-book'

/**
 * One page of the plant book (Bách khoa, v66): the cover, Germi's page, the
 * table of contents, a chapter page (a slice of its species grid) or a
 * species page. Fixed paper size, nothing scrolls (the book decides how many
 * cells fit per page).
 */
export type BookPageDef =
  | { t: 'cover' }
  | { t: 'germi' }
  | { t: 'toc' }
  | { t: 'ch', c: number, part: number, parts: number, from: number, to: number }
  | { t: 'it', item: BookItem }

const props = defineProps<{
  page: BookPageDef
  growth: Map<string, BookGrowth>
  /** index (in the page flow) of each chapter's first page, for the contents */
  chapterStart: number[]
  /** species being looked at (outlined in its chapter grid) */
  selected?: string | null
  /** owner's name for the cover */
  owner: string
  cell: number
}>()
const emit = defineEmits<{ go: [page: number], open: [id: string], back: [] }>()
const { t, locale } = useI18n()
const chapters = computed(() => bookChapters(locale.value))

const sown = computed(() => chapters.value.reduce((n, ch) => n + ch.items.filter(it => props.growth.has(it.id)).length, 0))
const sownIn = (c: number) => chapters.value[c]!.items.filter(it => props.growth.has(it.id)).length
/** the species page's item in the current language */
const shown = computed(() => (props.page.t === 'it' ? chapters.value.flatMap(ch => ch.items).find(x => x.id === (props.page as { item: BookItem }).item.id)! : null) as BookItem)
const dot = (iso: string) => iso.split('-').reverse().join('.')
const no = (n: number) => t('book.no', { n: String(n).padStart(3, '0') })
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
</script>

<template>
  <!-- cover -->
  <div v-if="page.t === 'cover'" class="book-pg items-center justify-center gap-1.5 text-center">
    <GardenIcon icon="gm-idle" class="mb-1.5 size-[110px] text-indigo" />
    <p class="book-kicker justify-center">{{ $t('book.coverKicker') }}</p>
    <h2 class="font-hand text-[52px] leading-none font-bold text-indigo">Germi</h2>
    <i18n-t keypath="book.owner" tag="p" scope="global" class="text-xs text-muted-foreground"><template #name><span class="font-hand text-[1.5em] leading-none font-bold text-indigo">{{ owner }}</span></template></i18n-t>
    <div class="mt-3.5 h-1.5 w-[70%] overflow-hidden rounded-full bg-line">
      <i class="block h-full rounded-full bg-indigo" :style="{ width: `${(sown / BOOK_TOTAL * 100).toFixed(1)}%` }" />
    </div>
    <i18n-t keypath="book.sown" tag="p" scope="global" class="book-sub"><template #n><b>{{ sown }}</b></template><template #total>{{ BOOK_TOTAL }}</template></i18n-t>
  </div>

  <!-- Germi -->
  <div v-else-if="page.t === 'germi'" class="book-pg">
    <div class="flex items-center gap-2.5">
      <Germi pose="wave" :size="84" />
      <h3 class="text-[15px] leading-snug font-semibold text-indigo">{{ $t('book.germiHello') }}</h3>
    </div>
    <i18n-t keypath="book.germiIntro" tag="p" scope="global"><template #germ><i>germ</i></template></i18n-t>
    <p class="font-semibold text-indigo">{{ $t('book.germiHelp') }}</p>
    <ul class="book-list">
      <li v-for="i in 4" :key="i">{{ $t(`book.germiList${i}`) }}</li>
    </ul>
    <i18n-t keypath="book.germiOutro" tag="p" scope="global"><template #q><b class="book-q">?</b></template></i18n-t>
  </div>

  <!-- contents -->
  <div v-else-if="page.t === 'toc'" class="book-pg">
    <h3 class="book-h">{{ $t('book.toc') }}</h3>
    <div class="flex flex-col">
      <button v-for="(ch, c) in chapters" :key="c" type="button" class="book-toc" @click="emit('go', chapterStart[c]!)">
        <span class="w-3.5 font-hand text-[20px] leading-none font-bold text-indigo">{{ c + 1 }}</span>
        <span class="flex flex-col gap-px">
          <b class="text-[13px] font-medium">{{ cap(ch.name) }}</b>
          <small class="flex items-center gap-1.5 text-[11px] text-muted-foreground">{{ $t('book.sownShort', { n: sownIn(c), total: ch.items.length }) }}<em v-if="c === 6" class="book-tag">pro</em></small>
        </span>
        <span class="mb-1.5 flex-1 self-end border-b border-dotted border-faint" />
        <span class="text-[11.5px] text-muted-foreground">{{ chapterStart[c]! + 1 }}</span>
      </button>
    </div>
  </div>

  <!-- chapter -->
  <div v-else-if="page.t === 'ch'" class="book-pg">
    <template v-if="page.part">
      <p class="book-kicker"><span>{{ $t('book.chapterCont', { n: page.c + 1 }) }}</span><span>{{ page.part + 1 }} / {{ page.parts }}</span></p>
    </template>
    <template v-else>
      <p class="book-kicker"><span>{{ $t('book.chapter', { n: page.c + 1 }) }}</span><span v-if="page.parts > 1">1 / {{ page.parts }}</span></p>
      <h3 class="book-h">{{ cap(chapters[page.c]!.name) }}</h3>
      <p class="book-sub">{{ cap(chapters[page.c]!.sub) }} · <b>{{ sownIn(page.c) }}</b> / {{ chapters[page.c]!.items.length }}</p>
    </template>
    <div class="book-grid" :style="{ '--book-cell': `${cell}px` }">
      <button
        v-for="it in chapters[page.c]!.items.slice(page.from, page.to)"
        :key="it.id"
        type="button"
        class="book-cell"
        :class="[growth.has(it.id) && 'on', selected === it.id && 'sel']"
        :aria-label="growth.has(it.id) ? it.name : $t('book.unsown')"
        @click="emit('open', it.id)"
      >
        <GardenIcon v-if="growth.has(it.id)" :icon="it.id" class="size-[78%]" />
        <b v-else>?</b>
        <em v-if="!growth.has(it.id) && (it.kind === 'pro' || it.kind === 'tip')" class="book-tag absolute -top-[5px] -right-1">{{ it.kind }}</em>
      </button>
    </div>
  </div>

  <!-- one species -->
  <div v-else class="book-pg" :class="!growth.has(page.item.id) && 'book-lock'">
    <p class="book-kicker">
      <button type="button" class="text-[11px] text-indigo underline decoration-dotted underline-offset-[3px]" @click="emit('back')">{{ cap(chapters[page.item.c]!.name) }}</button>
      <span>{{ no(page.item.no) }}</span>
    </p>
    <div class="book-art">
      <GardenIcon v-if="growth.has(page.item.id)" :icon="page.item.id" class="size-full" />
      <b v-else>?</b>
    </div>
    <h3 class="book-name">{{ growth.has(page.item.id) ? cap(shown.name) : '???' }}</h3>
    <p v-if="growth.has(page.item.id)" class="book-desc">{{ cap(shown.desc) }}</p>
    <p v-else-if="page.item.kind === 'pro' || page.item.kind === 'tip'" class="book-desc"><em class="book-tag">{{ page.item.kind }}</em></p>
    <div class="mt-1 flex items-start gap-2 rounded-xl bg-background px-3 py-2.5">
      <GardenIcon icon="gm-idle" class="size-[26px] flex-none text-indigo" />
      <p>{{ growth.has(page.item.id) ? shown.line : bookHint(page.item.kind, locale) }}</p>
    </div>
    <div v-if="growth.get(page.item.id)" class="mt-auto flex gap-2.5">
      <span class="book-stat"><small>{{ $t('book.firstGrown') }}</small><b>{{ dot(growth.get(page.item.id)!.first) }}</b></span>
      <span class="book-stat"><small>{{ $t('book.grown') }}</small><b>{{ $t('book.times', growth.get(page.item.id)!.n, { n: growth.get(page.item.id)!.n }) }}</b></span>
    </div>
  </div>
</template>

<style scoped>
.book-pg { display: flex; flex-direction: column; gap: 10px; height: 100%; }
.book-pg p { margin: 0; font-size: 12.5px; line-height: 1.6; }
.book-pg .book-kicker { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--m-muted); letter-spacing: .02em; }
.book-h { margin: 0; font-size: 18px; font-weight: 600; color: var(--m-indigo); }
.book-pg .book-sub { font-size: 11.5px; color: var(--m-muted); }
.book-sub b { color: var(--m-indigo); }
.book-list { margin: 0; padding-left: 16px; font-size: 12.5px; line-height: 1.6; display: flex; flex-direction: column; gap: 3px; list-style: disc; }
.book-list li::marker { color: var(--m-indigo); }
.book-q { display: inline-grid; place-items: center; width: 16px; height: 16px; border: 1px dashed var(--m-muted); border-radius: 4px; font-size: 10px; color: var(--m-muted); }
.book-toc { display: flex; align-items: center; gap: 8px; padding: 9px 0; text-align: left; border-bottom: 1px dashed var(--m-line); color: var(--m-ink); }
.book-tag { font-style: normal; font-size: 8.5px; line-height: 1; padding: 2px 4px; border-radius: 5px; background: var(--m-indigo); color: var(--m-on-indigo); }
.book-grid { display: grid; grid-template-columns: repeat(auto-fill, var(--book-cell, 48px)); grid-auto-rows: var(--book-cell, 48px); gap: 6px; justify-content: center; }
.book-cell { position: relative; width: var(--book-cell, 48px); height: var(--book-cell, 48px); border-radius: 10px; display: grid; place-items: center; border: 1px dashed var(--m-faint); color: var(--m-muted); }
.book-cell b { font-size: calc(var(--book-cell, 48px) * .3); font-weight: 500; }
.book-cell.on { border: 1px solid var(--m-line); background: var(--m-paper); color: var(--m-indigo); }
.book-cell.sel { outline: 2px solid var(--m-indigo); outline-offset: 1px; }
.book-art { align-self: center; width: var(--book-art, 150px); height: var(--book-art, 150px); display: grid; place-items: center; margin: 8px 0 2px; color: var(--m-indigo); }
.book-lock .book-art { border: 1.5px dashed var(--m-faint); border-radius: 22px; color: var(--m-muted); width: 130px; height: 130px; margin: 18px auto 12px; }
.book-lock .book-art b { font-size: 40px; font-weight: 400; }
.book-name { margin: 0; text-align: center; font-size: 20px; font-weight: 600; color: var(--m-indigo); }
.book-lock .book-name { color: var(--m-muted); letter-spacing: .1em; }
.book-pg .book-desc { text-align: center; color: var(--m-muted); font-size: 12px; }
.book-stat { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border: 1px solid var(--m-line); border-radius: 10px; }
.book-stat small { font-size: 10.5px; color: var(--m-muted); }
.book-stat b { font-size: 13px; font-weight: 600; color: var(--m-indigo); }
</style>
