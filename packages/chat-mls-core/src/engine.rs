// MlsEngine — UniFFI-exported handle holding the OpenMLS provider, the local
// signature keypair, the BasicCredential identifying the account, and a cache
// of joined-group MlsGroup handles keyed by their MLS GroupId.
//
// Storage strategy (Chunk 2 + 2.5):
//   - At runtime, MemoryStorage holds the OpenMLS state (groups, key
//     packages, signature key, encryption keys, etc.).
//   - dump_state() / load_state() serialise / restore the entire
//     MemoryStorage HashMap as opaque bytes — the JS layer persists these
//     to chat-db (already SQLCipher-encrypted via op-sqlite from M2). Caller
//     calls dump_state after any mutating engine method; load_state on
//     engine init if a prior snapshot exists.
//   - Signer keypair is DERIVED DETERMINISTICALLY from the M3 identity seed
//     at every Engine::new call. After load_state restores the storage, the
//     freshly-derived signer's bytes match what's in storage, so existing
//     groups remain operable.
//
// TODO(post-M7/pre-M8 scale work): replace dump_state/load_state with a
// custom StorageProvider impl over rusqlite + bundled-sqlcipher-vendored-
// openssl (Android NDK cross-compile needs the vendored-openssl feature).
// Reason: the whole-blob rewrite of MemoryStorage on every mutation has
// write amplification proportional to (groups × ratchet-tree-size). At
// ≤50 groups per user (typical Phase 1-2) this is negligible (~100-500 KB
// rewrite per send). At 1000+ groups per user (power users at Phase 3
// scale), it becomes 5-20 MB sustained write per second — battery, disk
// wear, and contention with chat-db's other ops all noticeable. The custom
// provider would write only the changed (label, key, value) entries,
// reducing per-mutation writes from O(total state) to O(touched entries).
// Scope: ~500-800 LoC of trait plumbing (openmls_traits 0.5 StorageProvider
// has ~30 typed methods, each one-liner over a kv table); plus the
// bundled-sqlcipher-vendored-openssl Cargo feature for NDK cross-compile.
// See ADR-015 follow-up note + README §M8 watch-item.
//
// Ciphersuite is pinned per ADR-015 §3:
//   MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519 (RFC 9420 mandatory).

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use blake2::digest::consts::U32;
use blake2::{Blake2b, Digest};
use openmls::prelude::*;
use openmls_basic_credential::SignatureKeyPair;
use openmls_rust_crypto::OpenMlsRustCrypto;
use openmls_traits::OpenMlsProvider;
use openmls_traits::types::SignatureScheme;
use tls_codec::{Deserialize as TlsDeserialize, Serialize as TlsSerialize};

use crate::error::ChatMlsError;

const CIPHERSUITE: Ciphersuite = Ciphersuite::MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519;

/// Domain-separation tag for deriving the MLS signer sub-seed from the M3
/// identity seed PLUS the accountId. Bumping the `vN` suffix = a breaking
/// signer-identity rotation; do NOT change without a coordinated migration.
/// Distinct from other tags ("sessions/x25519/v1" etc.) so the derived keys
/// are cryptographically independent of M3's libsodium box keypair.
///
/// v2 bump (2026-05): mix accountId into the BLAKE2b update stream so that
/// multiple accounts on the same install (or two iOS Simulators that share
/// the keychain access group on the same Mac, and therefore the same
/// identity_seed) derive DIFFERENT signers. Without this mix, two accounts
/// sharing one seed produced identical MLS sig keys and OpenMLS rejected
/// the second one as "Duplicate signature key in proposals and group" the
/// moment one tried to add the other as a member.
const MLS_SIGNER_DERIVE_CONTEXT: &[u8] = b"sessions/mls-signer/v2";

/// Outcome of `MlsEngine::add_members` — a Commit to fan out to existing
/// members + a Welcome to send to each new joiner.
#[derive(uniffi::Record)]
pub struct AddMembersResult {
    pub commit: Vec<u8>,
    pub welcome: Vec<u8>,
}

/// Discriminated result of `MlsEngine::process_message`.
#[derive(uniffi::Enum)]
pub enum ProcessedKind {
    Application { plaintext: Vec<u8> },
    CommitApplied,
    ProposalQueued,
}

#[derive(uniffi::Object)]
pub struct MlsEngine {
    /// Account-scoped opaque identifier — bytes go into the BasicCredential.
    account_id: String,

    /// In-memory OpenMLS provider — wraps MemoryStorage + RustCrypto. State
    /// persisted via dump_state() / load_state() to the JS-layer chat-db.
    provider: OpenMlsRustCrypto,

    /// Long-term signature keypair (Ed25519). Derived deterministically from
    /// the M3 identity seed at every Engine::new — survives load_state by
    /// reconstruction, not by storage lookup.
    signer: SignatureKeyPair,

    /// Reusable identity envelope passed to every MLS op that emits a
    /// signed message.
    credential_with_key: CredentialWithKey,

    /// Hot cache of opened groups. Misses fall back to MlsGroup::load against
    /// `provider.storage()`. Cleared on load_state — every subsequent group
    /// op re-loads from storage and the cache fills lazily.
    groups: Mutex<HashMap<Vec<u8>, MlsGroup>>,
}

#[uniffi::export]
impl MlsEngine {
    /// One Engine per account on this install. `identity_seed` is the 32-byte
    /// master seed already persisted in the secure keychain group by M3
    /// (chat-crypto's `loadSeed()`). The MLS signer is derived from this via
    /// BLAKE2b sub-seed under `MLS_SIGNER_DERIVE_CONTEXT` — deterministic, so
    /// across launches the signer's public key is stable.
    ///
    /// The constructor does NOT load any prior snapshot. After construction,
    /// caller invokes `load_state(bytes)` if a snapshot exists in chat-db
    /// for this account; otherwise the engine starts from a fresh
    /// MemoryStorage. Either way, the signer is re-stored into the active
    /// MemoryStorage so OpenMLS internals can look it up.
    #[uniffi::constructor]
    pub fn new(account_id: String, identity_seed: Vec<u8>) -> Result<Arc<Self>, ChatMlsError> {
        let provider = OpenMlsRustCrypto::default();
        let signer = derive_signer(&account_id, &identity_seed)?;
        signer
            .store(provider.storage())
            .map_err(|e| ChatMlsError::ctx("signer.store", e))?;

        let credential = BasicCredential::new(account_id.as_bytes().to_vec());
        let credential_with_key = CredentialWithKey {
            credential: credential.into(),
            signature_key: signer.public().to_vec().into(),
        };

        Ok(Arc::new(Self {
            account_id,
            provider,
            signer,
            credential_with_key,
            groups: Mutex::new(HashMap::new()),
        }))
    }

    pub fn account_id(&self) -> String {
        self.account_id.clone()
    }

    pub fn create_key_package(&self) -> Result<Vec<u8>, ChatMlsError> {
        let kp_bundle = KeyPackage::builder()
            .build(
                CIPHERSUITE,
                &self.provider,
                &self.signer,
                self.credential_with_key.clone(),
            )
            .map_err(|e| ChatMlsError::ctx("KeyPackage::build", e))?;

        kp_bundle
            .key_package()
            .tls_serialize_detached()
            .map_err(|e| ChatMlsError::ctx("kp tls_serialize", e))
    }

    pub fn create_group(&self, group_id: Vec<u8>) -> Result<(), ChatMlsError> {
        let cfg = MlsGroupCreateConfig::builder()
            .ciphersuite(CIPHERSUITE)
            .use_ratchet_tree_extension(true)
            .build();

        let group = MlsGroup::new_with_group_id(
            &self.provider,
            &self.signer,
            &cfg,
            GroupId::from_slice(&group_id),
            self.credential_with_key.clone(),
        )
        .map_err(|e| ChatMlsError::ctx("MlsGroup::new_with_group_id", e))?;

        self.groups_mut()?.insert(group_id, group);
        Ok(())
    }

    pub fn add_members(
        &self,
        group_id: Vec<u8>,
        key_packages: Vec<Vec<u8>>,
    ) -> Result<AddMembersResult, ChatMlsError> {
        let mut parsed: Vec<KeyPackageIn> = Vec::with_capacity(key_packages.len());
        for (i, bytes) in key_packages.into_iter().enumerate() {
            let kp = KeyPackageIn::tls_deserialize_exact(&bytes)
                .map_err(|e| ChatMlsError::ctx(&format!("kp[{i}] deserialize"), e))?;
            parsed.push(kp);
        }
        let mut validated: Vec<KeyPackage> = Vec::with_capacity(parsed.len());
        for (i, kp) in parsed.into_iter().enumerate() {
            let v = kp
                .validate(self.provider.crypto(), ProtocolVersion::Mls10)
                .map_err(|e| ChatMlsError::ctx(&format!("kp[{i}] validate"), e))?;
            validated.push(v);
        }

        self.with_group_mut(&group_id, |group, this| {
            let (commit_msg, welcome, _gi) = group
                .add_members(&this.provider, &this.signer, &validated)
                .map_err(|e| ChatMlsError::ctx("add_members", e))?;
            group
                .merge_pending_commit(&this.provider)
                .map_err(|e| ChatMlsError::ctx("merge_pending_commit", e))?;
            let commit = commit_msg
                .tls_serialize_detached()
                .map_err(|e| ChatMlsError::ctx("commit tls_serialize", e))?;
            let welcome = welcome
                .tls_serialize_detached()
                .map_err(|e| ChatMlsError::ctx("welcome tls_serialize", e))?;
            Ok(AddMembersResult { commit, welcome })
        })
    }

    /// Remove members by accountId. Resolves each accountId to a
    /// LeafNodeIndex by matching BasicCredential identity bytes, then emits
    /// a single Commit. Remove is unidirectional in MLS (no Welcome). Caller
    /// fans the Commit to remaining members via the existing publish path.
    ///
    /// Errors if any requested accountId is not currently a member.
    pub fn remove_members_by_accounts(
        &self,
        group_id: Vec<u8>,
        account_ids: Vec<String>,
    ) -> Result<Vec<u8>, ChatMlsError> {
        self.with_group_mut(&group_id, |group, this| {
            let mut requested: std::collections::HashSet<String> =
                account_ids.into_iter().collect();
            let mut indices: Vec<LeafNodeIndex> = Vec::with_capacity(requested.len());
            for member in group.members() {
                if let Ok(account) = std::str::from_utf8(member.credential.serialized_content()) {
                    if requested.remove(account) {
                        indices.push(member.index);
                    }
                }
            }
            if !requested.is_empty() {
                return Err(ChatMlsError::Internal(format!(
                    "remove_members: account(s) not found in group: {requested:?}"
                )));
            }

            let (commit_msg, _welcome, _gi) = group
                .remove_members(&this.provider, &this.signer, &indices)
                .map_err(|e| ChatMlsError::ctx("remove_members", e))?;
            group
                .merge_pending_commit(&this.provider)
                .map_err(|e| ChatMlsError::ctx("merge_pending_commit", e))?;
            commit_msg
                .tls_serialize_detached()
                .map_err(|e| ChatMlsError::ctx("commit tls_serialize", e))
        })
    }

    pub fn join_from_welcome(&self, welcome_bytes: Vec<u8>) -> Result<Vec<u8>, ChatMlsError> {
        let msg_in = MlsMessageIn::tls_deserialize_exact(&welcome_bytes)
            .map_err(|e| ChatMlsError::ctx("welcome msg deserialize", e))?;
        let welcome = match msg_in.extract() {
            MlsMessageBodyIn::Welcome(w) => w,
            _ => return Err(ChatMlsError::Internal("not a Welcome message".into())),
        };

        let join_cfg = MlsGroupJoinConfig::builder()
            .use_ratchet_tree_extension(true)
            .build();

        let staged = StagedWelcome::new_from_welcome(&self.provider, &join_cfg, welcome, None)
            .map_err(|e| ChatMlsError::ctx("StagedWelcome::new_from_welcome", e))?;

        let group = staged
            .into_group(&self.provider)
            .map_err(|e| ChatMlsError::ctx("staged.into_group", e))?;

        let group_id = group.group_id().as_slice().to_vec();
        self.groups_mut()?.insert(group_id.clone(), group);
        Ok(group_id)
    }

    pub fn encrypt_app(
        &self,
        group_id: Vec<u8>,
        plaintext: Vec<u8>,
    ) -> Result<Vec<u8>, ChatMlsError> {
        self.with_group_mut(&group_id, |group, this| {
            let msg = group
                .create_message(&this.provider, &this.signer, &plaintext)
                .map_err(|e| ChatMlsError::ctx("create_message", e))?;
            msg.tls_serialize_detached()
                .map_err(|e| ChatMlsError::ctx("app msg tls_serialize", e))
        })
    }

    pub fn process_message(
        &self,
        group_id: Vec<u8>,
        msg_bytes: Vec<u8>,
    ) -> Result<ProcessedKind, ChatMlsError> {
        let msg_in = MlsMessageIn::tls_deserialize_exact(&msg_bytes)
            .map_err(|e| ChatMlsError::ctx("msg_in deserialize", e))?;
        let protocol_msg: ProtocolMessage = msg_in
            .try_into_protocol_message()
            .map_err(|e| ChatMlsError::ctx("try_into_protocol_message", e))?;

        self.with_group_mut(&group_id, |group, this| {
            let processed = group
                .process_message(&this.provider, protocol_msg)
                .map_err(|e| ChatMlsError::ctx("process_message", e))?;
            match processed.into_content() {
                ProcessedMessageContent::ApplicationMessage(app) => Ok(ProcessedKind::Application {
                    plaintext: app.into_bytes(),
                }),
                ProcessedMessageContent::StagedCommitMessage(staged) => {
                    group
                        .merge_staged_commit(&this.provider, *staged)
                        .map_err(|e| ChatMlsError::ctx("merge_staged_commit", e))?;
                    Ok(ProcessedKind::CommitApplied)
                }
                ProcessedMessageContent::ProposalMessage(prop) => {
                    group
                        .store_pending_proposal(this.provider.storage(), *prop)
                        .map_err(|e| ChatMlsError::ctx("store_pending_proposal", e))?;
                    Ok(ProcessedKind::ProposalQueued)
                }
                ProcessedMessageContent::ExternalJoinProposalMessage(prop) => {
                    group
                        .store_pending_proposal(this.provider.storage(), *prop)
                        .map_err(|e| ChatMlsError::ctx("store_pending_proposal (external)", e))?;
                    Ok(ProcessedKind::ProposalQueued)
                }
            }
        })
    }

    pub fn current_epoch(&self, group_id: Vec<u8>) -> Result<u64, ChatMlsError> {
        self.with_group(&group_id, |g| Ok(g.epoch().as_u64()))
    }

    pub fn member_count(&self, group_id: Vec<u8>) -> Result<u32, ChatMlsError> {
        self.with_group(&group_id, |g| Ok(g.members().count() as u32))
    }

    /// Serialise the entire MemoryStorage to opaque bytes. JS layer persists
    /// to chat-db (already SQLCipher-encrypted) after every mutating call.
    /// Format is a simple length-prefix encoding of (key, value) entries —
    /// internal to chat-mls-core, NOT a wire-protocol; format may change.
    pub fn dump_state(&self) -> Result<Vec<u8>, ChatMlsError> {
        let values = self
            .provider
            .storage()
            .values
            .read()
            .map_err(|e| ChatMlsError::ctx("storage read lock", e))?;

        // Header: 4B "MLS1" magic + 4B BE entry count.
        let body_size: usize = values.iter().map(|(k, v)| 8 + k.len() + v.len()).sum();
        let mut out = Vec::with_capacity(8 + body_size);
        out.extend_from_slice(b"MLS1");
        out.extend_from_slice(&(values.len() as u32).to_be_bytes());
        for (k, v) in values.iter() {
            out.extend_from_slice(&(k.len() as u32).to_be_bytes());
            out.extend_from_slice(k);
            out.extend_from_slice(&(v.len() as u32).to_be_bytes());
            out.extend_from_slice(v);
        }
        Ok(out)
    }

    /// Restore engine state from a prior dump_state output. Replaces the
    /// MemoryStorage contents in-place and clears the in-memory group cache
    /// (next group op re-loads from the restored storage). Validates the
    /// magic header before touching state — a corrupt or wrong-version blob
    /// is rejected without mutating the engine.
    pub fn load_state(&self, bytes: Vec<u8>) -> Result<(), ChatMlsError> {
        let new_map = parse_snapshot(&bytes)?;

        // Swap the storage HashMap and clear the group cache atomically with
        // respect to other engine calls (Expo serialises Function calls, but
        // the Mutex in MemoryStorage guards against any cross-thread access
        // from OpenMLS internals).
        let mut values = self
            .provider
            .storage()
            .values
            .write()
            .map_err(|e| ChatMlsError::ctx("storage write lock", e))?;
        *values = new_map;
        drop(values);

        // Re-store the deterministically-derived signer. Idempotent if a
        // matching signer was already in the snapshot (overwrites identical
        // bytes), correct if it wasn't (fresh insertion). Without this, a
        // snapshot from a pre-signer state would leave the engine unable to
        // sign anything.
        self.signer
            .store(self.provider.storage())
            .map_err(|e| ChatMlsError::ctx("signer.store on load", e))?;

        self.groups_mut()?.clear();
        Ok(())
    }
}

// Non-UniFFI helpers — kept on `impl MlsEngine` so they share lifetime + can
// access `&self.provider` / `&self.signer` directly. NOT exported.

impl MlsEngine {
    fn groups_mut(&self) -> Result<std::sync::MutexGuard<'_, HashMap<Vec<u8>, MlsGroup>>, ChatMlsError> {
        self.groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))
    }

    /// Read-only group access with storage fallback. Cache miss triggers
    /// `MlsGroup::load(provider.storage(), &gid)`; if storage doesn't have
    /// the group either, returns "group not found".
    fn with_group<R>(
        &self,
        group_id: &[u8],
        f: impl FnOnce(&MlsGroup) -> Result<R, ChatMlsError>,
    ) -> Result<R, ChatMlsError> {
        let mut guard = self.groups_mut()?;
        if !guard.contains_key(group_id) {
            let loaded = MlsGroup::load(
                self.provider.storage(),
                &GroupId::from_slice(group_id),
            )
            .map_err(|e| ChatMlsError::ctx("MlsGroup::load", e))?
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;
            guard.insert(group_id.to_vec(), loaded);
        }
        let group = guard.get(group_id).expect("just inserted above");
        f(group)
    }

    /// Mutable group access with the same load-fallback semantics. Passes a
    /// borrowed `&Self` so the closure can reach `self.provider` /
    /// `self.signer` without re-entering the groups Mutex.
    fn with_group_mut<R>(
        &self,
        group_id: &[u8],
        f: impl FnOnce(&mut MlsGroup, &Self) -> Result<R, ChatMlsError>,
    ) -> Result<R, ChatMlsError> {
        let mut guard = self.groups_mut()?;
        if !guard.contains_key(group_id) {
            let loaded = MlsGroup::load(
                self.provider.storage(),
                &GroupId::from_slice(group_id),
            )
            .map_err(|e| ChatMlsError::ctx("MlsGroup::load", e))?
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;
            guard.insert(group_id.to_vec(), loaded);
        }
        let group = guard.get_mut(group_id).expect("just inserted above");
        f(group, self)
    }
}

// ── NSE (read-only, ephemeral) engine ────────────────────────────────────────
//
// Notification Service Extension entry point (iOS NSE + Android FMS). Lives
// out-of-process on iOS, in-process on Android, but in both cases on the
// hot path of a locked-screen push delivery — must be fast, allocation-light,
// and absolutely incapable of mutating durable state.
//
// Why a separate type instead of reusing MlsEngine:
//   * No signer. The NSE never originates messages, so we don't need the
//     identity seed and we don't want it sitting in the extension process.
//     Inbound application messages verify the SENDER's signature using keys
//     already inside the loaded snapshot's storage; the local signer is
//     irrelevant.
//   * Hard reject of commits/welcomes/proposals at the type boundary. The
//     extension must not advance epoch / merge tree changes — those mutations
//     belong to the main app, which is the single writer for the snapshot
//     (ADR-015 §M6 read-only-snapshot race). Surfacing a separate type
//     prevents the extension code from accidentally calling `add_members` /
//     `merge_staged_commit` on a stale snapshot.
//   * Drop-and-discard lifecycle. The provider is fresh per call; even if
//     OpenMLS internally bumps secret-tree generation while decrypting, the
//     bump dies with the provider — never written back to the sealed
//     snapshot on disk.

#[derive(uniffi::Object)]
pub struct NseEngine {
    provider: OpenMlsRustCrypto,
}

impl std::fmt::Debug for NseEngine {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("NseEngine")
    }
}

/// Constructor + sole UniFFI entry point. The sealed snapshot has already
/// been unsealed by the caller (Swift / Kotlin libsodium wrapper); we receive
/// the raw `dump_state` output.
#[uniffi::export]
pub fn engine_for_nse(snapshot: Vec<u8>) -> Result<Arc<NseEngine>, ChatMlsError> {
    let map = parse_snapshot(&snapshot)?;
    let provider = OpenMlsRustCrypto::default();
    {
        let mut values = provider
            .storage()
            .values
            .write()
            .map_err(|e| ChatMlsError::ctx("nse storage write lock", e))?;
        *values = map;
    }
    Ok(Arc::new(NseEngine { provider }))
}

#[uniffi::export]
impl NseEngine {
    /// Decrypt a single inbound application message and return its plaintext.
    ///
    /// `ciphertext` is the wire payload as the chat-transport push envelope
    /// delivers it: either the bare MLS message bytes, or those bytes with a
    /// one-byte v=2 frame prefix (0x02). We strip the prefix transparently.
    ///
    /// `nonce` is accepted to match the chat-transport v=1 envelope shape
    /// (the wrapper layer passes both `ciphertextB64` and `nonceB64`). For
    /// v=2 the nonce is empty and the field is ignored — MLS is its own
    /// self-describing AEAD frame. We keep the parameter so the Swift /
    /// Kotlin call sites don't have to branch on version before calling.
    ///
    /// REJECTS anything that isn't an application message: KeyPackage,
    /// Welcome, GroupInfo all fail at `try_into_protocol_message`; Commits
    /// and Proposals are caught explicitly so the error surface is a clear
    /// "snapshot stale" signal to the caller rather than a generic
    /// process_message failure.
    pub fn process_nse_application(
        &self,
        ciphertext: Vec<u8>,
        _nonce: Vec<u8>,
    ) -> Result<Vec<u8>, ChatMlsError> {
        if ciphertext.is_empty() {
            return Err(ChatMlsError::Internal("nse: empty ciphertext".into()));
        }
        // Strip the v=2 frame version byte if the caller forwarded the wire
        // envelope unchanged. crypto-pipe.ts prepends 0x02 before sending; the
        // push fan-out re-publishes that same blob, so it arrives here with
        // the prefix still in place.
        let mls_bytes: &[u8] = if ciphertext[0] == 0x02 {
            &ciphertext[1..]
        } else {
            &ciphertext
        };

        let msg_in = MlsMessageIn::tls_deserialize_exact(mls_bytes)
            .map_err(|e| ChatMlsError::ctx("nse msg_in deserialize", e))?;
        let protocol_msg: ProtocolMessage = msg_in
            .try_into_protocol_message()
            .map_err(|e| ChatMlsError::ctx("nse try_into_protocol_message", e))?;

        // Reject Commit / Proposal before touching storage. ContentType is
        // visible without state — cheap pre-flight.
        if !matches!(protocol_msg.content_type(), ContentType::Application) {
            return Err(ChatMlsError::Internal(
                "nse: non-application content rejected".into(),
            ));
        }

        let group_id = protocol_msg.group_id().clone();
        let mut group = MlsGroup::load(self.provider.storage(), &group_id)
            .map_err(|e| ChatMlsError::ctx("nse MlsGroup::load", e))?
            .ok_or_else(|| ChatMlsError::Internal("nse: group not found in snapshot".into()))?;

        let processed = group
            .process_message(&self.provider, protocol_msg)
            .map_err(|e| ChatMlsError::ctx("nse process_message", e))?;

        match processed.into_content() {
            ProcessedMessageContent::ApplicationMessage(app) => Ok(app.into_bytes()),
            ProcessedMessageContent::StagedCommitMessage(_)
            | ProcessedMessageContent::ProposalMessage(_)
            | ProcessedMessageContent::ExternalJoinProposalMessage(_) => Err(
                ChatMlsError::Internal("nse: non-application processed content".into()),
            ),
        }
    }
}

/// Parse a `dump_state` snapshot blob into the raw storage map. Used by both
/// `MlsEngine::load_state` (in-place swap on a long-lived engine) and
/// `engine_for_nse` (one-shot fresh provider). Validates the magic header
/// and length-prefix bounds before allocating the destination map.
fn parse_snapshot(bytes: &[u8]) -> Result<HashMap<Vec<u8>, Vec<u8>>, ChatMlsError> {
    if bytes.len() < 8 || &bytes[..4] != b"MLS1" {
        return Err(ChatMlsError::Internal(
            "load_state: bad magic / version".into(),
        ));
    }
    let count = u32::from_be_bytes([bytes[4], bytes[5], bytes[6], bytes[7]]) as usize;
    let mut new_map: HashMap<Vec<u8>, Vec<u8>> = HashMap::with_capacity(count);
    let mut i = 8;
    for _ in 0..count {
        if i + 4 > bytes.len() {
            return Err(ChatMlsError::Internal("load_state: truncated k_len".into()));
        }
        let k_len =
            u32::from_be_bytes([bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]]) as usize;
        i += 4;
        if i + k_len > bytes.len() {
            return Err(ChatMlsError::Internal("load_state: truncated key".into()));
        }
        let k = bytes[i..i + k_len].to_vec();
        i += k_len;
        if i + 4 > bytes.len() {
            return Err(ChatMlsError::Internal("load_state: truncated v_len".into()));
        }
        let v_len =
            u32::from_be_bytes([bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]]) as usize;
        i += 4;
        if i + v_len > bytes.len() {
            return Err(ChatMlsError::Internal("load_state: truncated value".into()));
        }
        let v = bytes[i..i + v_len].to_vec();
        i += v_len;
        new_map.insert(k, v);
    }
    if i != bytes.len() {
        return Err(ChatMlsError::Internal(
            "load_state: trailing bytes after declared count".into(),
        ));
    }
    Ok(new_map)
}

/// Derive the MLS signer's Ed25519 keypair deterministically from the M3
/// identity seed AND the accountId. BLAKE2b-256 over the domain tag,
/// length-prefixed accountId bytes, and the 32-byte identity seed yields a
/// 32-byte ed25519 signing key seed; the public key falls out via
/// ed25519-dalek.
///
/// Length-prefix on the accountId prevents canonicalisation ambiguity: an
/// attacker who could choose accountId and seed independently must not be
/// able to find two (accountId, seed) pairs whose concatenations alias. A
/// 4-byte big-endian length prefix is sufficient — accountIds are cuids
/// well under 4 GiB.
fn derive_signer(
    account_id: &str,
    identity_seed: &[u8],
) -> Result<SignatureKeyPair, ChatMlsError> {
    if identity_seed.len() != 32 {
        return Err(ChatMlsError::Internal(format!(
            "identity_seed must be 32 bytes (got {})",
            identity_seed.len()
        )));
    }
    let account_bytes = account_id.as_bytes();
    let account_len: u32 = account_bytes.len().try_into().map_err(|_| {
        ChatMlsError::Internal("accountId longer than u32::MAX bytes".into())
    })?;
    let mut hasher = Blake2b::<U32>::new();
    hasher.update(MLS_SIGNER_DERIVE_CONTEXT);
    hasher.update(account_len.to_be_bytes());
    hasher.update(account_bytes);
    hasher.update(identity_seed);
    let sub_seed: [u8; 32] = hasher.finalize().into();

    let signing_key = ed25519_dalek::SigningKey::from_bytes(&sub_seed);
    let verifying = signing_key.verifying_key();

    Ok(SignatureKeyPair::from_raw(
        SignatureScheme::ED25519,
        signing_key.to_bytes().to_vec(),
        verifying.to_bytes().to_vec(),
    ))
}

impl std::fmt::Debug for ProcessedKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProcessedKind::Application { plaintext } => {
                write!(f, "Application({}B)", plaintext.len())
            }
            ProcessedKind::CommitApplied => write!(f, "CommitApplied"),
            ProcessedKind::ProposalQueued => write!(f, "ProposalQueued"),
        }
    }
}

// ── Unit tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn seed(label: u8) -> Vec<u8> {
        vec![label; 32]
    }

    fn engine(account: &str, label: u8) -> Arc<MlsEngine> {
        MlsEngine::new(account.to_string(), seed(label)).expect("engine new")
    }

    fn group_id(label: &str) -> Vec<u8> {
        let mut v = label.as_bytes().to_vec();
        v.resize(32, 0);
        v
    }

    #[test]
    fn smoke_two_member_dm() {
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("dm-alice-bob");

        alice.create_group(gid.clone()).unwrap();

        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        let bob_gid = bob.join_from_welcome(added.welcome).unwrap();
        assert_eq!(bob_gid, gid);

        let cipher = alice.encrypt_app(gid.clone(), b"hi bob".to_vec()).unwrap();
        match bob.process_message(gid.clone(), cipher).unwrap() {
            ProcessedKind::Application { plaintext } => assert_eq!(plaintext, b"hi bob"),
            other => panic!("expected Application, got {other:?}"),
        }

        assert_eq!(alice.current_epoch(gid.clone()).unwrap(), 1);
        assert_eq!(bob.current_epoch(gid.clone()).unwrap(), 1);
        assert_eq!(alice.member_count(gid.clone()).unwrap(), 2);
        assert_eq!(bob.member_count(gid).unwrap(), 2);
    }

    #[test]
    fn five_member_group_round_trip() {
        let alice = engine("alice@sessions", 0xA0);
        let peers: Vec<Arc<MlsEngine>> = ["bob", "carol", "dave", "eve"]
            .iter()
            .enumerate()
            .map(|(i, n)| engine(n, 0xB0 + i as u8))
            .collect();
        let gid = group_id("g5");

        alice.create_group(gid.clone()).unwrap();
        let kps: Vec<Vec<u8>> = peers.iter().map(|p| p.create_key_package().unwrap()).collect();
        let added = alice.add_members(gid.clone(), kps).unwrap();
        for p in &peers {
            assert_eq!(p.join_from_welcome(added.welcome.clone()).unwrap(), gid);
        }

        let cipher = alice
            .encrypt_app(gid.clone(), b"hello group".to_vec())
            .unwrap();
        for p in &peers {
            match p.process_message(gid.clone(), cipher.clone()).unwrap() {
                ProcessedKind::Application { plaintext } => assert_eq!(plaintext, b"hello group"),
                other => panic!("{}: expected Application, got {other:?}", p.account_id()),
            }
        }
        assert_eq!(alice.member_count(gid).unwrap(), 5);
    }

    #[test]
    fn add_member_mid_conversation_advances_epoch() {
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let carol = engine("carol@sessions", 0xC0);
        let gid = group_id("g-grow");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let add1 = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(add1.welcome).unwrap();

        let carol_kp = carol.create_key_package().unwrap();
        let add2 = alice.add_members(gid.clone(), vec![carol_kp]).unwrap();
        match bob.process_message(gid.clone(), add2.commit).unwrap() {
            ProcessedKind::CommitApplied => (),
            other => panic!("expected CommitApplied, got {other:?}"),
        }
        carol.join_from_welcome(add2.welcome).unwrap();

        assert_eq!(alice.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(bob.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(carol.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(alice.member_count(gid).unwrap(), 3);
    }

    #[test]
    fn remove_member_mid_conversation_advances_epoch() {
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let carol = engine("carol@sessions", 0xC0);
        let gid = group_id("g-shrink");

        alice.create_group(gid.clone()).unwrap();
        let kps = vec![
            bob.create_key_package().unwrap(),
            carol.create_key_package().unwrap(),
        ];
        let added = alice.add_members(gid.clone(), kps).unwrap();
        bob.join_from_welcome(added.welcome.clone()).unwrap();
        carol.join_from_welcome(added.welcome).unwrap();
        assert_eq!(alice.member_count(gid.clone()).unwrap(), 3);

        let commit = alice
            .remove_members_by_accounts(gid.clone(), vec!["carol@sessions".into()])
            .unwrap();

        // Remaining member bob applies the commit and advances epoch.
        match bob.process_message(gid.clone(), commit).unwrap() {
            ProcessedKind::CommitApplied => (),
            other => panic!("expected CommitApplied, got {other:?}"),
        }

        assert_eq!(alice.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(bob.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(alice.member_count(gid.clone()).unwrap(), 2);
        assert_eq!(bob.member_count(gid.clone()).unwrap(), 2);

        // Post-remove send only reaches bob; carol's epoch is frozen at the
        // pre-remove state so the new ciphertext won't decrypt for her.
        let cipher = alice.encrypt_app(gid.clone(), b"private now".to_vec()).unwrap();
        match bob.process_message(gid.clone(), cipher.clone()).unwrap() {
            ProcessedKind::Application { plaintext } => assert_eq!(plaintext, b"private now"),
            other => panic!("expected Application, got {other:?}"),
        }
        assert!(carol.process_message(gid, cipher).is_err());
    }

    #[test]
    fn remove_nonmember_errors() {
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("g-rm-err");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome).unwrap();

        let err = alice
            .remove_members_by_accounts(gid, vec!["ghost@sessions".into()])
            .unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(msg.contains("not found")),
        }
    }

    /// Chunk 2.5 acceptance — engine state survives drop + recreate when the
    /// caller persists dump_state() bytes externally.
    #[test]
    fn dump_load_round_trip_preserves_group() {
        let alice_seed = seed(0xA0);
        let alice = MlsEngine::new("alice@sessions".into(), alice_seed.clone()).unwrap();
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("g-resume");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome).unwrap();

        // Send a message before snapshot, so we know the post-snapshot send
        // is operating on a restored state.
        let _ = alice
            .encrypt_app(gid.clone(), b"pre-snapshot".to_vec())
            .unwrap();

        // Simulate the JS layer's persistence cycle: dump → drop engine →
        // create fresh engine → load → continue.
        let snapshot = alice.dump_state().unwrap();
        drop(alice);

        let alice2 = MlsEngine::new("alice@sessions".into(), alice_seed).unwrap();
        alice2.load_state(snapshot).unwrap();

        // Group state should be intact: epoch + member count.
        assert_eq!(alice2.current_epoch(gid.clone()).unwrap(), 1);
        assert_eq!(alice2.member_count(gid.clone()).unwrap(), 2);

        // Encrypt + send a new message — bob (untouched) decrypts it.
        let cipher = alice2
            .encrypt_app(gid.clone(), b"post-snapshot".to_vec())
            .unwrap();
        match bob.process_message(gid, cipher).unwrap() {
            ProcessedKind::Application { plaintext } => assert_eq!(plaintext, b"post-snapshot"),
            other => panic!("expected Application, got {other:?}"),
        }
    }

    /// Regression — two accounts sharing the same identity_seed (e.g. two iOS
    /// Simulators on the same Mac that share the keychain access group)
    /// MUST derive different MLS signers, otherwise add_members fails with
    /// `DuplicateSignatureKey`. Pre-v2 derivation depended only on the seed,
    /// so both engines came out with identical Ed25519 keys.
    #[test]
    fn shared_seed_different_accounts_derive_distinct_signers() {
        let shared = seed(0xAA);
        let alice = MlsEngine::new("alice@sessions".into(), shared.clone()).unwrap();
        let bob = MlsEngine::new("bob@sessions".into(), shared.clone()).unwrap();
        assert_ne!(
            alice.signer.public(),
            bob.signer.public(),
            "shared seed but distinct accountId should produce distinct signers"
        );

        // End-to-end: the founder + the peer can actually share a group
        // without OpenMLS rejecting the proposal as duplicate-sig-key.
        let gid = group_id("shared-seed");
        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome).unwrap();
        assert_eq!(alice.member_count(gid).unwrap(), 2);
    }

    #[test]
    fn load_state_rejects_bad_magic() {
        let e = engine("alice@sessions", 0xA0);
        let err = e.load_state(b"WRONG_MAGIC".to_vec()).unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(msg.contains("bad magic")),
        }
    }

    #[test]
    fn load_state_rejects_truncated() {
        let e = engine("alice@sessions", 0xA0);
        // Valid magic + count=1 but no entries follow.
        let mut bad = b"MLS1".to_vec();
        bad.extend_from_slice(&1u32.to_be_bytes());
        let err = e.load_state(bad).unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(msg.contains("truncated")),
        }
    }

    // ── NSE engine ──────────────────────────────────────────────────────────
    // Round-trips a sender → wire-blob → NSE-snapshot pipeline that mirrors
    // what the chat-push Lambda + NSE wrapper do on a real device.

    fn v2_wire(cipher: Vec<u8>) -> Vec<u8> {
        // Mirror crypto-pipe.ts encryptOutboundMls: prepend 0x02 version
        // byte before the MLS message bytes.
        let mut out = Vec::with_capacity(cipher.len() + 1);
        out.push(0x02);
        out.extend_from_slice(&cipher);
        out
    }

    #[test]
    fn nse_decrypts_application_from_snapshot() {
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("dm-nse");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome).unwrap();

        // Bob snapshots BEFORE the inbound application arrives — exactly the
        // ordering the main app guarantees (snapshot is sealed on every
        // engine mutation, the push race targets the unmerged-commit window).
        let snapshot = bob.dump_state().unwrap();

        let cipher = alice.encrypt_app(gid.clone(), b"hello from nse".to_vec()).unwrap();
        let wire = v2_wire(cipher);

        let nse = engine_for_nse(snapshot).unwrap();
        let pt = nse.process_nse_application(wire, vec![]).unwrap();
        assert_eq!(pt, b"hello from nse");
    }

    #[test]
    fn nse_decrypts_bare_mls_bytes_without_v2_prefix() {
        // Sanity — if the wire stripper upstream already removes the version
        // byte, the engine still decrypts. Covers the future case where the
        // Lambda repackages the payload.
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("dm-nse-bare");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome).unwrap();
        let snapshot = bob.dump_state().unwrap();

        let cipher = alice.encrypt_app(gid, b"bare".to_vec()).unwrap();
        let nse = engine_for_nse(snapshot).unwrap();
        let pt = nse.process_nse_application(cipher, vec![]).unwrap();
        assert_eq!(pt, b"bare");
    }

    #[test]
    fn nse_rejects_commit() {
        // Pre-arranged group with three members, then Alice removes Carol.
        // The Commit she emits is a Commit MlsMessageIn — NOT an application
        // message — and the NSE engine must surface a clear error instead of
        // merging the commit into the stale snapshot.
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let carol = engine("carol@sessions", 0xC0);
        let gid = group_id("g-nse-commit");

        alice.create_group(gid.clone()).unwrap();
        let kps = vec![
            bob.create_key_package().unwrap(),
            carol.create_key_package().unwrap(),
        ];
        let added = alice.add_members(gid.clone(), kps).unwrap();
        bob.join_from_welcome(added.welcome.clone()).unwrap();
        carol.join_from_welcome(added.welcome).unwrap();

        // Bob snapshots while still at the 3-member epoch.
        let snapshot = bob.dump_state().unwrap();

        let commit = alice
            .remove_members_by_accounts(gid, vec!["carol@sessions".into()])
            .unwrap();
        let wire = v2_wire(commit);

        let nse = engine_for_nse(snapshot).unwrap();
        let err = nse.process_nse_application(wire, vec![]).unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(
                msg.contains("non-application"),
                "expected non-application rejection, got: {msg}"
            ),
        }
    }

    #[test]
    fn nse_rejects_welcome_bytes() {
        // Welcome is an MlsMessageIn variant that try_into_protocol_message
        // refuses — the NSE surface should error cleanly without panic.
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("g-nse-welcome");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome.clone()).unwrap();
        let snapshot = bob.dump_state().unwrap();

        let wire = v2_wire(added.welcome);
        let nse = engine_for_nse(snapshot).unwrap();
        let err = nse.process_nse_application(wire, vec![]).unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(
                msg.contains("try_into_protocol_message")
                    || msg.contains("non-application"),
                "unexpected error: {msg}"
            ),
        }
    }

    #[test]
    fn nse_rejects_unknown_group() {
        // Snapshot is from a fresh engine that's never joined any group —
        // MlsGroup::load returns None and we surface "group not found".
        let alice = engine("alice@sessions", 0xA0);
        let bob = engine("bob@sessions", 0xB0);
        let gid = group_id("g-nse-orphan");

        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(added.welcome).unwrap();
        let cipher = alice.encrypt_app(gid, b"orphan".to_vec()).unwrap();

        // Snapshot belongs to a *different* engine that never joined the group.
        let other = engine("other@sessions", 0xD0);
        let snapshot = other.dump_state().unwrap();

        let nse = engine_for_nse(snapshot).unwrap();
        let err = nse
            .process_nse_application(v2_wire(cipher), vec![])
            .unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(
                msg.contains("group not found"),
                "expected group-not-found, got: {msg}"
            ),
        }
    }

    #[test]
    fn nse_rejects_empty_ciphertext() {
        let alice = engine("alice@sessions", 0xA0);
        let snapshot = alice.dump_state().unwrap();
        let nse = engine_for_nse(snapshot).unwrap();
        let err = nse.process_nse_application(vec![], vec![]).unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(msg.contains("empty")),
        }
    }

    #[test]
    fn nse_rejects_bad_snapshot() {
        let err = engine_for_nse(b"NOT_A_SNAPSHOT".to_vec()).unwrap_err();
        match err {
            ChatMlsError::Internal(msg) => assert!(msg.contains("bad magic")),
        }
    }
}
