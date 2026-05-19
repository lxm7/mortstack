// @ts-check
const { createHash } = require("node:crypto");
const { withXcodeProject } = require("@expo/config-plugins");

// Adds libsignal as a Swift Package Manager dependency to the iOS Xcode
// project during `expo prebuild`. Used by @repo/chat-crypto's ChatCryptoModule
// to import the LibSignalClient Swift API (PQXDH bundle generation, ratchet
// encrypt/decrypt). The Android side is vendored separately as an AAR — see
// packages/chat-crypto/scripts/build-libsignal.sh.
//
// Why a plugin (not a vendored xcframework like libsodium):
//   - libsignal's intended consumption model is SPM; their build_ffi.sh is
//     not designed to produce a redistributable xcframework.
//   - SPM resolves transitive deps (SwiftProtobuf, swift-collections) without
//     us re-vendoring them.
//   - Version bumps = bump `DEFAULT_VERSION` here, no rebuild step.
//
// Why .js not .ts: Expo prebuild loads plugins in Node without TS transpile.
// Keeping this file plain JS avoids needing a build step for prebuild to run.
//
// Idempotency: UUIDs are derived from a SHA-256 of the package URL so re-runs
// of `expo prebuild` don't accumulate duplicate entries.

const DEFAULT_URL = "https://github.com/signalapp/libsignal";
const DEFAULT_VERSION = "0.94.1";
const DEFAULT_PRODUCT = "LibSignalClient";

/**
 * @param {string} seed
 * @returns {string} 24-char uppercase hex — pbxproj UUID format
 */
function pbxUuid(seed) {
  return createHash("sha256")
    .update(seed)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();
}

/**
 * Expo config plugin signature.
 *
 * @param {import("@expo/config-plugins").ExpoConfig} config
 * @param {{ url?: string, pinVersion?: string, productName?: string } | void} [options]
 */
const withLibSignalSpm = (config, options) => {
  const url = (options && options.url) || DEFAULT_URL;
  const pinVersion = (options && options.pinVersion) || DEFAULT_VERSION;
  const productName = (options && options.productName) || DEFAULT_PRODUCT;

  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const objects = project.hash.project.objects;

    const packageRefUuid = pbxUuid(`libsignal-package-ref:${url}`);
    const productDepUuid = pbxUuid(
      `libsignal-product-dep:${url}:${productName}`,
    );
    const buildFileUuid = pbxUuid(`libsignal-build-file:${url}:${productName}`);

    // 1. XCRemoteSwiftPackageReference — the package source declaration
    objects.XCRemoteSwiftPackageReference =
      objects.XCRemoteSwiftPackageReference || {};
    if (!objects.XCRemoteSwiftPackageReference[packageRefUuid]) {
      objects.XCRemoteSwiftPackageReference[packageRefUuid] = {
        isa: "XCRemoteSwiftPackageReference",
        repositoryURL: `"${url}"`,
        requirement: {
          kind: "exactVersion",
          version: pinVersion,
        },
      };
      objects.XCRemoteSwiftPackageReference[`${packageRefUuid}_comment`] =
        `XCRemoteSwiftPackageReference "libsignal"`;
    }

    // 2. XCSwiftPackageProductDependency — the specific product to link
    objects.XCSwiftPackageProductDependency =
      objects.XCSwiftPackageProductDependency || {};
    if (!objects.XCSwiftPackageProductDependency[productDepUuid]) {
      objects.XCSwiftPackageProductDependency[productDepUuid] = {
        isa: "XCSwiftPackageProductDependency",
        package: packageRefUuid,
        package_comment: `XCRemoteSwiftPackageReference "libsignal"`,
        productName,
      };
      objects.XCSwiftPackageProductDependency[`${productDepUuid}_comment`] =
        productName;
    }

    // 3. Attach the package reference to the PBXProject node
    const pbxProjectSection = objects.PBXProject;
    for (const key of Object.keys(pbxProjectSection)) {
      if (key.endsWith("_comment")) continue;
      const proj = pbxProjectSection[key];
      proj.packageReferences = proj.packageReferences || [];
      const already = proj.packageReferences.some(
        (r) => r.value === packageRefUuid,
      );
      if (!already) {
        proj.packageReferences.push({
          value: packageRefUuid,
          comment: `XCRemoteSwiftPackageReference "libsignal"`,
        });
      }
    }

    // 4. Attach the product dependency to the main app target
    const target = project.getFirstTarget();
    const nativeTargets = objects.PBXNativeTarget;
    const targetNode = nativeTargets[target.uuid];
    targetNode.packageProductDependencies =
      targetNode.packageProductDependencies || [];
    const alreadyDep = targetNode.packageProductDependencies.some(
      (d) => d.value === productDepUuid,
    );
    if (!alreadyDep) {
      targetNode.packageProductDependencies.push({
        value: productDepUuid,
        comment: productName,
      });
    }

    // 5. PBXBuildFile that links the SPM product into the Frameworks build
    //    phase, so the linker actually pulls in LibSignalClient at link time.
    objects.PBXBuildFile = objects.PBXBuildFile || {};
    if (!objects.PBXBuildFile[buildFileUuid]) {
      objects.PBXBuildFile[buildFileUuid] = {
        isa: "PBXBuildFile",
        productRef: productDepUuid,
        productRef_comment: productName,
      };
      objects.PBXBuildFile[`${buildFileUuid}_comment`] =
        `${productName} in Frameworks`;
    }
    const frameworksPhase = project.pbxFrameworksBuildPhaseObj(target.uuid);
    const alreadyInPhase = frameworksPhase.files.some(
      (f) => f.value === buildFileUuid,
    );
    if (!alreadyInPhase) {
      frameworksPhase.files.push({
        value: buildFileUuid,
        comment: `${productName} in Frameworks`,
      });
    }

    return cfg;
  });
};

module.exports = withLibSignalSpm;
module.exports.default = withLibSignalSpm;
