import AppIntents
import SwiftUI
import WidgetKit

/*
 * Home-screen widget (design v53): today's ticks, streak, the last 40 days of
 * the garden and a tick button per goal. The app writes a JSON snapshot into
 * the shared App Group after every change (apps/web/app/utils/widget.ts →
 * WidgetPlugin in AppDelegate.swift); the widget only reads it, except for the
 * tick button, which calls the same API as the app and updates the snapshot.
 */

let appGroup = "group.app.motivation.tinymotivate"
let snapshotKey = "snapshot"

// MARK: - Snapshot

struct Snapshot: Codable {
    struct Goal: Codable {
        var id: String
        var title: String
        var icon: String
        /** Today's day number in the goal (1...totalDays). */
        var day: Int
        var totalDays: Int
        var doneCount: Int
        var done: Bool
        var rewardTitle: String?
        var rewardIn: Int?
    }
    /** One garden day: date, what grows there (seeded by the date) and whether anything was ticked. */
    struct Cell: Codable {
        var d: String
        var i: String
        var done: Bool
    }

    /** Local date (yyyy-mm-dd) the snapshot was written for. */
    var date: String
    var lang: String
    var theme: String
    var accentLight: String
    var accentDark: String
    var apiBase: String
    var token: String?
    var jwt: String?
    /** Running goals. */
    var goals: [Goal]
    /** Days in a row with at least one tick, ending yesterday. */
    var streakBase: Int
    /** today − 39 … today + 31 */
    var garden: [Cell]

    static func load() -> Snapshot? {
        guard let json = UserDefaults(suiteName: appGroup)?.string(forKey: snapshotKey),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(Snapshot.self, from: data)
    }

    func save() {
        guard let data = try? JSONEncoder().encode(self), let json = String(data: data, encoding: .utf8) else { return }
        UserDefaults(suiteName: appGroup)?.set(json, forKey: snapshotKey)
    }

    /** The snapshot moved on to `now` when the app hasn't written one since midnight. */
    func current(_ now: Date = Date()) -> Snapshot {
        let today = isoDate(now)
        guard let from = parseISO(date), let to = parseISO(today) else { return self }
        let shift = Calendar.current.dateComponents([.day], from: from, to: to).day ?? 0
        guard shift > 0 else { return self }
        var next = self
        let tickedThatDay = goals.contains { $0.done }
        next.goals = goals
            .map { var g = $0; g.day += shift; g.done = false; return g }
            .filter { $0.day <= $0.totalDays }
        next.streakBase = shift == 1 && tickedThatDay ? streakBase + 1 : 0
        next.date = today
        return next
    }

    var doneCount: Int { goals.filter(\.done).count }
    var streak: Int { streakBase + (doneCount > 0 ? 1 : 0) }

    var todayCell: Cell? { garden.first { $0.d == date } }

    /** Every day of the current month; today counts as done when any goal is ticked. */
    var month: [Cell] {
        let prefix = String(date.prefix(7))
        return garden.filter { $0.d.hasPrefix(prefix) }.map { c in
            var c = c
            if c.d == date { c.done = doneCount > 0 }
            return c
        }
    }

    /** The reward closest to being unlocked across the running goals. */
    var nextReward: (title: String, days: Int)? {
        goals.compactMap { g -> (String, Int)? in
            guard let t = g.rewardTitle, let n = g.rewardIn, n > 0 else { return nil }
            return (t, n)
        }.min { $0.1 < $1.1 }
    }

    static let sample = Snapshot(
        date: isoDate(Date()), lang: "vi", theme: "system", accentLight: "#1A0DC9", accentDark: "#968EFF",
        apiBase: "", token: nil, jwt: nil,
        goals: [
            Goal(id: "1", title: "Đọc sách 20 phút", icon: "books-01", day: 12, totalDays: 30, doneCount: 10, done: true, rewardTitle: "Cuốn sách mới", rewardIn: 5),
            Goal(id: "2", title: "Chạy bộ buổi sáng", icon: "workout-run", day: 5, totalDays: 21, doneCount: 4, done: false),
            Goal(id: "3", title: "Uống đủ nước", icon: "droplet", day: 3, totalDays: 14, doneCount: 2, done: false),
        ],
        streakBase: 6,
        garden: (0..<71).map { i in
            let d = Calendar.current.date(byAdding: .day, value: i - 39, to: Date())!
            return Cell(d: isoDate(d), i: "p\(i % 55 + 1)", done: i < 39 && i % 3 != 1)
        })
}

func isoDate(_ date: Date) -> String {
    let f = DateFormatter()
    f.calendar = Calendar(identifier: .gregorian)
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "yyyy-MM-dd"
    return f.string(from: date)
}

func parseISO(_ iso: String) -> Date? {
    let f = DateFormatter()
    f.calendar = Calendar(identifier: .gregorian)
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "yyyy-MM-dd"
    return f.date(from: iso)
}

/** dd.mm */
func dotShort(_ iso: String) -> String {
    let p = iso.split(separator: "-")
    return p.count == 3 ? "\(p[2]).\(p[1])" : iso
}

// MARK: - Texts

struct Texts {
    let vi: Bool
    var today: String { vi ? "Hôm nay" : "Today" }
    var done: String { vi ? "xong" : "done" }
    var allDone: String { vi ? "Xong hết rồi :)" : "All done :)" }
    var garden: String { vi ? "Khu vườn của bạn" : "Your garden" }
    var noGoals: String { vi ? "Chưa có mục tiêu nào" : "No goals yet" }
    var openApp: String { vi ? "Mở app để đăng nhập" : "Open the app to sign in" }
    func left(_ n: Int) -> String { vi ? "Còn \(n) mục tiêu" : "\(n) \(n == 1 ? "goal" : "goals") left" }
    func streak(_ n: Int) -> String { vi ? "Chuỗi \(n) ngày" : "\(n)-day streak" }
    func reward(_ n: Int, _ title: String) -> String { vi ? "Còn \(n) ngày nữa tới \(title)" : "\(n) \(n == 1 ? "day" : "days") to \(title)" }
}

// MARK: - Tick intent

/** Tick / untick today for one goal straight from the widget (iOS 17). */
struct ToggleDoneIntent: AppIntent {
    static var title: LocalizedStringResource = "Tick goal"
    static var isDiscoverable = false

    @Parameter(title: "Goal")
    var goalId: String

    init() {}
    init(goalId: String) { self.goalId = goalId }

    func perform() async throws -> some IntentResult {
        guard let before = Snapshot.load()?.current(),
              let i = before.goals.firstIndex(where: { $0.id == goalId }),
              let token = before.token,
              let url = URL(string: "\(before.apiBase)/api/goals/\(goalId)/days/\(before.goals[i].day)") else { return .result() }

        // optimistic, like the app: the widget redraws with the tick at once
        var snap = before
        let done = !snap.goals[i].done
        snap.goals[i].done = done
        snap.goals[i].doneCount += done ? 1 : -1
        if let n = snap.goals[i].rewardIn { snap.goals[i].rewardIn = n + (done ? -1 : 1) }
        snap.save()

        var req = URLRequest(url: url)
        req.httpMethod = "PUT"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        if let jwt = snap.jwt { req.setValue(jwt, forHTTPHeaderField: "X-Auth-Jwt") }
        req.httpBody = try JSONSerialization.data(withJSONObject: ["done": done])
        do {
            let (_, response) = try await URLSession.shared.data(for: req)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                before.save()
                return .result()
            }
            if let fresh = http.value(forHTTPHeaderField: "x-auth-jwt") {
                snap.jwt = fresh
                snap.save()
            }
        } catch {
            before.save()
        }
        return .result()
    }
}

// MARK: - Timeline

struct Entry: TimelineEntry {
    let date: Date
    let snapshot: Snapshot?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry { Entry(date: Date(), snapshot: .sample) }

    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: Date(), snapshot: context.isPreview ? (Snapshot.load()?.current() ?? .sample) : Snapshot.load()?.current()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let now = Date()
        let midnight = Calendar.current.startOfDay(for: Calendar.current.date(byAdding: .day, value: 1, to: now)!)
        // a new day: un-tick everything and move the garden on
        let entries = [
            Entry(date: now, snapshot: Snapshot.load()?.current(now)),
            Entry(date: midnight, snapshot: Snapshot.load()?.current(midnight.addingTimeInterval(1))),
        ]
        completion(Timeline(entries: entries, policy: .after(midnight.addingTimeInterval(60))))
    }
}

// MARK: - Look

extension Color {
    init(hex: String) {
        var v: UInt64 = 0
        Scanner(string: hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))).scanHexInt64(&v)
        self.init(red: Double((v >> 16) & 0xFF) / 255, green: Double((v >> 8) & 0xFF) / 255, blue: Double(v & 0xFF) / 255)
    }
}

struct Palette {
    let ink: Color
    let muted: Color
    let bg: Color

    init(_ snap: Snapshot?, scheme: ColorScheme) {
        let theme = snap?.theme ?? "system"
        let dark = theme == "dark" || (theme == "system" && scheme == .dark)
        ink = Color(hex: dark ? (snap?.accentDark ?? "#968EFF") : (snap?.accentLight ?? "#1A0DC9"))
        muted = ink.opacity(0.62)
        bg = dark ? Color(hex: "#1F1E27") : .white
    }
}

/** Garden / hand-drawn icon from the widget's asset catalog, tinted with the accent. */
struct IconView: View {
    let id: String
    var size: CGFloat
    var body: some View {
        Image(id.range(of: "^p\\d+$", options: .regularExpression) != nil ? "plant-\(id)" : "hand-\(id)")
            .resizable()
            .renderingMode(.template)
            .interpolation(.high)
            .frame(width: size, height: size)
    }
}

let mono = Font.Design.monospaced

struct TickButton: View {
    let goal: Snapshot.Goal
    let p: Palette
    var body: some View {
        Button(intent: ToggleDoneIntent(goalId: goal.id)) {
            ZStack {
                if goal.done {
                    Circle().fill(p.ink)
                    Image(systemName: "checkmark").font(.system(size: 11, weight: .bold)).foregroundStyle(p.bg)
                } else {
                    Circle().strokeBorder(p.ink, style: StrokeStyle(lineWidth: 1.3, dash: [2.6, 2.6]))
                }
            }
            .frame(width: 24, height: 24)
        }
        .buttonStyle(.plain)
    }
}

struct GoalRow: View {
    let goal: Snapshot.Goal
    let p: Palette
    var showCount = true
    var body: some View {
        HStack(spacing: 8) {
            IconView(id: goal.icon, size: 18).foregroundStyle(p.ink)
            Text(goal.title).font(.system(size: 12, weight: .medium, design: mono)).lineLimit(1).truncationMode(.tail)
            Spacer(minLength: 4)
            if showCount { Text("\(goal.doneCount)/\(goal.totalDays)").font(.system(size: 10.5, design: mono)).foregroundStyle(p.muted) }
            TickButton(goal: goal, p: p)
        }
    }
}

struct DashedLine: Shape {
    var vertical = false
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: vertical ? CGPoint(x: rect.midX, y: rect.minY) : CGPoint(x: rect.minX, y: rect.midY))
        path.addLine(to: vertical ? CGPoint(x: rect.midX, y: rect.maxY) : CGPoint(x: rect.maxX, y: rect.midY))
        return path
    }
}

/** Big number + "/M xong". */
struct Count: View {
    let snap: Snapshot
    let t: Texts
    let p: Palette
    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 2) {
            Text("\(snap.doneCount)").font(.system(size: 26, weight: .semibold, design: mono))
            Text("/\(snap.goals.count) \(t.done)").font(.system(size: 11, design: mono)).foregroundStyle(p.muted)
        }
    }
}

// MARK: - Sizes

struct SmallView: View {
    let snap: Snapshot
    let t: Texts
    let p: Palette
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(t.today).font(.system(size: 12, weight: .semibold, design: mono))
                Spacer()
                Text(dotShort(snap.date)).font(.system(size: 10.5, design: mono)).foregroundStyle(p.muted)
            }
            Spacer(minLength: 2)
            IconView(id: snap.doneCount > 0 ? (snap.todayCell?.i ?? "gm-idle") : "gm-idle", size: 52)
                .frame(maxWidth: .infinity)
            Spacer(minLength: 2)
            Count(snap: snap, t: t, p: p)
            let left = snap.goals.count - snap.doneCount
            Text(snap.goals.isEmpty ? t.noGoals : left > 0 ? t.left(left) : t.allDone)
                .font(.system(size: 10.5, design: mono)).foregroundStyle(p.muted).lineLimit(1)
        }
    }
}

struct MediumView: View {
    let snap: Snapshot
    let t: Texts
    let p: Palette
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(t.today).font(.system(size: 12, weight: .semibold, design: mono))
                Text(dotShort(snap.date)).font(.system(size: 10.5, design: mono)).foregroundStyle(p.muted)
                Spacer(minLength: 2)
                IconView(id: snap.doneCount > 0 ? (snap.todayCell?.i ?? "gm-idle") : "gm-idle", size: 44)
                Spacer(minLength: 2)
                Count(snap: snap, t: t, p: p)
                Text(t.streak(snap.streak)).font(.system(size: 10, design: mono)).foregroundStyle(p.muted).lineLimit(1)
            }
            .frame(width: 84, alignment: .leading)
            DashedLine(vertical: true).stroke(p.ink.opacity(0.35), style: StrokeStyle(lineWidth: 1, dash: [3, 3])).frame(width: 1)
            GoalList(snap: snap, t: t, p: p, showCount: false)
        }
    }
}

struct GoalList: View {
    let snap: Snapshot
    let t: Texts
    let p: Palette
    /** done/total next to each goal (only the large widget has room for it) */
    var showCount = true
    var body: some View {
        if snap.goals.isEmpty {
            Text(t.noGoals).font(.system(size: 12, design: mono)).foregroundStyle(p.muted)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            VStack(spacing: 0) {
                ForEach(Array(snap.goals.prefix(3).enumerated()), id: \.element.id) { i, goal in
                    if i > 0 { DashedLine().stroke(p.ink.opacity(0.25), style: StrokeStyle(lineWidth: 1, dash: [3, 3])).frame(height: 1) }
                    GoalRow(goal: goal, p: p, showCount: showCount).frame(maxHeight: .infinity)
                }
            }
            .frame(maxHeight: .infinity)
        }
    }
}

/** The month, 10 square cells per row, odd rows shifted right by a quarter cell (like the app). */
struct GardenGrid: View {
    let cells: [Snapshot.Cell]
    let today: String
    let p: Palette
    var body: some View {
        GeometryReader { geo in
            let cell = min(geo.size.width / 10.25, 28)
            let rows = stride(from: 0, to: cells.count, by: 10).map { Array(cells[$0..<min($0 + 10, cells.count)]) }
            VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(rows.enumerated()), id: \.offset) { r, row in
                    HStack(spacing: 0) {
                        ForEach(row, id: \.d) { c in
                            ZStack {
                                if c.d == today {
                                    RoundedRectangle(cornerRadius: cell * 0.25).strokeBorder(p.ink, lineWidth: 1.3)
                                }
                                if c.done {
                                    IconView(id: c.i, size: cell * 0.86)
                                } else {
                                    Circle().fill(p.ink.opacity(c.d == today ? 1 : c.d > today ? 0.25 : 0.5)).frame(width: c.d == today ? 5 : 3, height: c.d == today ? 5 : 3)
                                }
                            }
                            .frame(width: cell, height: cell)
                        }
                    }
                    .padding(.leading, r % 2 == 1 ? cell / 4 : 0)
                }
            }
            .frame(width: geo.size.width, alignment: .center)
        }
    }
}

struct LargeView: View {
    let snap: Snapshot
    let t: Texts
    let p: Palette
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                IconView(id: "gm-idle", size: 26)
                VStack(alignment: .leading, spacing: 1) {
                    Text(t.garden).font(.system(size: 13, weight: .semibold, design: mono))
                    Text("\(dotShort(snap.date)) · \(snap.doneCount)/\(snap.goals.count) \(t.done)").font(.system(size: 10.5, design: mono)).foregroundStyle(p.muted)
                }
                Spacer()
            }
            GardenGrid(cells: snap.month, today: snap.date, p: p).frame(height: min(28, 300 / 10.25) * 4)
            DashedLine().stroke(p.ink.opacity(0.25), style: StrokeStyle(lineWidth: 1, dash: [3, 3])).frame(height: 1)
            GoalList(snap: snap, t: t, p: p)
            if let r = snap.nextReward {
                Text(t.reward(r.days, r.title)).font(.system(size: 10.5, design: mono)).foregroundStyle(p.muted).lineLimit(1)
            }
        }
    }
}

struct WidgetView: View {
    let entry: Entry
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var scheme

    var body: some View {
        let p = Palette(entry.snapshot, scheme: scheme)
        let t = Texts(vi: (entry.snapshot?.lang ?? "vi") == "vi")
        Group {
            if let snap = entry.snapshot {
                switch family {
                case .systemSmall: SmallView(snap: snap, t: t, p: p)
                case .systemMedium: MediumView(snap: snap, t: t, p: p)
                default: LargeView(snap: snap, t: t, p: p)
                }
            } else {
                VStack(spacing: 8) {
                    IconView(id: "p2", size: 44)
                    Text(t.openApp).font(.system(size: 11, design: mono)).multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .foregroundStyle(p.ink)
        .padding(15)
        .containerBackground(p.bg, for: .widget)
    }
}

// MARK: - Widget

@main
struct TinyMotivateWidgetBundle: WidgetBundle {
    var body: some Widget { TinyMotivateWidget() }
}

struct TinyMotivateWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TinyMotivateWidget", provider: Provider()) { entry in
            WidgetView(entry: entry)
        }
        .configurationDisplayName("Tiny Motivate")
        .description("Mục tiêu hôm nay và khu vườn của bạn.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}
