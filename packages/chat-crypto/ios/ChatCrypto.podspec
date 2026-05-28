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

  # Vendored xcframework:
  #   Clibsodium.xcframework — libsodium primitives (M3 MVP crypto). Lifted
  #     from jedisct1/swift-sodium master; the cocoapod release (0.9.1) shipped
  #     a stale sim slice that broke arm64-Mac linking, and upstream now ships
  #     SPM-only.
  #
  # MLS (RFC 9420) lives in the separate @repo/chat-mls-core pod — see
  # ADR-015 for the libsignal rejection that drove the split.
  s.vendored_frameworks = ["Clibsodium.xcframework"]

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  # Top-level glob is non-recursive on purpose — a `**` glob would walk into
  # the vendored xcframework's Headers and trigger module redefinition errors.
  s.source_files = "*.{h,m,mm,swift,hpp,cpp}"
end
