<script setup lang="ts">
/**
 * Mochi — the Motivation mascot: a round pastel kawaii ant with heart antennae.
 * Poses: neutral, happy (cheering), waving, gift (holding a present), sleepy.
 */
export type MochiPose = 'neutral' | 'happy' | 'waving' | 'gift' | 'sleepy'

const props = withDefaults(defineProps<{ pose?: MochiPose, size?: number | string, float?: boolean }>(), {
  pose: 'neutral',
  size: 120,
  float: false,
})

const B = '#FFC2B0'
const D = '#F59C85'
const P = '#FF7FA0'
const INK = '#3C3C3C'

const heart = (x: number, y: number) =>
  `M${x} ${y + 5} C${x - 9} ${y - 2} ${x - 5} ${y - 10} ${x} ${y - 5} C${x + 5} ${y - 10} ${x + 9} ${y - 2} ${x} ${y + 5}Z`

const eyesClosedHappy = computed(() => props.pose === 'happy' || props.pose === 'gift')
const label = computed(() => ({
  neutral: 'Mochi',
  happy: 'Mochi đang vui',
  waving: 'Mochi vẫy tay',
  gift: 'Mochi cầm quà',
  sleepy: 'Mochi buồn ngủ',
}[props.pose]))
</script>

<template>
  <svg
    viewBox="0 0 200 200"
    role="img"
    :aria-label="label"
    :width="size"
    :height="size"
    :class="{ 'animate-float': float }"
  >
    <ellipse cx="104" cy="190" rx="62" ry="6" fill="rgba(0,0,0,.08)" />
    <!-- abdomen -->
    <ellipse cx="160" cy="150" rx="30" ry="26" :fill="D" />
    <!-- legs -->
    <path d="M70 176 v8 M100 180 v8 M130 176 v8" :stroke="D" stroke-width="9" stroke-linecap="round" />
    <!-- antennae -->
    <path d="M82 62 Q76 36 62 32 M118 62 Q124 36 138 32" :stroke="D" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="heart(60, 32)" :fill="P" />
    <path :d="heart(140, 32)" :fill="P" />

    <!-- arms behind body -->
    <path v-if="pose === 'happy'" d="M34 128 L14 104 M166 128 L186 104" :stroke="D" stroke-width="9" stroke-linecap="round" />

    <!-- head/body blob -->
    <path d="M30 128 C30 74 62 56 100 56 C138 56 170 74 170 128 C170 168 140 182 100 182 C60 182 30 168 30 128Z" :fill="B" />
    <ellipse cx="72" cy="80" rx="18" ry="9" fill="#fff" opacity=".45" transform="rotate(-20 72 80)" />

    <!-- waving arm (in front of body) -->
    <g v-if="pose === 'waving'">
      <path d="M166 124 L188 92" :stroke="D" stroke-width="9" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0 166 124;-14 166 124;0 166 124" dur="0.9s" repeatCount="indefinite" />
      </path>
    </g>

    <!-- eyes -->
    <path v-if="eyesClosedHappy" d="M68 112 Q76 102 84 112 M116 112 Q124 102 132 112" :stroke="INK" stroke-width="5" fill="none" stroke-linecap="round" />
    <path v-else-if="pose === 'sleepy'" d="M68 112 H84 M116 112 H132" :stroke="INK" stroke-width="5" stroke-linecap="round" />
    <g v-else>
      <circle cx="76" cy="110" r="8" :fill="INK" />
      <circle cx="124" cy="110" r="8" :fill="INK" />
      <circle cx="79" cy="107" r="2.6" fill="#fff" />
      <circle cx="127" cy="107" r="2.6" fill="#fff" />
    </g>

    <!-- cheeks -->
    <ellipse cx="58" cy="128" rx="13" ry="8" :fill="P" opacity=".55" />
    <ellipse cx="142" cy="128" rx="13" ry="8" :fill="P" opacity=".55" />

    <!-- mouth -->
    <path v-if="pose === 'happy' || pose === 'gift' || pose === 'waving'" d="M90 124 Q100 140 110 124Z" fill="#B5423A" />
    <path v-else-if="pose === 'sleepy'" d="M93 130 Q100 125 107 130" :stroke="INK" stroke-width="4" fill="none" stroke-linecap="round" />
    <path v-else d="M90 124 q5 6 10 0 q5 6 10 0" :stroke="INK" stroke-width="4" fill="none" stroke-linecap="round" />

    <!-- extras -->
    <template v-if="pose === 'happy'">
      <path :d="heart(22, 72)" :fill="P" />
      <path :d="heart(178, 80)" :fill="P" />
    </template>
    <g v-if="pose === 'gift'">
      <!-- present held in front -->
      <rect x="70" y="140" width="60" height="44" rx="8" fill="#FFC800" />
      <rect x="64" y="132" width="72" height="16" rx="6" fill="#FFD84D" />
      <rect x="94" y="132" width="12" height="52" fill="#FF4B4B" />
      <path d="M100 132 C88 116 76 122 84 132 M100 132 C112 116 124 122 116 132" stroke="#FF4B4B" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M58 150 L70 156 M142 150 L130 156" :stroke="D" stroke-width="9" stroke-linecap="round" />
    </g>
    <g v-if="pose === 'sleepy'" fill="#8FA3AD" font-family="Nunito, sans-serif" font-weight="900">
      <text x="150" y="56" font-size="22">z</text>
      <text x="164" y="40" font-size="15">z</text>
    </g>
  </svg>
</template>
