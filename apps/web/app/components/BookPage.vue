<script setup lang="ts">
import type { BkGrowth, BkItem } from '~/utils/bach-khoa'
import { BK_CHAPTERS, BK_HINT, BK_TOTAL } from '~/utils/bach-khoa'

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
  | { t: 'it', item: BkItem }

const props = defineProps<{
  page: BookPageDef
  growth: Map<string, BkGrowth>
  /** index (in the page flow) of each chapter's first page, for the contents */
  chapterStart: number[]
  /** species being looked at (outlined in its chapter grid) */
  selected?: string | null
  /** owner's name for the cover */
  owner: string
  cell: number
}>()
const emit = defineEmits<{ go: [page: number], open: [id: string], back: [] }>()

const sown = computed(() => [...props.growth.keys()].filter(id => BK_CHAPTERS.some(ch => ch.items.some(it => it.id === id))).length)
const sownIn = (c: number) => BK_CHAPTERS[c]!.items.filter(it => props.growth.has(it.id)).length
const dot = (iso: string) => iso.split('-').reverse().join('.')
const no = (n: number) => `Số ${String(n).padStart(3, '0')}`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
</script>

<template>
  <!-- cover -->
  <div v-if="page.t === 'cover'" class="bk-pg items-center justify-center gap-1.5 text-center">
    <GardenIcon icon="gm-idle" class="mb-1.5 size-[110px] text-indigo" />
    <p class="bk-kicker justify-center">Bách khoa vườn</p>
    <h2 class="font-hand text-[52px] leading-none font-bold text-indigo">Germi</h2>
    <p class="text-xs text-muted-foreground">Sổ cây của <span class="font-hand text-[1.5em] leading-none font-bold text-indigo">{{ owner }}</span></p>
    <div class="mt-3.5 h-1.5 w-[70%] overflow-hidden rounded-full bg-line">
      <i class="block h-full rounded-full bg-indigo" :style="{ width: `${(sown / BK_TOTAL * 100).toFixed(1)}%` }" />
    </div>
    <p class="bk-sub">Đã gieo <b>{{ sown }}</b> / {{ BK_TOTAL }} hạt</p>
  </div>

  <!-- Germi -->
  <div v-else-if="page.t === 'germi'" class="bk-pg">
    <div class="flex items-center gap-2.5">
      <Germi pose="wave" :size="84" />
      <h3 class="text-[15px] leading-snug font-semibold text-indigo">Chào bạn, mình là Germi</h3>
    </div>
    <p>Mình là một hạt mầm nhỏ có hai chiếc lá. Tên mình lấy từ chữ <i>germ</i>, nghĩa là mầm. Mình sống trong khu vườn của bạn.</p>
    <p class="font-semibold text-indigo">Germi ở đây để giúp bạn</p>
    <ul class="bk-list">
      <li>Chăm khu vườn: mỗi ngày bạn tick xong một mục tiêu là một hạt được gieo</li>
      <li>Nhắc bạn nhẹ nhàng đúng giờ bạn chọn</li>
      <li>Giữ bí mật phần quà cho tới ngày bạn mở</li>
      <li>Ghi nhớ cảm xúc và nhật ký từng ngày</li>
    </ul>
    <p>Cuốn sách này ghi lại mọi loài cây đã mọc trong vườn bạn. Trang nào còn dấu <b class="bk-q">?</b> là hạt chưa gieo, cứ chăm vườn đều rồi nó sẽ hiện ra.</p>
  </div>

  <!-- contents -->
  <div v-else-if="page.t === 'toc'" class="bk-pg">
    <h3 class="bk-h">Mục lục</h3>
    <div class="flex flex-col">
      <button v-for="(ch, c) in BK_CHAPTERS" :key="c" type="button" class="bk-toc" @click="emit('go', chapterStart[c]!)">
        <span class="w-3.5 font-hand text-[20px] leading-none font-bold text-indigo">{{ c + 1 }}</span>
        <span class="flex flex-col gap-px">
          <b class="text-[13px] font-medium">{{ cap(ch.name) }}</b>
          <small class="flex items-center gap-1.5 text-[11px] text-muted-foreground">Đã gieo {{ sownIn(c) }} / {{ ch.items.length }}<em v-if="c === 6" class="bk-tag">pro</em></small>
        </span>
        <span class="mb-1.5 flex-1 self-end border-b border-dotted border-faint" />
        <span class="text-[11.5px] text-muted-foreground">{{ chapterStart[c]! + 1 }}</span>
      </button>
    </div>
  </div>

  <!-- chapter -->
  <div v-else-if="page.t === 'ch'" class="bk-pg">
    <template v-if="page.part">
      <p class="bk-kicker"><span>Chương {{ page.c + 1 }} · tiếp</span><span>{{ page.part + 1 }} / {{ page.parts }}</span></p>
    </template>
    <template v-else>
      <p class="bk-kicker"><span>Chương {{ page.c + 1 }}</span><span v-if="page.parts > 1">1 / {{ page.parts }}</span></p>
      <h3 class="bk-h">{{ cap(BK_CHAPTERS[page.c]!.name) }}</h3>
      <p class="bk-sub">{{ cap(BK_CHAPTERS[page.c]!.sub) }} · đã gieo <b>{{ sownIn(page.c) }}</b> / {{ BK_CHAPTERS[page.c]!.items.length }}</p>
    </template>
    <div class="bk-grid" :style="{ '--bkc': `${cell}px` }">
      <button
        v-for="it in BK_CHAPTERS[page.c]!.items.slice(page.from, page.to)"
        :key="it.id"
        type="button"
        class="bk-cell"
        :class="[growth.has(it.id) && 'on', selected === it.id && 'sel']"
        :aria-label="growth.has(it.id) ? it.name : 'chưa gieo'"
        @click="emit('open', it.id)"
      >
        <GardenIcon v-if="growth.has(it.id)" :icon="it.id" class="size-[78%]" />
        <b v-else>?</b>
        <em v-if="!growth.has(it.id) && (it.kind === 'pro' || it.kind === 'tip')" class="bk-tag absolute -top-[5px] -right-1">{{ it.kind }}</em>
      </button>
    </div>
  </div>

  <!-- one species -->
  <div v-else class="bk-pg" :class="!growth.has(page.item.id) && 'bk-lock'">
    <p class="bk-kicker">
      <button type="button" class="text-[11px] text-indigo underline decoration-dotted underline-offset-[3px]" @click="emit('back')">{{ cap(BK_CHAPTERS[page.item.c]!.name) }}</button>
      <span>{{ no(page.item.no) }}</span>
    </p>
    <div class="bk-art">
      <GardenIcon v-if="growth.has(page.item.id)" :icon="page.item.id" class="size-full" />
      <b v-else>?</b>
    </div>
    <h3 class="bk-name">{{ growth.has(page.item.id) ? cap(page.item.name) : '???' }}</h3>
    <p v-if="growth.has(page.item.id)" class="bk-desc">{{ cap(page.item.desc) }}</p>
    <p v-else-if="page.item.kind === 'pro' || page.item.kind === 'tip'" class="bk-desc"><em class="bk-tag">{{ page.item.kind }}</em></p>
    <div class="mt-1 flex items-start gap-2 rounded-xl bg-background px-3 py-2.5">
      <GardenIcon icon="gm-idle" class="size-[26px] flex-none text-indigo" />
      <p>{{ growth.has(page.item.id) ? page.item.line : BK_HINT[page.item.kind] }}</p>
    </div>
    <div v-if="growth.get(page.item.id)" class="mt-auto flex gap-2.5">
      <span class="bk-stat"><small>Mọc lần đầu</small><b>{{ dot(growth.get(page.item.id)!.first) }}</b></span>
      <span class="bk-stat"><small>Đã mọc</small><b>{{ growth.get(page.item.id)!.n }} lần</b></span>
    </div>
  </div>
</template>

<style scoped>
.bk-pg { display: flex; flex-direction: column; gap: 10px; height: 100%; }
.bk-pg p { margin: 0; font-size: 12.5px; line-height: 1.6; }
.bk-pg .bk-kicker { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--m-muted); letter-spacing: .02em; }
.bk-h { margin: 0; font-size: 18px; font-weight: 600; color: var(--m-indigo); }
.bk-pg .bk-sub { font-size: 11.5px; color: var(--m-muted); }
.bk-sub b { color: var(--m-indigo); }
.bk-list { margin: 0; padding-left: 16px; font-size: 12.5px; line-height: 1.6; display: flex; flex-direction: column; gap: 3px; list-style: disc; }
.bk-list li::marker { color: var(--m-indigo); }
.bk-q { display: inline-grid; place-items: center; width: 16px; height: 16px; border: 1px dashed var(--m-muted); border-radius: 4px; font-size: 10px; color: var(--m-muted); }
.bk-toc { display: flex; align-items: center; gap: 8px; padding: 9px 0; text-align: left; border-bottom: 1px dashed var(--m-line); color: var(--m-ink); }
.bk-tag { font-style: normal; font-size: 8.5px; line-height: 1; padding: 2px 4px; border-radius: 5px; background: var(--m-indigo); color: var(--m-on-indigo); }
.bk-grid { display: grid; grid-template-columns: repeat(auto-fill, var(--bkc, 48px)); grid-auto-rows: var(--bkc, 48px); gap: 6px; justify-content: center; }
.bk-cell { position: relative; width: var(--bkc, 48px); height: var(--bkc, 48px); border-radius: 10px; display: grid; place-items: center; border: 1px dashed var(--m-faint); color: var(--m-muted); }
.bk-cell b { font-size: calc(var(--bkc, 48px) * .3); font-weight: 500; }
.bk-cell.on { border: 1px solid var(--m-line); background: var(--m-paper); color: var(--m-indigo); }
.bk-cell.sel { outline: 2px solid var(--m-indigo); outline-offset: 1px; }
.bk-art { align-self: center; width: var(--bk-art, 150px); height: var(--bk-art, 150px); display: grid; place-items: center; margin: 8px 0 2px; color: var(--m-indigo); }
.bk-lock .bk-art { border: 1.5px dashed var(--m-faint); border-radius: 22px; color: var(--m-muted); width: 130px; height: 130px; margin: 18px auto 12px; }
.bk-lock .bk-art b { font-size: 40px; font-weight: 400; }
.bk-name { margin: 0; text-align: center; font-size: 20px; font-weight: 600; color: var(--m-indigo); }
.bk-lock .bk-name { color: var(--m-muted); letter-spacing: .1em; }
.bk-pg .bk-desc { text-align: center; color: var(--m-muted); font-size: 12px; }
.bk-stat { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border: 1px solid var(--m-line); border-radius: 10px; }
.bk-stat small { font-size: 10.5px; color: var(--m-muted); }
.bk-stat b { font-size: 13px; font-weight: 600; color: var(--m-indigo); }
</style>
