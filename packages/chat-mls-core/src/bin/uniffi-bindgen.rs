// Thin entrypoint for the UniFFI bindgen CLI. Called by scripts/build-mls.sh
// to emit Swift + Kotlin sources from the built cdylib. No app logic here —
// UniFFI provides the implementation via uniffi_bindgen_main().
fn main() {
    uniffi::uniffi_bindgen_main()
}
