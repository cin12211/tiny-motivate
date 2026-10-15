<script setup lang="ts">
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { toISODate } from '#shared/utils/dates'
import Mochi from '~/components/Mochi.vue'
import { cn } from '@/lib/utils'

useHead({ title: 'Mục tiêu mới · Motivation' })

const { create, upload } = useGoals()

interface DraftReward { key: number, day: number, title: string, icon: string, image: string | null }

let seq = 0
const title = ref('')
const icon = ref(GOAL_ICONS[0]!)
const totalDays = ref(30)
const startDate = ref(toISODate())
const rewards = ref<DraftReward[]>([
  { key: seq++, day: 3, title: '1 ly trà sữa', icon: 'bubble-tea-01', image: null },
  { key: seq++, day: 7, title: 'Bữa ăn nhà hàng', icon: 'restaurant-01', image: null },
  { key: seq++, day: 30, title: '', icon: 'gift', image: null },
])
const presets = [7, 21, 30, 66]
const pickerFor = ref<number | null>(null)
const uploading = ref<number | null>(null)
const saving = ref(false)
const error = ref('')

const track = computed(() => rewards.value.filter(r => r.day >= 1 && r.day <= totalDays.value))

function setDays(n: number) {
  totalDays.value = Math.min(365, Math.max(3, n))
}

function addReward() {
  const last = rewards.value.reduce((m, r) => Math.max(m, r.day), 0)
  rewards.value.push({ key: seq++, day: Math.min(totalDays.value, last + 7), title: '', icon: 'gift', image: null })
}
function removeReward(key: number) {
  rewards.value = rewards.value.filter(r => r.key !== key)
  if (pickerFor.value === key) pickerFor.value = null
}

async function onFile(r: DraftReward, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) return toast('File này không phải ảnh, chọn ảnh JPG hoặc PNG nhé.')
  uploading.value = r.key
  try {
    r.image = (await upload(file)).url
  }
  catch (err) {
    toast(errorMessage(err, 'Không tải được ảnh'))
  }
  finally {
    uploading.value = null
  }
}

async function submit() {
  error.value = !title.value.trim()
    ? 'Đặt tên cho mục tiêu trước đã nhé.'
    : rewards.value.some(r => r.day < 1 || r.day > totalDays.value)
      ? `Ngày nhận quà phải nằm trong 1 đến ${totalDays.value}.`
      : rewards.value.some(r => !r.title.trim())
        ? 'Có chặng chưa có tên phần quà.'
        : ''
  if (error.value) return
  saving.value = true
  try {
    const goal = await create({
      title: title.value.trim(),
      icon: icon.value,
      totalDays: totalDays.value,
      startDate: startDate.value,
      rewards: rewards.value.map(({ day, title, icon, image }) => ({ day, title, icon, image })),
    })
    confettiBurst()
    toast(`Bắt đầu hành trình ${goal.totalDays} ngày!`, { icon: h(Mochi, { pose: 'cheer', size: 28, class: 'text-on-indigo' }) })
    await navigateTo(`/goals/${goal.id}`)
  }
  catch (err) {
    error.value = errorMessage(err, 'Không tạo được mục tiêu')
  }
  finally {
    saving.value = false
  }
}

const chip = 'h-[38px] min-w-[38px] rounded-lg border border-line bg-surface px-2.5 text-indigo font-medium transition-colors'
const chipOn = 'border-indigo bg-primary text-primary-foreground'
/** Picker / chip classes, swapping to the solid indigo state when `on`. */
const pick = (base: string, on: boolean) => cn(base, on && chipOn)
</script>

<template>
  <div>
    <div class="sticky top-0 z-10 -mx-[22px] flex items-center justify-between bg-gradient-to-b from-background from-75% to-transparent px-[22px] pt-3.5 pb-2.5 md:top-[58px] md:-mx-6 md:px-6">
      <Button as-child variant="ghost" size="icon" class="text-indigo md:w-auto md:gap-1.5 md:pr-2.5 md:pl-1.5 md:text-[12.5px]" aria-label="Huỷ">
        <NuxtLink to="/"><Icon name="hugeicons:arrow-left-01" class="size-5" /><span class="hidden md:inline">tất cả mục tiêu</span></NuxtLink>
      </Button>
      <Badge variant="solid" class="md:absolute md:left-1/2 md:-translate-x-1/2">mục tiêu mới</Badge>
      <span class="w-9" />
    </div>

    <div class="mx-auto max-w-[560px]">
      <div class="flex items-center justify-center gap-2.5 pt-1 pb-5">
        <Mochi pose="gift" :size="60" />
        <TypographyLead>chọn số ngày và tự đặt<br>quà cho từng chặng.<span class="hidden md:inline"><br>đặt chặng nhỏ ở ngày 3 và 7 để có động lực sớm.</span></TypographyLead>
      </div>

      <form novalidate @submit.prevent="submit">
        <div class="mb-[22px]">
          <Label for="c-title" class="mb-2 block"><TypographyH3 as="span">Bạn muốn duy trì điều gì?</TypographyH3></Label>
          <Input id="c-title" v-model="title" placeholder="VD: Học tiếng Anh mỗi ngày" maxlength="80" />
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">Biểu tượng</TypographyH3>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="ic in GOAL_ICONS"
              :key="ic"
              type="button"
              :class="pick('grid size-[42px] place-items-center rounded-lg border border-line bg-surface text-indigo transition-colors', icon === ic)"
              :aria-pressed="icon === ic"
              :aria-label="ic"
              @click="icon = ic"
            >
              <Icon :name="`hugeicons:${ic}`" class="size-[22px]" />
            </button>
          </div>
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">Trong bao nhiêu ngày?</TypographyH3>
          <div class="flex flex-wrap items-center gap-1.5">
            <button v-for="n in presets" :key="n" type="button" :class="pick(chip, totalDays === n)" @click="setDays(n)">{{ n }}</button>
            <div class="ml-auto flex items-center gap-1.5">
              <button type="button" :class="chip" aria-label="Bớt 1 ngày" @click="setDays(totalDays - 1)"><Icon name="hugeicons:minus-sign" class="size-4" /></button>
              <output class="min-w-[42px] text-center text-[18px] font-semibold text-indigo tabular-nums">{{ totalDays }}</output>
              <button type="button" :class="chip" aria-label="Thêm 1 ngày" @click="setDays(totalDays + 1)"><Icon name="hugeicons:add-01" class="size-4" /></button>
            </div>
          </div>
        </div>

        <div class="mb-[22px]">
          <Label for="c-start" class="mb-2 block"><TypographyH3 as="span">Bắt đầu từ</TypographyH3></Label>
          <Input id="c-start" v-model="startDate" type="date" />
        </div>

        <div class="mb-[22px]">
          <TypographyH3 class="mb-2">Phần thưởng theo chặng</TypographyH3>
          <TypographyMuted class="-mt-1 mb-2.5">Bấm vào ô hình bên trái để chọn icon hoặc tải ảnh món quà bạn thích.</TypographyMuted>

          <template v-for="r in rewards" :key="r.key">
            <div class="mb-2 flex items-center gap-2">
              <Input v-model.number="r.day" type="number" min="1" :max="totalDays" class="w-[62px] shrink-0 px-1 text-center" aria-label="Ngày nhận quà" />
              <button
                type="button"
                class="relative grid size-[42px] shrink-0 place-items-center rounded-lg border bg-surface text-indigo"
                :class="pickerFor === r.key ? 'border-indigo' : 'border-line'"
                aria-label="Đổi hình phần quà"
                @click="pickerFor = pickerFor === r.key ? null : r.key"
              >
                <span class="grid size-full place-items-center overflow-hidden rounded-[7px]"><RewardBadge :reward="r" icon-class="size-[22px]" /></span>
                <span class="absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                  <Icon name="hugeicons:camera-01" class="size-3" />
                </span>
              </button>
              <Input v-model="r.title" placeholder="Phần quà..." class="min-w-0 flex-1" maxlength="60" aria-label="Tên phần quà" />
              <Button type="button" variant="ghost" size="icon" aria-label="Xoá chặng" @click="removeReward(r.key)">
                <Icon name="hugeicons:cancel-01" />
              </Button>
            </div>

            <div v-if="pickerFor === r.key" class="-mt-0.5 mb-2.5 flex flex-col gap-2 rounded-lg border border-line bg-surface p-2.5" role="group" aria-label="Chọn hình cho phần quà">
              <TypographyMuted as="span" class="text-[11.5px]">Ảnh của bạn</TypographyMuted>
              <div class="flex flex-wrap items-center gap-2">
                <img v-if="r.image" :src="assetUrl(r.image)" alt="Ảnh phần quà" class="size-14 rounded-xl border border-line object-cover">
                <Button as="label" variant="outline" size="sm" class="h-11 cursor-pointer bg-background">
                  <Icon :name="uploading === r.key ? 'hugeicons:loading-03' : r.image ? 'hugeicons:camera-01' : 'hugeicons:image-add-01'" :class="uploading === r.key && 'animate-spin'" />
                  {{ r.image ? 'Đổi ảnh khác' : 'Tải ảnh lên' }}
                  <input type="file" accept="image/*" class="sr-only" @change="onFile(r, $event)">
                </Button>
                <Button v-if="r.image" type="button" variant="outline" size="sm" class="h-11 text-muted-foreground" @click="r.image = null">
                  <Icon name="hugeicons:image-delete-02" /> Bỏ ảnh
                </Button>
              </div>
              <TypographyMuted as="span" class="text-[11.5px]">Hoặc chọn icon</TypographyMuted>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="ic in REWARD_ICONS"
                  :key="ic"
                  type="button"
                  :class="pick('grid size-10 place-items-center rounded-lg border border-line bg-surface text-indigo', !r.image && r.icon === ic)"
                  :aria-label="ic"
                  @click="r.icon = ic; r.image = null; pickerFor = null"
                >
                  <Icon :name="`hugeicons:${ic}`" class="size-5" />
                </button>
              </div>
            </div>
          </template>

          <Button type="button" variant="dashed" class="h-[42px] w-full" @click="addReward">+ Thêm chặng thưởng</Button>

          <!-- reward track preview -->
          <div class="relative mx-1.5 mt-2 h-14" aria-hidden="true">
            <div class="absolute inset-x-0 top-[34px] h-2 rounded-full bg-faint" />
            <div
              v-for="r in track"
              :key="r.key"
              class="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              :style="{ left: `${(r.day / totalDays) * 100}%` }"
            >
              <span class="grid size-7 place-items-center overflow-hidden rounded-full border border-line bg-surface text-indigo">
                <RewardBadge :reward="r" icon-class="size-[15px]" />
              </span>
              <TypographyMuted as="span" class="mt-3 text-[11px]">{{ r.day }}</TypographyMuted>
            </div>
          </div>
        </div>

        <TypographySmall v-if="error" as="p" class="mb-3 rounded-lg border border-indigo px-3 py-2.5 text-indigo" role="alert">{{ error }}</TypographySmall>

        <Button type="submit" size="lg" class="w-full" :disabled="saving">{{ saving ? 'đang gieo mầm…' : 'bắt đầu hành trình' }}</Button>
      </form>
    </div>
  </div>
</template>
