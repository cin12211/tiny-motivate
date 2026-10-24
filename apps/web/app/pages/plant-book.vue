<script setup lang="ts">
import { useEventListener, useMediaQuery, useResizeObserver } from '@vueuse/core'
import type { BookPageDef } from '~/components/BookPage.vue'
import { bookChapters, bookGrowth, bookItem as bookItemIn } from '~/utils/plant-book'

/**
 * Bách khoa (v66–v66f): Germi's plant book.
 * Flow: cover › Germi › contents › every chapter page in a row. A species
 * page opens from a chapter cell and is not part of the flow.
 * Phones turn one page at a time (arrows at the bottom or a swipe); the web
 * shows two facing pages and turns two at a time. Pages have a fixed paper
 * size and never scroll: each chapter's cells are dealt into pages by
 * measuring the real page box (v66f), so it adapts to any screen.
 */
const { t, locale } = useI18n()
useHead({ title: () => `${t('book.title')} · Tiny Motivate` })
const chapters = computed(() => bookChapters(locale.value))
const bookItem = (id: string) => bookItemIn(id, locale.value)
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const isWeb = useMediaQuery('(min-width: 768px)')
const { user } = useAuth()
const owner = computed(() => user.value?.name || 'bạn')
const { garden } = useGarden()
const { goals } = useGoals()
const growth = computed(() => bookGrowth(garden.value, goals.value))

/* ---------- page box + pagination ---------- */
const CELL = computed(() => (isWeb.value ? 48 : 50))
const GAP = 6
const box = ref<HTMLElement>() // the real page whose content box we measure
const measurer = ref<HTMLElement>()
const size = ref({ W: 0, H: 0 })
const pad = ref({ l: 0, t: 0 })
const heads = ref<{ first: number[], next: number }>({ first: [], next: 0 })

function measure() {
  const el = box.value
  if (!el) return
  const cs = getComputedStyle(el)
  const W = el.clientWidth - Number.parseFloat(cs.paddingLeft) - Number.parseFloat(cs.paddingRight)
  const H = el.clientHeight - Number.parseFloat(cs.paddingTop) - Number.parseFloat(cs.paddingBottom)
  size.value = { W, H }
  pad.value = { l: Number.parseFloat(cs.paddingLeft), t: Number.parseFloat(cs.paddingTop) }
  // header heights: where the grid starts on a chapter's first page / on a "tiếp" page
  const m = measurer.value
  if (m) {
    const grids = [...m.querySelectorAll<HTMLElement>('[data-measure]')].map(w => w.querySelector<HTMLElement>('.book-grid')?.offsetTop ?? 0)
    heads.value = { first: grids.slice(0, chapters.value.length), next: grids[chapters.value.length] ?? 0 }
  }
}
useResizeObserver(box, measure)
useEventListener('resize', measure)
onMounted(() => nextTick(measure))
watch(isWeb, () => nextTick(measure))

const pages = computed<BookPageDef[]>(() => {
  const P: BookPageDef[] = [{ t: 'cover' }, { t: 'germi' }, { t: 'toc' }]
  const { W, H } = size.value
  const c = CELL.value
  const cols = Math.max(1, Math.floor((W + GAP) / (c + GAP)))
  const rows = (h: number) => Math.max(1, Math.floor((h + GAP) / (c + GAP)))
  chapters.value.forEach((ch, ci) => {
    const n = ch.items.length
    const cap1 = cols * rows(H - (heads.value.first[ci] ?? 0))
    const capN = cols * rows(H - heads.value.next)
    const parts = n <= cap1 ? 1 : 1 + Math.ceil((n - cap1) / capN)
    let from = 0
    for (let part = 0; part < parts; part++) {
      const to = Math.min(n, from + (part ? capN : cap1))
      P.push({ t: 'ch', c: ci, part, parts, from, to })
      from = to
    }
  })
  return P
})
const chapterStart = computed(() => chapters.value.map((_, c) => pages.value.findIndex(p => p.t === 'ch' && p.c === c && !p.part)))

/* ---------- where we are ---------- */
interface View { page: number, itemId: string | null }
const page = ref(0)
const itemId = ref<string | null>(null)
const item = computed(() => (itemId.value ? bookItem(itemId.value) ?? null : null))
const spreadLeft = computed(() => page.value - (page.value % 2))

/** the chapter page that holds a species */
const pageOf = (id: string) => {
  const it = bookItem(id)!
  const k = chapters.value[it.c]!.items.indexOf(it)
  return pages.value.findIndex(p => p.t === 'ch' && p.c === it.c && k >= p.from && k < p.to)
}

/* What a view shows: one page on phones, a left / right pair on the web. */
interface Face { def?: BookPageDef, no?: string }
function phoneFace(v: View): Face {
  const it = v.itemId ? bookItem(v.itemId) : null
  return { def: it ? { t: 'it', item: it } : pages.value[v.page] }
}
function spreadFaces(v: View): [Face, Face] {
  const it = v.itemId ? bookItem(v.itemId) : null
  if (it) {
    const cp = pageOf(it.id)
    return [{ def: pages.value[cp], no: String(cp + 1) }, { def: { t: 'it', item: it }, no: t('book.no', { n: String(it.no).padStart(3, '0') }) }]
  }
  const L = v.page - (v.page % 2)
  return [{ def: pages.value[L], no: String(L + 1) }, { def: pages.value[L + 1], no: pages.value[L + 1] ? String(L + 2) : '' }]
}

/* ---------- page turning ----------
 * A real leaf turns around the spine, front face then back face:
 *  - phones, forward: the old page lifts off to the left over the new one;
 *    backward: the new page swings back in from the left over the old one.
 *  - web, forward: the right page turns over to the left (front: old right,
 *    back: new left) while the new right page waits underneath;
 *    backward: the left page turns over to the right (front: old left,
 *    back: new right).
 */
const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
const turning = ref<{ dir: 'next' | 'prev', from: View, key: number } | null>(null)
let turnKey = 0
let turnTimer: ReturnType<typeof setTimeout> | undefined
function moveTo(next: View, dir: 'next' | 'prev') {
  const from: View = { page: page.value, itemId: itemId.value }
  page.value = next.page
  itemId.value = next.itemId
  if (reduced.value) return
  clearTimeout(turnTimer)
  turning.value = { dir, from, key: ++turnKey }
  // ends on animationend; the timer only covers a missed event (the leaf's last frame matches what is underneath anyway)
  turnTimer = setTimeout(endTurn, 2500)
}
function endTurn(e?: AnimationEvent) {
  if (e && e.target !== e.currentTarget) return
  clearTimeout(turnTimer)
  turning.value = null
}
const now = computed<View>(() => ({ page: page.value, itemId: itemId.value }))

function go(i: number) {
  const to = Math.max(0, Math.min(pages.value.length - 1, i))
  if (!itemId.value && (isWeb.value ? to - (to % 2) === spreadLeft.value : to === page.value)) return
  moveTo({ page: to, itemId: null }, to >= page.value ? 'next' : 'prev')
}
function turnBy(d: number) {
  if (itemId.value) return stepItem(d > 0 ? 1 : -1)
  go(isWeb.value ? spreadLeft.value + d * 2 : page.value + d)
}
function open(id: string, dir: 'next' | 'prev' = 'next') {
  moveTo({ page: pageOf(id), itemId: id }, dir)
}
function stepItem(d: number) {
  const it = item.value
  if (!it) return
  const list = chapters.value[it.c]!.items
  const k = list.indexOf(it) + d
  if (k >= 0 && k < list.length) open(list[k]!.id, d > 0 ? 'next' : 'prev')
}
function back() {
  moveTo({ page: page.value, itemId: null }, 'prev')
}
const itemPos = computed(() => {
  const it = item.value
  if (!it) return null
  const list = chapters.value[it.c]!.items
  return { k: list.indexOf(it), n: list.length, name: chapters.value[it.c]!.name }
})
const canPrev = computed(() => (itemPos.value ? itemPos.value.k > 0 : isWeb.value ? spreadLeft.value > 0 : page.value > 0))
const canNext = computed(() => (itemPos.value ? itemPos.value.k < itemPos.value.n - 1 : (isWeb.value ? spreadLeft.value + 2 : page.value + 1) < pages.value.length))

// keep the page in range when the pagination changes (rotation, window resize)
watch(() => pages.value.length, (n) => {
  if (itemId.value) page.value = pageOf(itemId.value)
  else if (page.value > n - 1) page.value = n - 1
})

/* phones: under the leaf is the new page going forward, the old page going back */
const phoneUnder = computed(() => phoneFace(turning.value?.dir === 'prev' ? turning.value.from : now.value))
const phoneLeaf = computed(() => (turning.value ? phoneFace(turning.value.dir === 'next' ? turning.value.from : now.value) : null))
/* web: what lies on each side under the turning leaf, and the leaf's two faces */
const spreadUnder = computed<[Face, Face]>(() => {
  const cur = spreadFaces(now.value)
  const t = turning.value
  if (!t) return cur
  const old = spreadFaces(t.from)
  return t.dir === 'next' ? [old[0], cur[1]] : [cur[0], old[1]]
})
const spreadLeaf = computed(() => {
  const t = turning.value
  if (!t) return null
  const cur = spreadFaces(now.value)
  const old = spreadFaces(t.from)
  return t.dir === 'next' ? { front: old[1], back: cur[0] } : { front: old[0], back: cur[1] }
})

/* ---------- swipe (phones) ---------- */
let x0: number | null = null
const onTouchStart = (e: TouchEvent) => { x0 = e.touches[0]!.clientX }
function onTouchEnd(e: TouchEvent) {
  if (x0 == null) return
  const dx = e.changedTouches[0]!.clientX - x0
  x0 = null
  if (Math.abs(dx) > 50) turnBy(dx < 0 ? 1 : -1)
}

const pageProps = (p: BookPageDef | undefined) => ({ growth: growth.value, chapterStart: chapterStart.value, selected: itemId.value, owner: owner.value, cell: CELL.value, page: p! })
</script>

<template>
  <!-- phones: one page, top bar + bottom arrows -->
  <div v-if="!isWeb" class="flex h-[calc(100dvh-max(env(safe-area-inset-top),0px)-max(8px,env(safe-area-inset-bottom,0px)))] flex-col gap-2.5">
    <div class="flex items-center justify-between pt-6">
      <button type="button" class="book-ib" :aria-label="item ? $t('book.backChapter') : $t('book.backHome')" @click="item ? back() : navigateTo('/')"><HandIcon name="arrow-left-01" /></button>
      <b class="text-[13px] font-semibold text-indigo">{{ item ? cap(itemPos!.name) : $t('book.title') }}</b>
      <button type="button" class="book-ib" :aria-label="$t('book.toc')" @click="go(2)"><HandIcon name="left-to-right-list-bullet" /></button>
    </div>
    <div class="book-stage relative flex-1" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <div ref="box" class="book-sheet absolute inset-0">
        <BookPage v-if="phoneUnder.def" v-bind="pageProps(phoneUnder.def)" @go="go" @open="open" @back="back" />
        <!-- hidden copies of the chapter headers: where the grid starts on each page kind -->
        <div ref="measurer" class="book-measure" aria-hidden="true" :style="{ left: `${pad.l}px`, top: `${pad.t}px`, width: `${size.W}px` }">
          <div v-for="(_, c) in chapters" :key="c" data-measure><BookPage v-bind="pageProps({ t: 'ch', c, part: 0, parts: 2, from: 0, to: 0 })" /></div>
          <div data-measure><BookPage v-bind="pageProps({ t: 'ch', c: 0, part: 1, parts: 2, from: 0, to: 0 })" /></div>
        </div>
      </div>
      <!-- the turning leaf -->
      <div v-if="turning && phoneLeaf?.def" :key="turning.key" class="book-sheet book-leaf absolute inset-0" :class="`turn-${turning.dir}`" aria-hidden="true" @animationend="endTurn">
        <BookPage v-bind="pageProps(phoneLeaf.def)" />
        <i class="book-shade" />
      </div>
    </div>
    <div class="flex items-center justify-center gap-[18px] pb-1.5 text-xs text-muted-foreground">
      <button type="button" class="book-arr" :disabled="!canPrev" :aria-label="item ? $t('book.prevItem') : $t('book.prevPage')" @click="turnBy(-1)"><HandIcon name="arrow-left-01" /></button>
      <span v-if="itemPos">{{ cap(itemPos.name) }} · {{ itemPos.k + 1 }} / {{ itemPos.n }}</span>
      <span v-else>{{ page + 1 }} / {{ pages.length }}</span>
      <button type="button" class="book-arr" :disabled="!canNext" :aria-label="item ? $t('book.nextItem') : $t('book.nextPage')" @click="turnBy(1)"><HandIcon name="arrow-right-01" /></button>
    </div>
  </div>

  <!-- web: two facing pages, turn two at a time -->
  <div v-else>
    <div class="app-header flex items-center justify-between pt-3">
      <Button as-child variant="ghost" size="icon" class="app-header-btn w-auto gap-1.5 pr-2.5 pl-1.5 text-[12.5px] text-indigo" :aria-label="$t('common.back')">
        <NuxtLink to="/"><HandIcon name="arrow-left-01" /><span>{{ $t('common.allGoals') }}</span></NuxtLink>
      </Button>
      <Badge variant="solid">{{ $t('book.title') }}</Badge>
      <span class="w-[120px]" />
    </div>
    <div class="flex items-center justify-center gap-[18px] px-0 pt-[26px] pb-2">
      <button type="button" class="book-arr size-11 flex-none" :disabled="!canPrev" :aria-label="$t('book.prev')" @click="turnBy(-1)"><HandIcon name="arrow-left-01" /></button>
      <div class="book-spread">
        <div ref="box" class="book-wpage l">
          <BookPage v-if="spreadUnder[0].def" v-bind="pageProps(spreadUnder[0].def)" @go="go" @open="open" @back="back" />
          <span class="book-pno left-[30px]">{{ spreadUnder[0].no }}</span>
          <div ref="measurer" class="book-measure" aria-hidden="true" :style="{ left: `${pad.l}px`, top: `${pad.t}px`, width: `${size.W}px` }">
            <div v-for="(_, c) in chapters" :key="c" data-measure><BookPage v-bind="pageProps({ t: 'ch', c, part: 0, parts: 2, from: 0, to: 0 })" /></div>
            <div data-measure><BookPage v-bind="pageProps({ t: 'ch', c: 0, part: 1, parts: 2, from: 0, to: 0 })" /></div>
          </div>
        </div>
        <div class="book-wpage r [--book-art:180px]">
          <BookPage v-if="spreadUnder[1].def" v-bind="pageProps(spreadUnder[1].def)" @go="go" @open="open" @back="back" />
          <span class="book-pno right-[30px]">{{ spreadUnder[1].no }}</span>
        </div>
        <!-- the turning leaf: front face is the page being turned, back face the page it reveals -->
        <div v-if="turning && spreadLeaf" :key="turning.key" class="book-wleaf" :class="`turn-${turning.dir}`" aria-hidden="true" @animationend="endTurn">
          <div class="book-wpage book-face front" :class="turning.dir === 'next' ? 'r [--book-art:180px]' : 'l'">
            <BookPage v-if="spreadLeaf.front.def" v-bind="pageProps(spreadLeaf.front.def)" />
            <span class="book-pno" :class="turning.dir === 'next' ? 'right-[30px]' : 'left-[30px]'">{{ spreadLeaf.front.no }}</span>
            <i class="book-shade" />
          </div>
          <div class="book-wpage book-face back" :class="turning.dir === 'next' ? 'l' : 'r [--book-art:180px]'">
            <BookPage v-if="spreadLeaf.back.def" v-bind="pageProps(spreadLeaf.back.def)" />
            <span class="book-pno" :class="turning.dir === 'next' ? 'left-[30px]' : 'right-[30px]'">{{ spreadLeaf.back.no }}</span>
            <i class="book-shade" />
          </div>
        </div>
      </div>
      <button type="button" class="book-arr size-11 flex-none" :disabled="!canNext" :aria-label="$t('book.next')" @click="turnBy(1)"><HandIcon name="arrow-right-01" /></button>
    </div>
    <p class="mt-1.5 mb-[22px] text-center text-xs text-muted-foreground">
      <template v-if="itemPos">{{ cap(itemPos.name) }} · {{ itemPos.k + 1 }} / {{ itemPos.n }} · <button type="button" class="text-indigo underline underline-offset-[3px]" @click="back">{{ $t('book.closeItem') }}</button></template>
      <template v-else>{{ $t('book.pages', { a: spreadLeft + 1, b: Math.min(spreadLeft + 2, pages.length), n: pages.length }) }} · <button type="button" class="text-indigo underline underline-offset-[3px]" @click="go(2)">{{ $t('book.toc') }}</button></template>
    </p>
  </div>
</template>

<style scoped>
.book-ib { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: var(--m-indigo); }
.book-arr { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; border: 1px solid var(--m-line); color: var(--m-indigo); background: var(--m-surface); }
.book-arr.size-11 { width: 44px; height: 44px; }
.book-arr:disabled { opacity: .35; }

/* ---- phone book ---- */
.book-stage { perspective: 2400px; }
.book-sheet {
  background: var(--m-surface);
  border: 1px solid var(--m-line);
  border-radius: 4px 14px 14px 4px;
  box-shadow: inset 4px 0 0 -1px var(--m-line), 3px 3px 0 -1px var(--m-paper), 3px 3px 0 0 var(--m-line);
  padding: 18px 18px 16px 22px;
  overflow: hidden;
}
.book-leaf {
  transform-origin: left center;
  backface-visibility: hidden;
  will-change: transform;
  pointer-events: none;
  z-index: 2;
}
.book-leaf.turn-next { animation: phone-out .58s cubic-bezier(.45, .05, .35, 1) both; }
.book-leaf.turn-prev { animation: phone-in .58s cubic-bezier(.45, .05, .35, 1) both; }
@keyframes phone-out {
  from { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(31, 30, 39, 0); }
  60% { box-shadow: 18px 0 30px -12px rgba(31, 30, 39, .35); }
  to { transform: rotateY(-100deg); box-shadow: 0 0 0 rgba(31, 30, 39, 0); }
}
@keyframes phone-in {
  from { transform: rotateY(-100deg); box-shadow: 0 0 0 rgba(31, 30, 39, 0); }
  40% { box-shadow: 18px 0 30px -12px rgba(31, 30, 39, .35); }
  to { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(31, 30, 39, 0); }
}
/* the leaf darkens as it turns away from the light */
.book-shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to right, rgba(31, 30, 39, .28), rgba(31, 30, 39, 0) 70%); opacity: 0; }
.turn-next .book-shade { animation: shade-out .58s ease-in both; }
.turn-prev .book-shade { animation: shade-in .58s ease-out both; }
@keyframes shade-out { to { opacity: 1; } }
@keyframes shade-in { from { opacity: 1; } to { opacity: 0; } }

/* ---- web spread ---- */
.book-spread {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(820px, 100%);
  height: 560px;
  background: var(--m-surface);
  border: 1px solid var(--m-line);
  border-radius: 14px;
  box-shadow: 4px 4px 0 -1px var(--m-paper), 4px 4px 0 0 var(--m-line);
  perspective: 2000px;
}
.book-wpage { position: relative; padding: 28px 30px 36px; overflow: hidden; background: var(--m-surface); }
.book-wpage.l { border-right: 1px solid var(--m-line); box-shadow: inset -10px 0 14px -14px rgba(31, 30, 39, .35); border-radius: 14px 0 0 14px; }
.book-wpage.r { border-radius: 0 14px 14px 0; }
.book-pno { position: absolute; bottom: 12px; font-size: 11px; color: var(--m-muted); }
/* the leaf covers one half and turns around the spine (the middle of the spread) */
.book-wleaf {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  transform-style: preserve-3d;
  will-change: transform;
  pointer-events: none;
  z-index: 2;
}
.book-wleaf.turn-next { left: 50%; transform-origin: left center; animation: web-next .7s cubic-bezier(.45, .05, .35, 1) both; }
.book-wleaf.turn-prev { left: 0; transform-origin: right center; animation: web-prev .7s cubic-bezier(.45, .05, .35, 1) both; }
.book-face { position: absolute; inset: 0; backface-visibility: hidden; }
.book-face.back { transform: rotateY(180deg); }
@keyframes web-next { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
@keyframes web-prev { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
/* front face darkens as it lifts, back face lightens as it lands */
.book-wleaf .front .book-shade { animation: shade-out .35s ease-in both; }
.book-wleaf .back .book-shade { opacity: 1; animation: shade-in .35s ease-out .35s both; }
.book-wleaf.turn-prev .book-shade { background: linear-gradient(to left, rgba(31, 30, 39, .28), rgba(31, 30, 39, 0) 70%); }

.book-measure { position: absolute; visibility: hidden; pointer-events: none; }
.book-measure > div { position: relative; }
</style>
