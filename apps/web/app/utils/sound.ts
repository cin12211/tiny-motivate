import { Capacitor, registerPlugin } from '@capacitor/core'

/** Native plugin defined in apps/mobile/ios/App/App/AppDelegate.swift. */
const Sound = registerPlugin<{ play: (opts: { name: string }) => Promise<void> }>('Sound')

let ctx: AudioContext | null = null
let doneBuffer: Promise<AudioBuffer> | null = null

/**
 * "Tách ding" when today's goal is ticked done. In the iOS app it plays
 * natively with an ambient audio session, so the silent switch mutes it (a web
 * <audio> element in the WebView would ignore the switch). On the web it uses
 * Web Audio, decoding the file once and reusing it.
 */
export function playDoneSound() {
  if (import.meta.server) return
  if (Capacitor.getPlatform() === 'ios') {
    Sound.play({ name: 'germi_done.caf' }).catch(() => {})
    return
  }
  if (Capacitor.isNativePlatform()) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    doneBuffer ??= fetch('/sounds/germi_done.mp3')
      .then(r => r.arrayBuffer())
      .then(data => ctx!.decodeAudioData(data))
    doneBuffer.then((buffer) => {
      const source = ctx!.createBufferSource()
      source.buffer = buffer
      source.connect(ctx!.destination)
      source.start()
    }).catch(() => { doneBuffer = null })
  }
  catch {}
}
