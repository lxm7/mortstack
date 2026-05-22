require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ChatCrypto'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = 'UNLICENSED'
  s.author         = 'Sessions'
  s.homepage       = 'https://sessions.io'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Vendored xcframeworks:
  #   Clibsodium.xcframework — libsodium primitives (M3 MVP crypto). Lifted
  #     from jedisct1/swift-sodium master; the cocoapod release (0.9.1) shipped
  #     a stale sim slice that broke arm64-Mac linking, and upstream now ships
  #     SPM-only.
  #   SignalFfi.xcframework — libsignal Rust FFI (M3.5 Signal Protocol),
  #     produced by packages/chat-crypto/scripts/build-libsignal.sh ios. The
  #     upstream Swift wrappers live alongside under LibSignalClient/ and
  #     compile into this pod's Swift module (`import SignalFfi` resolves to
  #     this xcframework). Doing it this way avoids SPM-in-Pods edge cases
  #     under static linking — see chunk 1A rework notes.
  #
  # Naming convention: xcframework filename MUST match the inner
  # .framework basename (both `SignalFfi`). CocoaPods derives the
  # `-framework <name>` link flag from the xcframework filename without
  # extension. A mismatch (e.g. `signal_ffi.xcframework` containing
  # `SignalFfi.framework`) produces a "framework 'signal_ffi' not found"
  # linker error.
  s.vendored_frameworks = ["Clibsodium.xcframework", "SignalFfi.xcframework"]

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
    # CocoaPods auto-selects the correct xcframework slice per active SDK and
    # adds the matching Headers/ dir to the header search path. Adding slices
    # manually here causes redefinition errors.
  }

  # Top-level glob is non-recursive on purpose — a `**` glob would walk into
  # vendored xcframeworks' Headers and trigger module redefinition errors. The
  # second glob picks up the libsignal Swift wrappers we vendor under
  # LibSignalClient/ (recursive — that dir has subfolders by feature, and is
  # outside any xcframework so the wildcard is safe).
  s.source_files = ["*.{h,m,mm,swift,hpp,cpp}", "LibSignalClient/**/*.swift"]
end
