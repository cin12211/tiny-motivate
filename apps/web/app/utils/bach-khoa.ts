import { FARM_ICONS, MOODS, PLANTS, PRO_PLANTS, TIP_PLANT, growIconForGoal } from '@motivation/garden'
import type { Goal } from '#shared/types'
import { addDays } from '#shared/utils/dates'

/**
 * Bách khoa (design v66–v66f): Germi's plant book. 7 chapters, 141 species:
 * the 75 everyday plants (in 4 chapters), the 5 mood flowers, the 40 garden &
 * farm icons, and the 20 Pro plants + the milk-tea plant. A species is "sown"
 * (unlocked) once it has grown at least once; it never locks again.
 */

export type BkKind = 'plant' | 'mood' | 'farm' | 'pro' | 'tip'
export interface BkItem {
  /** icon id: "p4", "m2", "g-shovel"… */
  id: string
  /** chapter index 0..6 */
  c: number
  kind: BkKind
  name: string
  desc: string
  /** what Germi says about it once sown */
  line: string
  /** running number in the whole book (1..141) */
  no: number
}
export interface BkChapter { name: string, sub: string, items: BkItem[] }

/** everyday plant index k (1..75) → icon id: k ≤ 55 is p{k}, else p{k+21} (p77..p96) */
const plantId = (k: number) => `p${k <= 55 ? k : k + 21}`

const CHAPTERS: Array<[string, string, number[] | 'mood' | 'farm' | 'pro']> = [
  ['hoa', 'những bông hoa trong vườn', [4, 5, 6, 13, 14, 21, 23, 24, 25, 28, 29, 31, 36, 41, 45, 49, 56, 59, 61, 64, 68, 72]],
  ['rau, củ & trái', 'những thứ ăn được', [10, 16, 18, 19, 30, 34, 35, 37, 43, 47, 48, 57, 58, 60, 62, 63, 66, 67, 69, 73, 74]],
  ['cây chậu & cây lớn', 'cây trong chậu và cây toả bóng', [8, 9, 15, 17, 22, 27, 32, 38, 39, 44, 50, 65]],
  ['mầm, lá & cỏ', 'những thứ nhỏ xíu mà bền bỉ', [1, 2, 3, 7, 11, 12, 20, 26, 33, 40, 42, 46, 51, 52, 53, 54, 55, 70, 71, 75]],
  ['hoa cảm xúc', 'ép từ nhật ký mỗi ngày', 'mood'],
  ['làm vườn & nông trại', 'dụng cụ, vật nuôi, công trình', 'farm'],
  ['cây của Bạn của Germi', '20 cây Pro và cây trà sữa', 'pro'],
]

/** Germi's line for everyday plant k = 1..75 */
const LINES = ['Ngày đầu tiên luôn là ngày khó nhất. Hạt này nhú lên là bạn đã bắt đầu rồi đó.', 'Hai chiếc lá này giống y như mình. Mình gọi nó là anh em sinh đôi.', 'Cỏ mọc lặng lẽ mà chẳng bao giờ bỏ cuộc. Mình học điều đó từ nó.', 'Sáu cánh tròn xoe như một nụ cười nhỏ. Rảnh là mình ngồi đếm cánh cúc.', 'Tulip lúc nào cũng đứng thẳng lưng. Hôm nào mệt mình nhìn nó để đứng thẳng theo.', 'Đẹp mà có gai, giống những việc khó mà đáng làm.', 'Nấm mọc sau mưa. Hôm nay thấy nặng nề thì biết đâu mai lại mọc nấm.', 'Ít nước vẫn nở được một bông. Ít cũng được, miễn là đều.', 'Một chậu cây nhỏ ở góc bàn làm cả ngày dễ thở hơn.', 'Cây táo cần nhiều năm mới ra quả. Không sao, mình kiên nhẫn được.', 'Chiếc lá vừa xoè ra, còn mỏng mà xanh lắm.', 'Tìm được cỏ ba lá là may. Nhưng bạn tick đều thì đâu cần may nữa.', 'Hướng dương luôn quay về phía mặt trời. Còn mình thì quay về phía bạn.', 'Mùi oải hương giúp ngủ ngon. Tick xong rồi thì nghỉ ngơi nha.', 'Mùa đông lạnh cỡ nào thông vẫn xanh.', 'Thân dừa cong theo gió mà không gãy. Mềm dẻo cũng là một kiểu mạnh mẽ.', 'Cây nhỏ xíu mà sống cả trăm năm, nhờ được chăm từng chút một.', 'Quả dâu nhỏ mà ngọt, giống những ngày bình thường mà vui.', 'Phần ngon nhất của cà rốt nằm dưới đất. Có những tiến bộ mình chưa thấy ngay đâu.', 'Một nấm lớn, một nấm nhỏ. Đi cùng nhau thì đường dài cũng thấy gần.', 'Thổi một cái là hạt bay khắp nơi. Ước gì thói quen tốt cũng lan nhanh như vậy.', 'Tre lớn từng đốt một, mỗi đốt là một chặng.', 'Sen mọc từ bùn mà vẫn thơm. Ngày khó vẫn nở hoa được.', 'Một bụi tròn xum xuê, chắc là được chăm đều tay lắm.', 'Ba chiếc chuông nhỏ, mình tưởng tượng chúng kêu leng keng mỗi lần bạn tick.', 'Cây con cần một cái cọc để dựa. Bạn cũng có thể dựa vào mình.', 'Sen đá chẳng đòi hỏi gì nhiều, chỉ cần chút nắng và chút kiên nhẫn.', 'Anh đào nở rộ rồi rụng nhanh. Ngày đẹp thì cứ tận hưởng.', 'Ba bông chẳng bông nào giống bông nào, đứng chung vẫn đẹp.', 'Dây đậu leo từng vòng quanh cọc, chậm mà chắc.', 'Loa kèn như đang thổi một bản nhạc mừng ngày bạn làm xong.', 'Tròn vo, đầy gai mà trên đỉnh vẫn nở hoa.', 'Lá phong đổi màu theo mùa. Thay đổi cũng đẹp mà.', 'Bắp mọc cao hơn cả mình, mình phải ngửa cổ mới thấy cờ bắp.', 'Hai quả chín đỏ cùng lúc, như hai ngày liền bạn không bỏ.', 'Mỗi chùm là trăm bông nhỏ gom lại, như trăm ngày nhỏ thành một mục tiêu lớn.', 'Lúa càng chín càng cúi đầu. Mình thích sự khiêm tốn đó.', 'Cành liễu rủ xuống mặt hồ, ngồi dưới đó nghỉ một chút cũng được.', 'Dây leo buông xuống từ trên cao, nhìn mát cả mắt.', 'Mọc được từ khe đá thì chuyện gì cũng làm được.', 'Ba bông trong bình, mình cắm để mừng bạn.', 'Cả chùm thân dài đứng sát bên nhau, đông vui ghê.', 'Chậu quất ngày Tết, nhìn là thấy năm mới tới.', 'Nha đam dày lá, mát lành. Mình hay giữ một chậu bên cửa sổ.', 'Hoa ly thơm cả phòng. Một việc nhỏ làm xong cũng thơm cả ngày.', 'Cây sồi khổng lồ nào cũng từng là một hạt nhỏ thế này.', 'Bí ngô lớn chậm mà nặng trĩu. Mình chờ được.', 'Củ cải tròn vo nằm ngủ dưới đất, chờ ngày được nhổ lên.', 'Thuỷ tiên nở đúng dịp. Mọi thứ đều có thời điểm của nó.', 'Dưới tán cây này có xích đu. Ngồi đung đưa một lúc là hết mệt.', 'Bông lau xù trong gió, nhẹ tênh.', 'Bông cỏ rủ xuống như cái đuôi đang vẫy chào bạn.', 'Tám chiếc lá xoè tròn, thấp thôi mà vững.', 'Giữa đám cỏ có một bông hoa. Ngày bình thường cũng có lúc bất ngờ.', 'Cỏ nghiêng theo gió rồi lại đứng lên.', 'Đúng mười giờ là nở, đúng hẹn như giờ nhắc của bạn.', 'Xà lách xoăn giòn tan, ăn kèm gì cũng hợp.', 'Lá bạc hà thơm mát, vò nhẹ là tỉnh cả người.', 'Bìm bìm leo hàng rào, sáng nào cũng mở hoa chào.', 'Bó hành thẳng tắp, nhỏ mà thiếu là nhớ.', 'Hoa súng nổi trên mặt nước, bình thản lắm.', 'Đu đủ lớn nhanh, ra quả từng chùm.', 'Bắp cải cuộn từng lớp lá, như từng ngày bạn gom lại.', 'Bông vạn thọ tròn xù, nhìn là thấy ấm áp.', 'Lá to xẻ rãnh cho gió đi qua, khéo ghê.', 'Củ khoai bỏ quên trong bếp cũng tự nảy mầm. Sức sống thật lạ.', 'Dưa hấu bò dài trên đất, quả to bất ngờ.', 'Mai vàng nở là Tết tới. Mình chúc bạn một năm nhiều cây.', 'Bụi sả thơm, đuổi muỗi giúp cả vườn.', 'Rêu mọc chậm nhất vườn, vậy mà phủ kín cả hòn đá.', 'Tàu dương xỉ non cuộn tròn như dấu hỏi, rồi từ từ duỗi ra.', 'Bông păng-xê có mặt cười, giống mình ghê.', 'Mía càng về gốc càng ngọt. Đoạn cuối của mục tiêu cũng vậy.', 'Vỏ đậu căng tròn hạt, mở ra là đủ một bữa vui.', 'Một chiếc hũ nhỏ nuôi mầm, như góc riêng bạn tự chăm cho mình.']

const MOOD_ORDER = ['m1', 'm3', 'm2', 'm4', 'm5'] as const
const MOOD_LINES: Record<string, string> = { m1: 'Hôm buồn mình vẫn ở đây. Bạn ghi lại được là giỏi lắm rồi.', m3: 'Chán cũng là cảm xúc thật. Mai mình thử làm khác đi một chút nha.', m2: 'Hôm vui mình muốn nhớ mãi, nên mình ép bông này vào sách.', m4: 'Năng lượng đầy ắp! Mình nhảy tưng tưng theo bạn luôn.', m5: 'Ngày đỉnh nhất. Mình cất bông này ở trang đẹp nhất.' }

const FARM: Record<string, [string, string]> = { 'g-shovel': ['xẻng', 'Cái xẻng nhỏ của mình, sáng nào cũng đào lỗ gieo hạt.'], 'g-rake': ['cào', 'Cào cho đất tơi trước khi gieo.'], 'g-hoe': ['cuốc', 'Một nhát cuốc là một luống mới.'], 'g-pitchfork': ['chĩa', 'Chĩa để xốc rơm, nặng mà mình vẫn cố.'], 'g-watering': ['bình tưới', 'Bình tưới của mình, ngày nào cũng dùng.'], 'g-shears': ['kéo tỉa', 'Tỉa bớt cành thừa để cây lớn khoẻ.'], 'g-wheelbarrow': ['xe cút kít', 'Chở đất, chở hạt, có hôm chở cả mình.'], 'g-glove': ['găng tay', 'Đeo găng vào là sẵn sàng làm vườn.'], 'g-strawhat': ['nón rơm', 'Nón rơm che nắng cho mình mấy buổi trưa.'], 'g-seeds': ['túi hạt', 'Mỗi hạt trong túi là một ngày chưa tới.'], 'g-hose': ['vòi nước', 'Vòi nước cuộn tròn, tưới cả vườn một lượt.'], 'g-basket': ['giỏ', 'Giỏ đựng rau vừa hái.'], 'g-crate': ['thùng gỗ', 'Thùng gỗ chất đầy quả, mùa này được mùa.'], 'g-hay': ['đống rơm', 'Đống rơm thơm nắng, nằm lên là ngủ quên.'], 'g-fence': ['hàng rào', 'Hàng rào nhỏ giữ vườn của bạn.'], 'g-windmill': ['cối xay gió', 'Có gió là cối xay quay chầm chậm.'], 'g-barn': ['nhà kho', 'Nhà kho cất đồ làm vườn.'], 'g-tractor': ['máy cày', 'Máy cày chạy ì ạch mà cày được cả cánh đồng.'], 'g-scarecrow': ['bù nhìn', 'Bù nhìn đứng canh vườn, mình với nó là bạn.'], 'g-bucket': ['xô nước', 'Xô nước đầy, xách hơi nặng.'], 'g-chicken': ['gà mái', 'Cô gà mái sáng nào cũng cục tác báo tin.'], 'g-cow': ['bò sữa', 'Bò sữa hiền khô, gặm cỏ cả ngày.'], 'g-pig': ['heo con', 'Heo con thích lăn trong bùn.'], 'g-sheep': ['cừu', 'Cừu lông xù, ôm êm lắm.'], 'g-duck': ['vịt', 'Vịt bơi ngoài ao, kêu quác quác.'], 'g-rabbit': ['thỏ', 'Thỏ hay lẻn vào gặm cà rốt của mình.'], 'g-beehive': ['tổ ong', 'Ong chăm chỉ nhất vườn, mình học theo.'], 'g-eggs': ['ổ trứng', 'Ổ trứng vừa nhặt, còn ấm.'], 'g-horseshoe': ['móng ngựa', 'Treo móng ngựa trước cửa cho may mắn.'], 'g-coop': ['chuồng gà', 'Chuồng gà nhỏ xinh cuối vườn.'], 'g-well': ['giếng', 'Giếng nước mát, kéo lên từng gầu.'], 'g-greenhouse': ['nhà kính', 'Nhà kính giữ ấm cho cây non mùa lạnh.'], 'g-silo': ['kho thóc', 'Kho thóc cao, chứa cả một mùa gặt.'], 'g-birdhouse': ['nhà chim', 'Nhà chim treo trên cây, sáng nào cũng có khách.'], 'g-mailbox': ['hộp thư', 'Hộp thư ở cổng, biết đâu có thư cho bạn.'], 'g-gate': ['cổng vườn', 'Cổng vườn luôn mở chờ bạn về.'], 'g-ladder': ['cái thang', 'Thang để hái quả trên cao.'], 'g-axe': ['cái rìu', 'Rìu chẻ củi sưởi mùa đông.'], 'g-milkcan': ['bình sữa', 'Bình sữa sáng sớm vừa vắt.'], 'g-vegbed': ['luống rau', 'Luống rau thẳng hàng, mình tự trồng đó.'] }

const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const BK_CHAPTERS: BkChapter[] = (() => {
  let no = 0
  const item = (x: Omit<BkItem, 'no'>): BkItem => ({ ...x, no: ++no })
  return CHAPTERS.map(([name, sub, list], c) => {
    let items: BkItem[]
    if (list === 'mood') {
      items = MOOD_ORDER.map((id) => {
        const label = MOODS.find(m => m.id === id)!.label
        return item({ id, c, kind: 'mood', name: label, desc: `hoa cảm xúc “${label}”`, line: MOOD_LINES[id]! })
      })
    }
    else if (list === 'farm') {
      items = FARM_ICONS.map(id => item({ id, c, kind: 'farm', name: FARM[id]![0], desc: 'đồ làm vườn & nông trại', line: FARM[id]![1] }))
    }
    else if (list === 'pro') {
      items = [
        ...PRO_PLANTS.map(p => item({ id: `p${p.id}`, c, kind: 'pro', name: p.name, desc: p.description, line: `${capFirst(p.description)}. Cây này chỉ mọc trong vườn của Bạn của Germi.` })),
        item({ id: `p${TIP_PLANT.id}`, c, kind: 'tip', name: TIP_PLANT.name, desc: TIP_PLANT.description, line: 'Cảm ơn bạn đã mời mình ly trà sữa. Mình trồng hạt trân châu và nó nảy mầm thật nè.' }),
      ]
    }
    else {
      items = list.map((k) => {
        const p = PLANTS.find(x => `p${x.id}` === plantId(k))!
        return item({ id: plantId(k), c, kind: 'plant', name: p.name, desc: p.description, line: LINES[k - 1]! })
      })
    }
    return { name, sub, items }
  })
})()

export const BK_ALL: BkItem[] = BK_CHAPTERS.flatMap(ch => ch.items)
export const BK_TOTAL = BK_ALL.length
export const bkItem = (id: string) => BK_ALL.find(x => x.id === id)

/** What Germi says about a species not sown yet. */
export const BK_HINT: Record<BkKind, string> = {
  plant: 'Hạt này chưa gieo. Cứ tick đều, một ngày nào đó nó sẽ mọc trong vườn bạn.',
  farm: 'Hạt này chưa gieo. Cứ tick đều, một ngày nào đó nó sẽ ghé vườn bạn.',
  mood: 'Chọn cảm xúc này trong nhật ký một ngày nào đó, Germi sẽ ép bông vào trang này.',
  pro: 'Hạt này dành cho Bạn của Germi. Khi có gói, cây Pro mọc vào những ngày ngẫu nhiên trong vườn.',
  tip: 'Hạt này nảy mầm khi bạn mời Germi một ly trà sữa.',
}

export interface BkGrowth { first: string, n: number }

/**
 * Which species have grown, with the first date and how many times, across
 * every goal: an everyday plant or farm icon when a ticked day grew exactly
 * that icon (the k-th tick of a goal grows its k-th icon), a mood flower when
 * that mood was picked in a day's journal. Pro / tip plants have no way to
 * grow yet (no subscription / tip), so they stay unsown.
 */
export function bkGrowth(goals: Goal[]): Map<string, BkGrowth> {
  const m = new Map<string, BkGrowth>()
  const put = (id: string, d: string) => {
    const x = m.get(id)
    if (!x) m.set(id, { first: d, n: 1 })
    else {
      x.n++
      if (d < x.first) x.first = d
    }
  }
  for (const g of goals) {
    let nth = 0
    for (let n = 1; n <= g.totalDays; n++) {
      const e = g.days[String(n)]
      if (!e) continue
      const date = addDays(g.startDate, n - 1)
      if (e.done) put(growIconForGoal(g.id, ++nth), date)
      if (e.mood) put(e.mood, date)
    }
  }
  return m
}
