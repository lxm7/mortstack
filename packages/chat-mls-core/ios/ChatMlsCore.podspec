require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ChatMlsCore'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = 'MIT'
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
  #   chat_mls_coreFFI.xcframework — Rust OpenMLS engine + UniFFI FFI
  #     symbols, produced by scripts/build-mls.sh ios. Naming convention:
  #     the xcframework filename + inner .framework basename + binary name
  #     + Clang module-map name MUST all be `chat_mls_coreFFI` (no PascalCase,
  #     suffix matches what UniFFI hardcodes into the generated Swift's
  #     `#if canImport(chat_mls_coreFFI)` line). A mismatch surfaces as
  #     "cannot find type 'RustBuffer' in scope" + ~20 sibling errors.
  #
  # The pod's main Swift module is still `ChatMlsCore` (the Expo Module name
  # JS uses). The vendored Swift bindings under Sources/ compile into THAT
  # module and import the FFI shim above via canImport.
  s.vendored_frameworks = ["chat_mls_coreFFI.xcframework"]

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  # Top-level glob is non-recursive on purpose — a `**` glob walks into the
  # vendored xcframework's Headers and triggers module redefinition errors.
  # The Sources/ glob picks up the UniFFI-generated Swift bindings (one file
  # per crate at v0.31.1; recursive in case future crates split it).
  s.source_files = ["*.{h,m,mm,swift,hpp,cpp}", "Sources/**/*.swift"]
end
