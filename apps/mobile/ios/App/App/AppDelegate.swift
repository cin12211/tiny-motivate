import UIKit
import Capacitor
import WidgetKit
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - App icon switching

/// Root view controller: registers the app's own (local) Capacitor plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppIconPlugin())
        bridge?.registerPluginInstance(WidgetPlugin())
        bridge?.registerPluginInstance(SoundPlugin())
        // iOS edge-swipe back/forward through the SPA's history (pushState entries)
        webView?.allowsBackForwardNavigationGestures = true
        // no vertical scroll bar in the app (design v52)
        webView?.scrollView.showsVerticalScrollIndicator = false
    }
}

/// `AppIcon.setIcon({ name })` from JS. `name` is an alternate icon set in
/// Assets.xcassets (e.g. "AppIcon-p4-inv"); omit it to restore the primary icon.
@objc(AppIconPlugin)
public class AppIconPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppIconPlugin"
    public let jsName = "AppIcon"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setIcon", returnType: CAPPluginReturnPromise)
    ]

    @objc func setIcon(_ call: CAPPluginCall) {
        let name = call.getString("name")
        DispatchQueue.main.async {
            let app = UIApplication.shared
            guard app.supportsAlternateIcons else {
                call.reject("Alternate icons are not supported on this device")
                return
            }
            if app.alternateIconName == name {
                call.resolve()
                return
            }
            app.setAlternateIconName(name) { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve()
                }
            }
        }
    }
}

// MARK: - Home-screen widget

/// `Widget.save({ json })` from JS (apps/web/app/utils/widget.ts): stores the
/// widget snapshot in the shared App Group and redraws the widgets.
@objc(WidgetPlugin)
public class WidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetPlugin"
    public let jsName = "Widget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "save", returnType: CAPPluginReturnPromise)
    ]
    private let defaults = UserDefaults(suiteName: "group.app.motivation.tinymotivate")

    @objc func save(_ call: CAPPluginCall) {
        let json = call.getString("json")
        if let json = json { defaults?.set(json, forKey: "snapshot") } else { defaults?.removeObject(forKey: "snapshot") }
        if #available(iOS 14.0, *) { WidgetCenter.shared.reloadAllTimelines() }
        call.resolve()
    }
}

// MARK: - Sounds

/// `Sound.play({ name })` from JS (apps/web/app/utils/sound.ts): plays a short
/// bundled sound (e.g. "germi_done.caf"). The audio session is `.ambient`
/// mixed with others, so the silent switch mutes it and music keeps playing.
@objc(SoundPlugin)
public class SoundPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SoundPlugin"
    public let jsName = "Sound"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise)
    ]
    private var players: [String: AVAudioPlayer] = [:]

    @objc func play(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("Missing sound name")
            return
        }
        DispatchQueue.main.async {
            do {
                try AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
                try AVAudioSession.sharedInstance().setActive(true)
                let player: AVAudioPlayer
                if let cached = self.players[name] {
                    player = cached
                } else {
                    guard let url = Bundle.main.url(forResource: name, withExtension: nil) else {
                        call.reject("Sound not found: \(name)")
                        return
                    }
                    player = try AVAudioPlayer(contentsOf: url)
                    player.prepareToPlay()
                    self.players[name] = player
                }
                player.currentTime = 0
                player.play()
                call.resolve()
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }
}
