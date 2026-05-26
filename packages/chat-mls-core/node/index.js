// Single-platform loader (macOS arm64 / x86_64) for the chat_mls_core_node
// napi binding. Multi-platform CI distribution is post-Phase-1 — when needed,
// swap this for the standard @napi-rs/cli platform-suffixed loader.
module.exports = require("./index.node");
