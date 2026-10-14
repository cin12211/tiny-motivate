<script setup lang="ts">
import { toast } from 'vue-sonner'

useHead({ title: 'Tạo mục tiêu · Motivation' })

const { create, upload } = useGoals()

interface DraftReward { key: number, day: number, title: string, icon: string, image: string | null }

const title = ref('')
const icon = ref(GOAL_ICONS[0]!)
const totalDays = ref(30)
const presets = [7, 14, 21, 30, 66]
let seq = 0
const rewards = ref<DraftReward[]>([
  { key: seq++, day: 3, title: 'Ly trà sữa', icon: 'bubble-tea-01', image: null },
  { key: seq++, day: 7, title: 'Bữa ăn nhà hàng', icon: 'restaurant-01', image: null },
  { key: seq++, day: 30, title: 'Máy đọc sách', icon: 'books-01', image: null },
])
const pickerFor = ref<number | null>(null)
const uploading = ref<number | null>(null)
const saving = ref(false)
const tried = ref(false)

const titleError = computed(() => tried.value && !title.value.trim() ? 'Đặt tên cho mục tiêu nhé' : '')
const sortedRewards = computed(() => [...rewards.value].filter(r => r.title.trim()).sort((a, b) => a.day - b.day))

function setDays(n: number) {
  totalDays.value = Math.min(365, Math.max(1, n))
}
watch(totalDays, (n) => {
  for (const r of rewards.value) r.day = Math.min(r.day, n)
})

function addReward() {
  const last = rewards.value.at(-1)?.day ?? 0
  rewards.value.push({ key: seq++, day: Math.min(totalDays.value, last + 7), title: '', icon: 'gift', image: null })
}
function removeReward(key: number) {
  rewards.value = rewards.value.filter(r => r.key !== key)
  if (pickerFor.value === key) pickerFor.value = null
}

async function onFile(r: DraftReward, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = r.key
  try {
    r.image = (await upload(file)).url
  }
  catch (err: any) {
    toast.error(err?.data?.statusMessage || 'Không tải được ảnh')
  }
  finally {
    uploading.value = null
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function submit() {
  tried.value = true
  if (!title.value.trim()) return
  saving.value = true
  try {
    const goal = await create({
      title: title.value,
      icon: icon.value,
      totalDays: totalDays.value,
      rewards: sortedRewards.value.map(({ day, title, icon, image }) => ({ day, title, icon, image })),
    })
    toast.success('Đã tạo mục tiêu mới!')
    await navigateTo(`/goals/${goal.id}`)
  }
  catch (err: any) {
    toast.error(err?.data?.statusMessage || 'Không tạo được mục tiêu')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-2 flex items-center gap-3">
      <Button as-child variant="outline" size="icon" aria-label="Quay lại">
        <NuxtLink to="/"><Icon name="hugeicons:arrow-left-01" /></NuxtLink>
      </Button>
      <h2 class="text-[26px] lg:text-[30px]">Tạo mục tiêu mới</h2>
    </div>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
        <div>
          <Label for="title" class="mb-1.5 block text-sm font-black">Bạn muốn làm gì mỗi ngày?</Label>
          <Input id="title" v-model="title" placeholder="VD: Học tiếng Anh 20 phút" maxlength="80" :aria-invalid="!!titleError" />
          <p v-if="titleError" class="mt-1.5 text-[13px] font-bold text-red">{{ titleError }}</p>
        </div>

        <div>
          <span class="mb-1.5 block text-sm font-black">Biểu tượng</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ic in GOAL_ICONS"
              :key="ic"
              type="button"
              class="grid size-[46px] place-items-center rounded-xl border-2 border-b-4 border-line bg-surface text-muted-foreground"
              :class="icon === ic && 'border-sky bg-sky-soft text-sky'"
              :aria-pressed="icon === ic"
              :aria-label="ic"
              @click="icon = ic"
            >
              <Icon :name="`hugeicons:${ic}`" class="size-6" />
            </button>
          </div>
        </div>

        <div>
          <span class="mb-1.5 block text-sm font-black">Thời gian thử thách</span>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="n in presets"
              :key="n"
              type="button"
              class="h-10 rounded-xl border-2 border-b-4 border-line bg-surface px-3.5 font-extrabold"
              :class="totalDays === n && 'border-sky bg-sky-soft text-sky'"
              @click="setDays(n)"
            >
              {{ n }} ngày
            </button>
            <div class="ml-auto flex items-center gap-1.5">
              <Button type="button" variant="outline" size="icon-sm" aria-label="Bớt 1 ngày" @click="setDays(totalDays - 1)"><Icon name="hugeicons:minus-sign" /></Button>
              <output class="min-w-11 text-center text-[22px] font-black tabular-nums">{{ totalDays }}</output>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Thêm 1 ngày" @click="setDays(totalDays + 1)"><Icon name="hugeicons:add-01" /></Button>
            </div>
          </div>
        </div>

        <div>
          <span class="mb-1 block text-sm font-black">Phần thưởng cho từng chặng</span>
          <p class="mb-2.5 text-[13px] text-muted-foreground">Lỡ một ngày cũng không sao: quà mở khi bạn đủ tổng số ngày hoàn thành. Bấm vào ô biểu tượng để chọn icon hoặc tải ảnh món quà.</p>

          <div v-for="r in rewards" :key="r.key" class="mb-2">
            <div class="flex items-center gap-2">
              <div class="relative w-[74px] shrink-0">
                <Input v-model.number="r.day" type="number" min="1" :max="totalDays" class="pr-1 pl-2 text-center" aria-label="Ngày nhận" />
              </div>
              <button
                type="button"
                class="relative grid size-12 shrink-0 place-items-center rounded-xl border-2 border-b-4 border-line bg-surface text-orange"
                :class="pickerFor === r.key && 'border-sky'"
                aria-label="Chọn icon hoặc ảnh"
                @click="pickerFor = pickerFor === r.key ? null : r.key"
              >
                <span class="grid size-full place-items-center overflow-hidden rounded-[10px]"><RewardBadge :reward="r" icon-class="size-6" /></span>
                <span class="absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full border-2 border-surface bg-sky text-white">
                  <Icon name="hugeicons:camera-01" class="size-3" />
                </span>
              </button>
              <Input v-model="r.title" placeholder="Tên phần thưởng" class="min-w-0 flex-1" maxlength="60" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Xoá phần thưởng" @click="removeReward(r.key)">
                <Icon name="hugeicons:delete-02" />
              </Button>
            </div>

            <div v-if="pickerFor === r.key" class="mt-2 flex flex-col gap-2.5 rounded-2xl border-2 border-sky bg-sky-soft p-3">
              <span class="label-caps text-sky-dark">Ảnh món quà</span>
              <div class="flex flex-wrap items-center gap-2">
                <img v-if="r.image" :src="r.image" alt="" class="size-14 rounded-xl border-2 border-line object-cover">
                <label class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-sky bg-surface px-3.5 text-[13px] font-black tracking-wide text-sky uppercase">
                  <Icon :name="uploading === r.key ? 'hugeicons:loading-03' : 'hugeicons:image-add-01'" class="size-5" :class="uploading === r.key && 'animate-spin'" />
                  {{ r.image ? 'Đổi ảnh' : 'Tải ảnh lên' }}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="sr-only" @change="onFile(r, $event)">
                </label>
                <Button v-if="r.image" type="button" variant="outline" size="sm" class="text-muted-foreground" @click="r.image = null">
                  <Icon name="hugeicons:image-delete-02" /> Bỏ ảnh
                </Button>
              </div>
              <span class="label-caps text-sky-dark">Hoặc chọn icon</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="ic in REWARD_ICONS"
                  :key="ic"
                  type="button"
                  class="grid size-10 place-items-center rounded-lg border-2 border-b-4 border-line bg-surface text-orange"
                  :class="r.icon === ic && !r.image && 'border-sky text-sky'"
                  :aria-label="ic"
                  @click="r.icon = ic; r.image = null"
                >
                  <Icon :name="`hugeicons:${ic}`" class="size-5" />
                </button>
              </div>
            </div>
          </div>

          <Button type="button" variant="outline" class="w-full" @click="addReward">
            <Icon name="hugeicons:add-01" /> Thêm phần thưởng
          </Button>
        </div>

        <Button type="submit" size="lg" class="w-full" :disabled="saving">
          {{ saving ? 'Đang tạo…' : 'Bắt đầu thử thách' }}
        </Button>
      </form>

      <!-- Live preview -->
      <aside class="xl:sticky xl:top-6">
        <Card class="px-5">
          <h3 class="text-lg">Xem trước</h3>
          <div class="flex items-center gap-3.5 rounded-2xl bg-field p-3">
            <div class="grid size-[52px] shrink-0 place-items-center rounded-2xl border-2 border-b-4 border-line bg-surface text-sky">
              <Icon :name="`hugeicons:${icon}`" class="size-7" />
            </div>
            <div class="min-w-0">
              <b class="block truncate text-lg leading-tight font-black">{{ title || 'Mục tiêu của bạn' }}</b>
              <small class="text-muted-foreground">{{ totalDays }} ngày · {{ sortedRewards.length }} phần thưởng</small>
            </div>
          </div>

          <div class="relative mx-1.5 mt-1 h-14">
            <div class="absolute inset-x-0 top-[34px] h-2 rounded-full bg-line" />
            <div
              v-for="r in sortedRewards"
              :key="r.key"
              class="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              :style="{ left: `${(r.day / totalDays) * 100}%` }"
            >
              <span class="grid size-7 place-items-center overflow-hidden rounded-full border-2 border-surface bg-yellow-soft text-orange">
                <RewardBadge :reward="r" icon-class="size-4" />
              </span>
              <span class="mt-3 text-[11px] font-black text-muted-foreground">{{ r.day }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div v-for="r in sortedRewards" :key="r.key" class="flex items-center gap-2.5 text-sm">
              <span class="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-b-4 border-line bg-surface text-orange">
                <RewardBadge :reward="r" icon-class="size-[18px]" />
              </span>
              <span class="truncate">{{ r.title }}</span>
              <span class="ml-auto shrink-0 text-[12.5px] text-muted-foreground">Ngày {{ r.day }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-2xl bg-field p-3 text-[13px]">
            <Mochi pose="gift" :size="56" class="shrink-0" />
            <span>Mochi sẽ giữ quà giúp bạn. Hoàn thành đủ ngày là mở được!</span>
          </div>
        </Card>
      </aside>
    </div>
  </div>
</template>
