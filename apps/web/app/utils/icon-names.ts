/**
 * Every Hugeicons name the app can render. Most are chosen at runtime
 * (goal / reward pickers, journal toolbar), so nuxt.config bundles this list
 * into the client — icons then work offline inside the Capacitor app.
 */

/** Goal icons offered on the create screen. */
export const GOAL_ICONS = ['plant-01', 'books-01', 'workout-run', 'yoga-01', 'droplet', 'guitar', 'quill-write-01', 'salad']

/** Reward icons offered in the picker. */
export const REWARD_ICONS = [
  'gift', 'bubble-tea-01', 'restaurant-01', 'ice-cream-01', 'film-roll-01', 'lantern', 'airplane-01', 'tablet-01',
  'running-shoes', 'game-controller-03', 'bathtub-01', 'shopping-bag-01', 'socks', 'noodles', 'popcorn', 'music-note-01', 'ticket-01',
]

/** Icons used directly in templates or seed data. */
const UI_ICONS = [
  'add-01', 'add-circle', 'alert-02', 'apple', 'arrow-left-01', 'arrow-right-01', 'camera-01', 'cancel-01', 'cancel-circle',
  'checkmark-circle-02', 'delete-02', 'favourite', 'flower', 'google', 'grid-view', 'image-add-01', 'image-delete-02',
  'information-circle', 'loading-03', 'lock-password', 'logout-03', 'mail-01', 'minus-sign', 'user', 'view', 'view-off',
  'text-bold', 'text-italic', 'text-underline', 'left-to-right-list-bullet', 'soft-drink-01',
]

export const ALL_ICONS = [...new Set([...GOAL_ICONS, ...REWARD_ICONS, ...UI_ICONS])].map(n => `hugeicons:${n}`)
