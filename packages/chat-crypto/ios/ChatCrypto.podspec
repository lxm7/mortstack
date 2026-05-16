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

  # Vendored Clibsodium.xcframework lifted from jedisct1/swift-sodium master.
  # We dropped the swift-sodium Swift wrapper because its last cocoapod
  # release (Sodium 0.9.1, Dec 2020) shipped an xcframework whose simulator
  # slice predated Apple Silicon and broke iOS-sim linking on arm64 Macs.
  # Upstream now ships SPM-only, so we vendor the freshly-built C library
  # (iOS device + iOS-sim arm64/x86_64 slices) and call libsodium C symbols
  # directly from our Swift module.
  s.vendored_frameworks = "Clibsodium.xcframework"

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
    # CocoaPods auto-selects the correct xcframework slice per active SDK and
    # adds the matching Headers/ dir to the header search path. Adding both
    # slices manually here causes "redefinition of module 'Clibsodium'".
  }

  # NOTE: non-recursive on purpose — a `**` glob would walk into
  # Clibsodium.xcframework/.../Headers and copy sodium.h + both slices' module
  # maps into this pod's public headers, triggering "redefinition of module
  # 'Clibsodium'" and missing-subheader errors. Vendored xcframework headers
  # are exposed via the framework itself, not by source_files.
  s.source_files = "*.{h,m,mm,swift,hpp,cpp}"
end
