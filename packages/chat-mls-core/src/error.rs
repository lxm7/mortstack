// Single-variant error type — every fallible engine method maps its internal
// error to ChatMlsError::Internal(<context>). UniFFI lowers this to a Swift
// `enum ChatMlsError: Error` + Kotlin `sealed class ChatMlsError : Exception`.
//
// Why one variant: typed variants are useful when callers branch on the error
// kind (retry vs surface to user). In the M3.5 flow the caller's only option
// on most failures is "log + surface generic error" — typed variants add API
// surface without changing caller behaviour. Promoting specific kinds is
// cheap when a real branching consumer appears.

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum ChatMlsError {
    #[error("{0}")]
    Internal(String),
}

impl ChatMlsError {
    pub fn ctx<E: std::fmt::Display>(label: &str, e: E) -> Self {
        Self::Internal(format!("{label}: {e}"))
    }
}
