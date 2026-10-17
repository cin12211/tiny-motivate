<script setup lang="ts">
/**
 * Public landing page (design v48). Static demo data only, no account needed.
 * Lives at /landing-page for now; "/" is still the app.
 */
definePageMeta({ layout: false })
useHead({
  title: 'Motivation · Mỗi ngày một mầm nhỏ',
  meta: [{ name: 'description', content: 'Gieo một thói quen nhỏ, tự đặt phần thưởng, và nhìn khu vườn của bạn lớn lên mỗi ngày.' }],
})

const { user } = useAuth()
const appHref = computed(() => (user.value ? '/' : '/login'))

/** Small seeded PRNG so the demo gardens look the same on every visit. */
function rand(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

interface DemoCell { kind: 'plant' | 'dot' | 'today' | 'future', plant?: number }
/** Demo garden: `filled` share of past days grew a plant, today at index `todayAt`. */
function demoGarden(cols: number, rows: number, filled: number, seed: number, todayAt: number) {
  const r = rand(seed)
  let prev = 0
  return Array.from({ length: cols * rows }, (_, k): DemoCell => {
    if (k > todayAt) return { kind: 'future' }
    if (k === todayAt) return { kind: 'today' }
    if (r() > filled) return { kind: 'dot' }
    let n: number
    do n = 1 + Math.floor(r() * 55); while (n === prev)
    prev = n
    return { kind: 'plant', plant: n }
  })
}

const phoneGarden = demoGarden(7, 6, 0.78, 7, 38)
const yearGardenWide = demoGarden(30, 6, 0.72, 23, 160)
const yearGardenNarrow = demoGarden(10, 9, 0.72, 23, 83)
const bandPlants = Array.from({ length: 56 }, (_, i) => ((i % 28) * 2) + 1)

const steps = [
  { n: '01', title: 'Gieo một mục tiêu', text: 'Chọn việc nhỏ, số ngày bạn muốn thử, và một icon vẽ tay cho nó.' },
  { n: '02', title: 'Tick mỗi ngày', text: 'Làm xong thì bấm done. Một mầm cây mọc lên, ghi vài dòng nhật ký nếu muốn.' },
  { n: '03', title: 'Nhận quà bạn tự đặt', text: 'Đến mốc ngày, phần thưởng mở ra. Quà do bạn chọn nên bạn thật sự muốn nó.' },
]
const road = [
  { day: 3, icon: 'bubble-tea-01', name: 'Trà sữa', open: true },
  { day: 7, icon: 'restaurant-01', name: 'Đi ăn nhà hàng', open: true },
  { day: 14, icon: 'film-roll-01', name: 'Xem phim', open: false },
  { day: 30, icon: 'tablet-01', name: 'Máy đọc sách', open: false },
]
const moods = [['m1', 'Buồn'], ['m3', 'Chán'], ['m2', 'Vui'], ['m4', 'Năng lượng'], ['m5', 'Peak']] as const
const feats = [
  { icon: 'tablet-01', title: 'iPhone & web', text: 'Một tài khoản, mở ở đâu cũng thấy vườn của mình.' },
  { icon: 'g-alarm', title: 'Nhắc nhẹ mỗi ngày', text: 'Chọn giờ, app nhắc bạn tick trước khi ngủ.' },
  { icon: 'g-palette', title: '8 màu & chế độ tối', text: 'Đổi màu chủ đạo và logo app theo ý bạn.' },
]
const faqs = [
  { q: 'Có miễn phí không?', a: 'Có. Bạn tạo bao nhiêu mục tiêu tuỳ thích, không mất phí.' },
  { q: 'Lỡ một ngày thì mất quà à?', a: 'Không. Quà mở theo tổng số ngày đã làm, nên lỡ một hôm chỉ là mốc đến chậm một ngày.' },
  { q: 'Phần thưởng là gì?', a: 'Là thứ bạn tự hứa với mình: một ly trà sữa, một buổi xem phim, một món đồ. App chỉ nhắc và ăn mừng cùng bạn.' },
  { q: 'Người khác có thấy mục tiêu của tôi không?', a: 'Không. Mỗi tài khoản chỉ thấy mục tiêu và nhật ký của riêng mình.' },
]
const openFaq = ref(0)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const links = [['lp-how', 'Cách hoạt động'], ['lp-reward', 'Phần thưởng'], ['lp-journal', 'Nhật ký'], ['lp-faq', 'Câu hỏi']] as const
</script>

<template>
  <div class="lp">
    <!-- 1. nav -->
    <nav class="lp-nav">
      <NuxtLink to="/landing-page" class="lp-brand"><LogoTile icon="p2" :size="30" /><b>motivation</b></NuxtLink>
      <span class="lp-links">
        <a v-for="[id, label] in links" :key="id" :href="`#${id}`" @click.prevent="scrollTo(id)">{{ label }}</a>
      </span>
      <NuxtLink to="/signup" class="lp-btn sm">Dùng thử</NuxtLink>
    </nav>

    <!-- 2. hero -->
    <header class="lp-hero">
      <div class="lp-hcopy">
        <Badge class="self-start">Mỗi ngày một mầm nhỏ</Badge>
        <h1>Gieo một thói quen nhỏ.<br>Nhìn nó <em>mọc thành vườn</em>.</h1>
        <p>Đặt mục tiêu vài ngày, tự hứa với mình một món quà. Mỗi ngày bạn làm được, một mầm cây mọc lên trong khu vườn của bạn.</p>
        <div class="lp-ctas">
          <NuxtLink to="/signup" class="lp-btn" title="Bản App Store sắp có, dùng thử trên web trước nhé"><HandIcon name="apple" />Tải trên App Store <small class="lp-soon">Sắp có</small></NuxtLink>
          <NuxtLink :to="appHref" class="lp-btn ghost">Mở bản web</NuxtLink>
        </div>
        <small class="lp-fine">Miễn phí · iPhone &amp; web · đồng bộ một tài khoản</small>
      </div>
      <div class="lp-phone" aria-hidden="true">
        <div class="lp-ps">
          <p class="lp-hi"><GardenIcon icon="p2" class="size-6" />Chào bạn :)</p>
          <p class="lp-streak">Chuỗi dài nhất · <em>12 ngày</em></p>
          <Badge size="sm" class="self-start">Hôm nay · 14.10</Badge>
          <div class="lp-garden" style="--c: 7">
            <span v-for="(c, i) in phoneGarden" :key="i" class="lp-gc" :class="[c.kind, Math.floor(i / 7) % 2 && 'stag']">
              <GardenIcon v-if="c.kind === 'plant'" :day="c.plant" /><i v-else />
            </span>
          </div>
          <Badge size="sm" class="self-start">Mục tiêu của bạn</Badge>
          <div class="lp-prow"><HandIcon name="books-01" /><b>Đọc sách 10 phút</b><small>9/30</small></div>
          <div class="lp-prow"><HandIcon name="yoga-01" /><b>Giãn cơ buổi sáng</b><small>5/14</small></div>
        </div>
        <span class="lp-pm"><Mochi pose="sprout" :size="64" /></span>
      </div>
    </header>

    <!-- 3. plant band -->
    <div class="lp-band" aria-label="55 loại cây">
      <div class="lp-track"><GardenIcon v-for="(n, i) in bandPlants" :key="i" :day="n" /></div>
    </div>

    <!-- 4. how it works -->
    <section id="lp-how" class="lp-sec">
      <Badge class="self-start">Cách hoạt động</Badge>
      <h2>Ba bước, không cần cố gắng nhiều.</h2>
      <div class="lp-steps">
        <article v-for="(s, i) in steps" :key="s.n" class="lp-step">
          <small>{{ s.n }}</small>
          <div class="lp-ill">
            <div v-if="i === 0" class="lp-mini"><HandIcon name="books-01" /><b>Đọc sách 10 phút</b><Badge size="sm">30 ngày</Badge></div>
            <template v-else-if="i === 1">
              <span class="lp-done"><HandIcon name="tick-02" />done</span>
              <span class="lp-dots"><i v-for="d in 14" :key="d" :class="d <= 9 && 'on'" /></span>
            </template>
            <div v-else class="lp-mini"><HandIcon name="restaurant-01" /><b>Đi ăn nhà hàng</b><Badge size="sm" variant="solid">Ngày 7</Badge></div>
          </div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </article>
      </div>
    </section>

    <!-- 5. rewards -->
    <section id="lp-reward" class="lp-sec lp-split">
      <div>
        <Badge class="self-start">Phần thưởng</Badge>
        <h2>Quà do chính bạn đặt.</h2>
        <p>3 ngày một ly trà sữa, 7 ngày một bữa ngon, 30 ngày món đồ bạn để dành lâu rồi. Mỗi mốc có thể dùng ảnh chụp hoặc icon vẽ tay.</p>
      </div>
      <ol class="lp-road">
        <li v-for="r in road" :key="r.day" :class="r.open && 'ok'">
          <span class="lp-rd"><HandIcon :name="r.icon" /></span>
          <b>{{ r.name }}</b>
          <small>Ngày {{ r.day }}{{ r.open ? ' · đã mở' : '' }}</small>
        </li>
      </ol>
    </section>

    <!-- 6. missed a day -->
    <section class="lp-sec lp-miss">
      <div class="lp-missill">
        <Mochi pose="sleepy" :size="84" />
        <span class="lp-dots"><i v-for="d in 12" :key="d" :class="d === 6 ? 'miss' : 'on'" /></span>
      </div>
      <div>
        <Badge class="self-start">Lỡ một ngày?</Badge>
        <h2>Không sao cả.</h2>
        <p>Phần thưởng tính theo tổng số ngày bạn làm được, không phải chuỗi liên tục. Khu vườn vẫn ở đó, chờ bạn quay lại.</p>
      </div>
    </section>

    <!-- 7. journal & moods -->
    <section id="lp-journal" class="lp-sec lp-split rev">
      <div class="lp-jcard">
        <p class="lp-jh"><b>Ngày 9 · Đọc sách 10 phút</b><small>Thứ tư 14.10</small></p>
        <p class="lp-jt">Đọc xong chương 3 trên xe buýt. Hơi buồn ngủ nhưng vẫn giữ được 10 phút.</p>
        <div class="lp-moods">
          <span v-for="[id, name] in moods" :key="id" class="lp-mood" :class="id === 'm2' && 'on'"><GardenIcon :mood="id" /><small>{{ name }}</small></span>
        </div>
      </div>
      <div>
        <Badge class="self-start">Nhật ký &amp; cảm xúc</Badge>
        <h2>Mỗi ngày một dòng, một bông hoa.</h2>
        <p>Viết vài câu về ngày hôm nay và chọn một trong 5 bông hoa cảm xúc. Sau này bấm vào bất kỳ ô nào trong vườn để ghé lại ngày đó.</p>
      </div>
    </section>

    <!-- 8. your garden -->
    <section class="lp-sec lp-year">
      <Badge class="self-start">Khu vườn của bạn</Badge>
      <h2>Nhìn lại cả mùa trong một khu vườn.</h2>
      <p>Mỗi ô là một ngày, mỗi cây là một lần bạn giữ lời với chính mình. 55 loại cây và 40 món đồ làm vườn, mỗi ngày mọc ra một thứ khác.</p>
      <div class="lp-garden wide" style="--c: 30">
        <span v-for="(c, i) in yearGardenWide" :key="i" class="lp-gc" :class="[c.kind, Math.floor(i / 30) % 2 && 'stag']">
          <GardenIcon v-if="c.kind === 'plant'" :day="c.plant" /><i v-else />
        </span>
      </div>
      <div class="lp-garden narrow" style="--c: 10">
        <span v-for="(c, i) in yearGardenNarrow" :key="i" class="lp-gc" :class="[c.kind, Math.floor(i / 10) % 2 && 'stag']">
          <GardenIcon v-if="c.kind === 'plant'" :day="c.plant" /><i v-else />
        </span>
      </div>
      <small class="lp-fine text-center">01.07 – 31.12 · đã mọc 118 cây</small>
    </section>

    <!-- 9. features -->
    <section class="lp-sec">
      <div class="lp-feats">
        <div v-for="f in feats" :key="f.title" class="lp-feat"><HandIcon :name="f.icon" /><b>{{ f.title }}</b><p>{{ f.text }}</p></div>
      </div>
    </section>

    <!-- 10. FAQ -->
    <section id="lp-faq" class="lp-sec">
      <Badge class="self-start">Câu hỏi thường gặp</Badge>
      <div class="lp-qa">
        <div v-for="(f, i) in faqs" :key="f.q" class="lp-q" :class="openFaq === i && 'open'">
          <button type="button" :aria-expanded="openFaq === i" @click="openFaq = openFaq === i ? -1 : i">
            <b>{{ f.q }}</b><span class="lp-qi"><HandIcon name="add-01" /></span>
          </button>
          <p v-if="openFaq === i">{{ f.a }}</p>
        </div>
      </div>
    </section>

    <!-- 11. final CTA -->
    <section id="lp-cta" class="lp-cta">
      <Mochi pose="wave" :size="120" class="max-[720px]:size-24" />
      <h2>Khu vườn của bạn<br>đang chờ mầm đầu tiên.</h2>
      <div class="lp-ctas">
        <NuxtLink to="/signup" class="lp-btn"><HandIcon name="apple" />Tải trên App Store <small class="lp-soon">Sắp có</small></NuxtLink>
        <NuxtLink :to="appHref" class="lp-btn ghost">Mở bản web</NuxtLink>
      </div>
    </section>

    <!-- 12. footer -->
    <footer class="lp-foot">
      <span class="lp-brand"><LogoTile icon="p2" :size="24" /><b>motivation</b></span>
      <span class="lp-flinks">
        <a href="#">Điều khoản</a>
        <a href="#">Quyền riêng tư</a>
        <a href="mailto:hello@motivation.app">hello@motivation.app</a>
      </span>
      <small>© 2026 motivation · Mỗi ngày một mầm nhỏ</small>
    </footer>
  </div>
</template>

<style scoped>
.lp {
  --frame: #c9c8cf;
  min-height: 100dvh;
  background: var(--m-bg);
  color: var(--m-ink);
  font-size: 13.5px;
  overflow-x: hidden;
}
:global(.dark) .lp { --frame: #2a2930; }
@media (prefers-color-scheme: dark) { :global(:root:not(.light)) .lp { --frame: #2a2930; } }
.lp a { color: inherit; text-decoration: none; }
.lp h1, .lp h2, .lp h3 { margin: 0; color: var(--m-indigo); font-weight: 500; letter-spacing: -.01em; }
.lp h1 { font-size: 44px; line-height: 1.15; }
.lp h2 { font-size: 28px; line-height: 1.25; }
.lp h3 { font-size: 15px; font-weight: 600; }
.lp h1 em, .lp h2 em { text-decoration: underline wavy var(--m-faint) 2px; text-underline-offset: 8px; }
.lp p { margin: 0; line-height: 1.7; color: var(--m-ink); }
.lp-fine { font-size: 11px; color: var(--m-muted); }

.lp-nav { display: flex; align-items: center; gap: 20px; padding: 18px 40px; max-width: 1120px; margin: 0 auto; }
.lp-brand { display: inline-flex; align-items: center; gap: 9px; color: var(--m-indigo); }
.lp-brand b { font-weight: 600; font-size: 15px; }
.lp-links { flex: 1; display: flex; justify-content: center; gap: 24px; font-size: 12.5px; color: var(--m-indigo); }
.lp-links a:hover { text-decoration: underline; text-underline-offset: 4px; }
.lp-btn { display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 18px; border-radius: 8px; background: var(--m-indigo); color: var(--m-on-indigo) !important; font-weight: 500; font-size: 13px; box-shadow: 0 8px 18px -10px var(--m-glow); white-space: nowrap; }
.lp-btn :deep(.iconify) { width: 18px; height: 18px; }
.lp-btn.ghost { background: transparent; color: var(--m-indigo) !important; border: 1px solid var(--m-faint); box-shadow: none; }
.lp-btn.sm { height: 32px; padding: 0 13px; font-size: 12px; }
.lp-btn:hover { filter: brightness(1.08); }
.lp-soon { font-size: 10px; opacity: .75; }

.lp-hero, .lp-sec, .lp-cta, .lp-foot { max-width: 1120px; margin-left: auto; margin-right: auto; }
.lp-hero { display: grid; grid-template-columns: 1.1fr .9fr; align-items: center; gap: 40px; padding: 40px 56px 56px; }
.lp-hcopy { display: flex; flex-direction: column; gap: 18px; }
.lp-hcopy > p { max-width: 460px; }
.lp-ctas { display: flex; gap: 10px; flex-wrap: wrap; }

.lp-phone { position: relative; justify-self: center; width: 280px; padding: 10px; border-radius: 38px; background: var(--frame); box-shadow: 0 40px 70px -40px rgba(20, 10, 80, .45); }
.lp-ps { display: flex; flex-direction: column; gap: 10px; padding: 26px 18px 20px; border-radius: 30px; background: var(--m-paper); color: var(--m-indigo); }
.lp-hi { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 15px; color: var(--m-indigo) !important; }
.lp-streak { font-size: 10.5px; color: var(--m-muted) !important; margin-top: -6px !important; }
.lp-prow { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px dashed var(--m-faint); font-size: 11.5px; }
.lp-prow:last-child { border-bottom: 0; }
.lp-prow b { flex: 1; font-weight: 500; }
.lp-prow small { color: var(--m-muted); font-size: 10.5px; }
.lp-prow :deep(.iconify) { width: 18px; height: 18px; }
.lp-pm { position: absolute; left: -46px; bottom: 28px; color: var(--m-indigo); }

/* demo gardens, with the staggered rows of the app (v49) */
.lp-garden { --stag: calc(100% / var(--c) / 4); display: grid; grid-template-columns: repeat(var(--c), 1fr); gap: 3px; padding-right: var(--stag); }
.lp-gc { position: relative; aspect-ratio: 1; display: grid; place-items: center; color: var(--m-indigo); border-radius: 5px; }
.lp-gc.stag { left: 25%; }
.lp-gc :deep(svg) { width: 88%; height: 88%; }
.lp-gc i { width: 3px; height: 3px; border-radius: 50%; background: var(--m-faint); }
.lp-gc.future i { display: none; }
.lp-gc.today { box-shadow: inset 0 0 0 1.5px var(--m-indigo); }
.lp-gc.today i { background: var(--m-indigo); width: 4px; height: 4px; }
.lp-gc.today::before { content: ""; position: absolute; inset: -3px; border-radius: 7px; border: 1.5px solid var(--m-indigo); animation: pulse-ring 1.8s ease-out infinite; pointer-events: none; }

.lp-band { overflow: hidden; padding: 18px 0; border-top: 1px dashed var(--m-faint); border-bottom: 1px dashed var(--m-faint); mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
.lp-track { display: flex; gap: 26px; width: max-content; color: var(--m-indigo); animation: lpmove 60s linear infinite; }
.lp-track :deep(svg) { width: 34px; height: 34px; flex: none; }
@keyframes lpmove { to { transform: translateX(-50%); } }

.lp-sec { display: flex; flex-direction: column; gap: 16px; padding: 64px 56px 0; }
.lp-sec > p { max-width: 560px; }
.lp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 10px; }
.lp-step { display: flex; flex-direction: column; gap: 10px; padding: 18px; border-radius: 14px; background: var(--m-paper); border: 1px solid var(--m-line); }
.lp-step > small { font-size: 11px; color: var(--m-muted); }
.lp-step p { font-size: 12.5px; }
.lp-ill { height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; border-radius: 10px; background: var(--m-surface); color: var(--m-indigo); }
.lp-mini { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 9px; background: var(--m-paper); border: 1px solid var(--m-line); font-size: 12px; }
.lp-mini b { font-weight: 500; }
.lp-done { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px; border-radius: 7px; background: var(--m-indigo); color: var(--m-on-indigo); font: 500 21px var(--font-hand); }
.lp-done :deep(.iconify) { width: 16px; height: 16px; }
.lp-dots { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.lp-dots i { width: 8px; height: 8px; border-radius: 50%; border: 1.3px solid var(--m-faint); }
.lp-dots i.on { background: var(--m-indigo); border-color: var(--m-indigo); }
.lp-dots i.miss { border-style: dashed; border-color: var(--m-muted); }

.lp-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; }
.lp-split > div { display: flex; flex-direction: column; gap: 16px; }
.lp-road { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.lp-road li { position: relative; display: grid; grid-template-columns: 48px 1fr auto; align-items: center; gap: 12px; padding: 10px 0; color: var(--m-indigo); }
.lp-road li:not(:last-child)::after { content: ""; position: absolute; left: 23px; top: 52px; height: calc(100% - 32px); border-left: 1.5px dashed var(--m-faint); }
.lp-road li.ok:not(:last-child)::after { border-left-style: solid; border-color: var(--m-indigo); }
.lp-rd { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 12px; border: 1.3px dashed var(--m-faint); background: var(--m-paper); }
.lp-road li.ok .lp-rd { border: 0; background: var(--m-indigo); color: var(--m-on-indigo); }
.lp-rd :deep(.iconify) { width: 24px; height: 24px; }
.lp-road b { font-weight: 500; }
.lp-road small { font-size: 11px; color: var(--m-muted); }

.lp-miss { flex-direction: row; align-items: center; gap: 40px; }
.lp-miss > div:last-child { display: flex; flex-direction: column; gap: 16px; max-width: 520px; }
.lp-missill { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 22px 30px; border-radius: 14px; background: var(--m-paper); border: 1px solid var(--m-line); color: var(--m-indigo); }

.lp-jcard { padding: 20px; border-radius: 14px; background: var(--m-paper); border: 1px solid var(--m-line); gap: 12px !important; }
.lp-jh { display: flex; justify-content: space-between; gap: 10px; color: var(--m-indigo) !important; font-size: 12.5px; }
.lp-jh b { font-weight: 600; }
.lp-jh small { color: var(--m-muted); }
.lp-jt { font-size: 13px; padding: 12px; border-radius: 9px; background: var(--m-surface); }
.lp-moods { display: flex; justify-content: space-between; gap: 6px; }
.lp-mood { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 6px; border-radius: 9px; color: var(--m-indigo); flex: 1; }
.lp-mood :deep(svg) { width: 30px; height: 30px; }
.lp-mood small { font-size: 10px; color: var(--m-muted); }
.lp-mood.on { background: var(--m-indigo); color: var(--m-on-indigo); }
.lp-mood.on small { color: var(--m-on-indigo); }

.lp-year .lp-garden { gap: 4px; padding: 18px calc(18px + var(--stag)) 18px 18px; border-radius: 14px; background: var(--m-paper); border: 1px solid var(--m-line); }
.lp-year .lp-garden.narrow { display: none; }

.lp-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.lp-feat { display: flex; flex-direction: column; gap: 8px; padding: 18px 0; border-top: 1px dashed var(--m-faint); color: var(--m-indigo); }
.lp-feat :deep(.iconify) { width: 26px; height: 26px; }
.lp-feat b { font-weight: 600; }
.lp-feat p { font-size: 12.5px; }

.lp-qa { display: flex; flex-direction: column; }
.lp-q { border-bottom: 1px dashed var(--m-faint); }
.lp-q button { all: unset; box-sizing: border-box; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 0; cursor: pointer; color: var(--m-indigo); }
.lp-q button:focus-visible { outline: 2px solid var(--m-indigo); outline-offset: 2px; }
.lp-q b { font-weight: 500; }
.lp-qi { display: grid; transition: transform .2s; }
.lp-q.open .lp-qi { transform: rotate(45deg); }
.lp-q p { padding: 0 0 16px; font-size: 12.5px; max-width: 640px; }

.lp-cta { display: flex; flex-direction: column; align-items: center; gap: 18px; margin-top: 72px; padding: 48px 24px; border-radius: 20px; background: var(--m-paper); border: 1px solid var(--m-line); text-align: center; color: var(--m-indigo); width: calc(100% - 112px); max-width: 1008px; }
.lp-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 36px 56px 40px; font-size: 11.5px; color: var(--m-muted); }
.lp-flinks { display: flex; gap: 18px; flex-wrap: wrap; }
.lp-flinks a:hover { color: var(--m-indigo); }

@media (max-width: 720px) {
  .lp h1 { font-size: 32px; }
  .lp h2 { font-size: 23px; }
  .lp-nav { padding: 14px 16px; }
  .lp-links { display: none; }
  .lp-nav .lp-btn { margin-left: auto; }
  .lp-hero { grid-template-columns: 1fr; gap: 36px; padding: 20px 16px 40px; }
  .lp-phone { width: 250px; }
  .lp-pm { left: -30px; }
  .lp-sec { padding: 48px 16px 0; }
  .lp-steps, .lp-feats { grid-template-columns: 1fr; }
  .lp-split { grid-template-columns: 1fr; gap: 24px; }
  .lp-split.rev > div:first-child { order: 2; }
  .lp-miss { flex-direction: column; align-items: stretch; gap: 24px; }
  .lp-year .lp-garden { padding: 12px calc(12px + var(--stag)) 12px 12px; gap: 3px; }
  .lp-year .lp-garden.wide { display: none; }
  .lp-year .lp-garden.narrow { display: grid; }
  .lp-cta { margin-top: 56px; padding: 36px 18px; width: calc(100% - 32px); }
  .lp-foot { flex-direction: column; align-items: flex-start; padding: 28px 16px 36px; }
  .lp-ctas .lp-btn { flex: 1; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-track, .lp-gc.today::before { animation: none; }
}
</style>
