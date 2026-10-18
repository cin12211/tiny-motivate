<script setup lang="ts">
/**
 * Public privacy policy (used as the App Store "Privacy Policy URL").
 * Vietnamese by default; English when the app language is English or ?lang=en.
 */
definePageMeta({ layout: false })

const route = useRoute()
const { locale } = useI18n()
const en = computed(() => route.query.lang === 'en' || (route.query.lang !== 'vi' && locale.value === 'en'))

useHead({ title: () => (en.value ? 'Privacy policy · Tiny Motivate' : 'Chính sách quyền riêng tư · Tiny Motivate') })

const UPDATED = '18.10.2026'
const CONTACT = 'hello@motivation.app'

interface Section { title: string, body: string[] }

const vi: Section[] = [
  { title: 'Tóm tắt', body: [
    'Tiny Motivate giúp bạn đặt những mục tiêu nhỏ, tick mỗi ngày, viết nhật ký và tự thưởng cho mình. Chúng tôi chỉ lưu những gì cần để app chạy, không bán dữ liệu, không chạy quảng cáo và không theo dõi bạn trên các app hay trang web khác.',
  ] },
  { title: 'Dữ liệu chúng tôi lưu', body: [
    'Tài khoản: tên và email của bạn. Nếu đăng ký bằng email, mật khẩu được lưu dưới dạng đã băm (không ai đọc được mật khẩu gốc). Nếu đăng nhập bằng Google, chúng tôi nhận tên, email và ảnh đại diện từ Google, không nhận mật khẩu Google của bạn.',
    'Nội dung bạn tạo: mục tiêu (tên, biểu tượng, số ngày, ngày bắt đầu), các ngày đã tick, nhật ký, cảm xúc mỗi ngày, phần thưởng và ảnh phần thưởng bạn tải lên.',
    'Cài đặt: màu chủ đạo, logo, giao diện sáng/tối, ngôn ngữ, giờ nhắc nhở.',
    'Phiên đăng nhập: một mã phiên được lưu trên thiết bị của bạn (bộ nhớ của trình duyệt hoặc app) để bạn không phải đăng nhập lại; máy chủ lưu phiên đó kèm địa chỉ IP và thông tin trình duyệt/thiết bị để bảo mật tài khoản.',
    'Chúng tôi không thu thập vị trí, danh bạ, dữ liệu sức khoẻ hay mã quảng cáo, và không dùng công cụ phân tích hay theo dõi của bên thứ ba.',
  ] },
  { title: 'Chúng tôi dùng dữ liệu để làm gì', body: [
    'Chỉ để chạy các tính năng của app: đăng nhập, hiển thị và đồng bộ mục tiêu, khu vườn, nhật ký và phần thưởng giữa web và điện thoại của bạn.',
    'Nhắc nhở hằng ngày được lên lịch ngay trên điện thoại của bạn; chúng tôi không gửi thông báo đẩy từ máy chủ.',
    'Mục tiêu và nhật ký của bạn là riêng tư: người dùng khác không xem được.',
  ] },
  { title: 'Nơi lưu trữ và đơn vị xử lý', body: [
    'Dữ liệu được lưu và xử lý bởi các nhà cung cấp hạ tầng sau, chỉ để vận hành app: Cloudflare (máy chủ web và lưu ảnh phần thưởng trên Cloudflare R2), Neon (cơ sở dữ liệu PostgreSQL, đặt tại Singapore), Upstash (bộ nhớ đệm phiên và dữ liệu để app chạy nhanh hơn), Google (chỉ khi bạn chọn đăng nhập bằng Google).',
    'Dữ liệu được truyền qua kết nối mã hoá (HTTPS).',
  ] },
  { title: 'Chia sẻ dữ liệu', body: [
    'Chúng tôi không bán, cho thuê hay trao đổi dữ liệu của bạn. Chúng tôi chỉ tiết lộ dữ liệu khi pháp luật yêu cầu.',
  ] },
  { title: 'Thời gian lưu và xoá dữ liệu', body: [
    'Dữ liệu được giữ khi tài khoản của bạn còn hoạt động. Khi bạn xoá một mục tiêu, mục tiêu đó cùng các ngày, nhật ký và phần thưởng của nó bị xoá khỏi cơ sở dữ liệu; ảnh phần thưởng đã tải lên được xoá cùng tài khoản.',
    `Để xoá toàn bộ tài khoản và dữ liệu, hãy gửi email tới ${CONTACT} từ địa chỉ email của tài khoản. Chúng tôi sẽ xoá trong vòng 30 ngày và báo lại cho bạn.`,
  ] },
  { title: 'Quyền của bạn', body: [
    'Bạn có thể xem và sửa dữ liệu ngay trong app, yêu cầu bản sao dữ liệu, yêu cầu xoá tài khoản, hoặc hỏi bất cứ điều gì về quyền riêng tư qua email bên dưới.',
  ] },
  { title: 'Trẻ em', body: [
    'Tiny Motivate không dành cho trẻ em dưới 13 tuổi và chúng tôi không cố ý thu thập dữ liệu của trẻ dưới 13 tuổi.',
  ] },
  { title: 'Thay đổi chính sách', body: [
    'Khi chính sách thay đổi, chúng tôi sẽ cập nhật trang này và ngày cập nhật ở đầu trang.',
  ] },
]

const enSections: Section[] = [
  { title: 'Summary', body: [
    'Tiny Motivate helps you set small goals, tick them off every day, keep a journal and reward yourself. We only keep what the app needs to work. We do not sell your data, show ads, or track you across other apps or websites.',
  ] },
  { title: 'What we store', body: [
    'Account: your name and email. If you sign up with email, your password is stored hashed (nobody can read the original). If you sign in with Google, we receive your name, email and profile picture from Google, never your Google password.',
    'Your content: goals (title, icon, length, start date), ticked days, journal entries, daily moods, rewards and the reward photos you upload.',
    'Settings: accent colour, logo, light/dark appearance, language and reminder time.',
    'Sign-in session: a session token kept on your device (browser or app storage) so you stay signed in; the server keeps that session with its IP address and browser/device details to protect your account.',
    'We do not collect location, contacts, health data or advertising identifiers, and we use no third-party analytics or tracking tools.',
  ] },
  { title: 'How we use it', body: [
    'Only to run the app: signing in, showing and syncing your goals, garden, journal and rewards between the web and your phone.',
    'Daily reminders are scheduled on your phone itself; we do not send push notifications from our servers.',
    'Your goals and journal are private; other users cannot see them.',
  ] },
  { title: 'Where it is stored', body: [
    'Your data is stored and processed by these infrastructure providers, only to run the app: Cloudflare (web servers, and reward photos on Cloudflare R2), Neon (PostgreSQL database, in Singapore), Upstash (cache for sessions and data so the app is faster), Google (only if you choose Google sign-in).',
    'Data is sent over encrypted connections (HTTPS).',
  ] },
  { title: 'Sharing', body: [
    'We do not sell, rent or trade your data. We only disclose it when required by law.',
  ] },
  { title: 'Retention and deletion', body: [
    'We keep your data while your account is active. Deleting a goal removes it together with its days, journal entries and rewards from the database; uploaded reward photos are removed together with your account.',
    `To delete your whole account and all its data, email ${CONTACT} from your account's email address. We delete it within 30 days and confirm with you.`,
  ] },
  { title: 'Your rights', body: [
    'You can view and edit your data in the app, ask for a copy of it, ask us to delete your account, or ask anything about privacy at the email below.',
  ] },
  { title: 'Children', body: [
    'Tiny Motivate is not meant for children under 13 and we do not knowingly collect data from children under 13.',
  ] },
  { title: 'Changes', body: [
    'If this policy changes, we will update this page and the date at the top.',
  ] },
]

const sections = computed(() => (en.value ? enSections : vi))
</script>

<template>
  <div class="pv">
    <nav class="pv-nav">
      <NuxtLink to="/landing-page" class="pv-brand"><LogoTile icon="p2" :size="28" /><b>tiny motivate</b></NuxtLink>
      <NuxtLink :to="en ? '/privacy?lang=vi' : '/privacy?lang=en'" class="pv-lang">{{ en ? 'Tiếng Việt' : 'English' }}</NuxtLink>
    </nav>

    <main class="pv-main">
      <Badge class="self-start">{{ en ? 'Privacy' : 'Quyền riêng tư' }}</Badge>
      <h1>{{ en ? 'Privacy policy' : 'Chính sách quyền riêng tư' }}</h1>
      <p class="pv-fine">{{ en ? `Tiny Motivate · last updated ${UPDATED}` : `Tiny Motivate · cập nhật ${UPDATED}` }}</p>

      <section v-for="s in sections" :key="s.title">
        <h2>{{ s.title }}</h2>
        <p v-for="(line, i) in s.body" :key="i">{{ line }}</p>
      </section>

      <section>
        <h2>{{ en ? 'Contact' : 'Liên hệ' }}</h2>
        <p>{{ en ? 'Questions or requests about your data:' : 'Câu hỏi hoặc yêu cầu về dữ liệu của bạn:' }} <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a></p>
      </section>
    </main>

    <footer class="pv-foot">
      <span>© 2026 Tiny Motivate · {{ en ? 'One little sprout a day' : 'Mỗi ngày một mầm nhỏ' }}</span>
      <NuxtLink to="/landing-page">{{ en ? 'Home' : 'Trang chủ' }}</NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.pv { min-height: 100dvh; background: var(--m-bg); color: var(--m-ink); font-size: 13.5px; }
.pv a { color: var(--m-indigo); }
.pv-nav, .pv-main, .pv-foot { max-width: 760px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
.pv-nav { display: flex; align-items: center; justify-content: space-between; padding-top: 18px; padding-bottom: 18px; }
.pv-brand { display: inline-flex; align-items: center; gap: 9px; color: var(--m-indigo); text-decoration: none; }
.pv-brand b { font-weight: 600; font-size: 15px; }
.pv-lang { font-size: 12px; text-decoration: underline dotted; text-underline-offset: 3px; }
.pv-main { display: flex; flex-direction: column; gap: 14px; padding-top: 24px; padding-bottom: 32px; }
.pv h1 { margin: 0; font-size: 30px; line-height: 1.25; font-weight: 500; color: var(--m-indigo); }
.pv h2 { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--m-indigo); }
.pv section { padding-top: 18px; border-top: 1px dashed var(--m-faint); }
.pv section p { margin: 0 0 10px; line-height: 1.75; }
.pv-fine { margin: 0; font-size: 11.5px; color: var(--m-muted); }
.pv-foot { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding-top: 24px; padding-bottom: 36px; font-size: 11.5px; color: var(--m-muted); border-top: 1px dashed var(--m-faint); }
@media (max-width: 720px) {
  .pv-nav, .pv-main, .pv-foot { padding-left: 16px; padding-right: 16px; }
  .pv h1 { font-size: 24px; }
}
</style>
