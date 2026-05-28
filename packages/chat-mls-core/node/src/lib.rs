// Node.js binding for the chat_mls_core MLS engine. Used ONLY by the Vitest
// acceptance harness (tests/acceptance/*.test.ts) — not shipped to mobile.
//
// Class-based surface (one Rust-backed engine per Node instance) so the test
// harness can host N "devices" in one process. The Expo iOS/Android bridges
// keep a process-singleton because mobile only ever has one signed-in user.
//
// Mirror semantics with the engine's UniFFI surface so that MlsClient can
// run identically against either: each method here is a thin shim over the
// same chat_mls_core::MlsEngine impl that the iOS/Android bridges call into.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::sync::Arc;

use chat_mls_core::{ChatMlsError, MlsEngine as RustEngine, ProcessedKind as RustProcessedKind};

fn to_napi(e: ChatMlsError) -> Error {
    Error::new(Status::GenericFailure, format!("{e:?}"))
}

#[napi(object)]
pub struct AddMembersResult {
    pub commit: Buffer,
    pub welcome: Buffer,
}

/// Tagged result of process_message. `kind` discriminates; `plaintext` is set
/// iff kind == "Application". Mirrors the TS ProcessedKind union in
/// ChatMlsCore.types.ts.
#[napi(object)]
pub struct ProcessedKind {
    pub kind: String,
    pub plaintext: Option<Buffer>,
}

#[napi]
pub struct MlsEngine {
    inner: Arc<RustEngine>,
}

#[napi]
impl MlsEngine {
    #[napi(constructor)]
    pub fn new(account_id: String, identity_seed: Buffer) -> Result<Self> {
        let inner =
            RustEngine::new(account_id, identity_seed.to_vec()).map_err(to_napi)?;
        Ok(Self { inner })
    }

    #[napi]
    pub fn account_id(&self) -> String {
        self.inner.account_id()
    }

    #[napi]
    pub fn create_key_package(&self) -> Result<Buffer> {
        self.inner
            .create_key_package()
            .map(Buffer::from)
            .map_err(to_napi)
    }

    #[napi]
    pub fn create_group(&self, group_id: Buffer) -> Result<()> {
        self.inner.create_group(group_id.to_vec()).map_err(to_napi)
    }

    #[napi]
    pub fn add_members(
        &self,
        group_id: Buffer,
        key_packages: Vec<Buffer>,
    ) -> Result<AddMembersResult> {
        let kps: Vec<Vec<u8>> = key_packages.into_iter().map(|b| b.to_vec()).collect();
        let r = self
            .inner
            .add_members(group_id.to_vec(), kps)
            .map_err(to_napi)?;
        Ok(AddMembersResult {
            commit: r.commit.into(),
            welcome: r.welcome.into(),
        })
    }

    #[napi]
    pub fn remove_members_by_accounts(
        &self,
        group_id: Buffer,
        account_ids: Vec<String>,
    ) -> Result<Buffer> {
        self.inner
            .remove_members_by_accounts(group_id.to_vec(), account_ids)
            .map(Buffer::from)
            .map_err(to_napi)
    }

    #[napi]
    pub fn join_from_welcome(&self, welcome_bytes: Buffer) -> Result<Buffer> {
        self.inner
            .join_from_welcome(welcome_bytes.to_vec())
            .map(Buffer::from)
            .map_err(to_napi)
    }

    #[napi]
    pub fn encrypt_app(&self, group_id: Buffer, plaintext: Buffer) -> Result<Buffer> {
        self.inner
            .encrypt_app(group_id.to_vec(), plaintext.to_vec())
            .map(Buffer::from)
            .map_err(to_napi)
    }

    #[napi]
    pub fn process_message(
        &self,
        group_id: Buffer,
        msg_bytes: Buffer,
    ) -> Result<ProcessedKind> {
        let r = self
            .inner
            .process_message(group_id.to_vec(), msg_bytes.to_vec())
            .map_err(to_napi)?;
        // Tag values match the lowercase camelCase used by Swift/Kotlin
        // bridges + the TS ProcessedKind union in ChatMlsCore.types.ts.
        Ok(match r {
            RustProcessedKind::Application { plaintext } => ProcessedKind {
                kind: "application".to_string(),
                plaintext: Some(plaintext.into()),
            },
            RustProcessedKind::CommitApplied => ProcessedKind {
                kind: "commitApplied".to_string(),
                plaintext: None,
            },
            RustProcessedKind::ProposalQueued => ProcessedKind {
                kind: "proposalQueued".to_string(),
                plaintext: None,
            },
        })
    }

    /// u64 epoch cast to u32. Safe through Phase 2+ — 4B epochs/group is
    /// far past any realistic chat lifespan.
    #[napi]
    pub fn current_epoch(&self, group_id: Buffer) -> Result<u32> {
        self.inner
            .current_epoch(group_id.to_vec())
            .map(|n| n as u32)
            .map_err(to_napi)
    }

    #[napi]
    pub fn member_count(&self, group_id: Buffer) -> Result<u32> {
        self.inner.member_count(group_id.to_vec()).map_err(to_napi)
    }

    #[napi]
    pub fn dump_state(&self) -> Result<Buffer> {
        self.inner.dump_state().map(Buffer::from).map_err(to_napi)
    }

    #[napi]
    pub fn load_state(&self, bytes: Buffer) -> Result<()> {
        self.inner.load_state(bytes.to_vec()).map_err(to_napi)
    }
}
