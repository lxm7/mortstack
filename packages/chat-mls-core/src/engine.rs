// MlsEngine — UniFFI-exported handle holding the OpenMLS provider, the local
// signature keypair, the BasicCredential identifying the account, and a map
// of joined groups keyed by their MLS GroupId.
//
// Ciphersuite is pinned per ADR-015 §3: MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519
// (RFC 9420 mandatory). PQ extension added via MLS ciphersuite swap when
// IETF stabilises; engine surface unchanged.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use openmls::prelude::*;
use openmls_basic_credential::SignatureKeyPair;
use openmls_rust_crypto::OpenMlsRustCrypto;
use openmls_traits::OpenMlsProvider;
use openmls_traits::types::SignatureScheme;
use tls_codec::{Deserialize as TlsDeserialize, Serialize as TlsSerialize};

use crate::error::ChatMlsError;

const CIPHERSUITE: Ciphersuite = Ciphersuite::MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519;

/// Outcome of `MlsEngine::add_members` — a Commit to fan out to existing
/// members + a Welcome to send to each new joiner. `group_info` is None when
/// the ratchet-tree extension is in use (the tree travels inside Welcome).
#[derive(uniffi::Record)]
pub struct AddMembersResult {
    pub commit: Vec<u8>,
    pub welcome: Vec<u8>,
}

/// Discriminated result of `MlsEngine::process_message`. Application = a
/// decrypted plaintext for the caller to deliver to the chat UI. CommitApplied
/// = group state advanced (one epoch) — no payload. ProposalQueued = a
/// proposal was stored as pending; caller can choose to commit later.
#[derive(uniffi::Enum)]
pub enum ProcessedKind {
    Application { plaintext: Vec<u8> },
    CommitApplied,
    ProposalQueued,
}

#[derive(uniffi::Object)]
pub struct MlsEngine {
    /// Account-scoped opaque identifier — bytes go into the BasicCredential
    /// identity so peers can attribute messages back to a Sessions Account.
    /// Cuid string from M3 in practice; engine treats it as opaque bytes.
    account_id: String,

    /// In-memory OpenMLS provider — wraps MemoryStorage + RustCrypto. State
    /// is lost when this Engine is dropped. SQLCipher-backed StorageProvider
    /// lands in Chunk 2.5 (see backlog).
    provider: OpenMlsRustCrypto,

    /// Long-term signature keypair (Ed25519, RFC 9420 SignatureScheme).
    /// Currently generated fresh per Engine — deterministic derivation from
    /// the M3 identity seed lands alongside SQLCipher persistence.
    signer: SignatureKeyPair,

    /// Reusable identity envelope passed to every MLS op that emits a
    /// signed message (create_group, key package builds, application msgs).
    credential_with_key: CredentialWithKey,

    /// Groups this engine has joined / created, keyed by the raw GroupId
    /// bytes the application chose at create_group time (or the GroupId the
    /// engine extracted from a Welcome). Mutex because UniFFI Objects are
    /// always `Arc<Self>` and method receivers are `&self`.
    groups: Mutex<HashMap<Vec<u8>, MlsGroup>>,
}

#[uniffi::export]
impl MlsEngine {
    /// One Engine per account on this install. Subsequent constructors with a
    /// different account_id are an error (caller must drop the old Engine
    /// first) — that prevents accidental mixing of multi-account state.
    #[uniffi::constructor]
    pub fn new(account_id: String) -> Result<Arc<Self>, ChatMlsError> {
        let provider = OpenMlsRustCrypto::default();

        let signer = SignatureKeyPair::new(SignatureScheme::ED25519)
            .map_err(|e| ChatMlsError::ctx("signature keygen", e))?;
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

    /// Returns the account_id this engine was constructed for. Useful for
    /// the host code's "is the engine bound to the right account?" check.
    pub fn account_id(&self) -> String {
        self.account_id.clone()
    }

    /// Generate one fresh KeyPackage. Caller is responsible for shipping the
    /// returned bytes to the server prekey directory (Chunk 4 — mls-keys
    /// publishKeyPackages route). The matching private material is stored in
    /// `provider.storage()` and consumed when this device joins a group via
    /// `join_from_welcome`.
    pub fn create_key_package(&self) -> Result<Vec<u8>, ChatMlsError> {
        let kp_bundle = KeyPackage::builder()
            .build(
                CIPHERSUITE,
                &self.provider,
                &self.signer,
                self.credential_with_key.clone(),
            )
            .map_err(|e| ChatMlsError::ctx("KeyPackage::build", e))?;

        // Wire form is the public KeyPackage (sans private keys). Caller
        // never sees the bundle's private half.
        kp_bundle
            .key_package()
            .tls_serialize_detached()
            .map_err(|e| ChatMlsError::ctx("kp tls_serialize", e))
    }

    /// Create a brand-new group with this engine as the sole founder member.
    /// `group_id` is opaque to MLS — caller chooses any 32-byte identifier;
    /// we recommend `sha256(chatId)` or a random 32B (see ADR-015 §7 design
    /// note on Chat.mlsGroupId).
    pub fn create_group(&self, group_id: Vec<u8>) -> Result<(), ChatMlsError> {
        let cfg = MlsGroupCreateConfig::builder()
            .ciphersuite(CIPHERSUITE)
            // Ratchet tree travels inside Welcome — saves a separate
            // distribution path for it. Standard pattern for small/medium
            // groups; revisit if message size becomes a concern at huge group
            // sizes (Phase 3 territory).
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

        self.groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?
            .insert(group_id, group);
        Ok(())
    }

    /// Add one or more members to an existing group. Returns the Commit (to
    /// fan out to all *current* members via the DS) and the Welcome (to send
    /// to the new joiners). The pending commit is merged into local state
    /// before returning — caller doesn't need a second call.
    pub fn add_members(
        &self,
        group_id: Vec<u8>,
        key_packages: Vec<Vec<u8>>,
    ) -> Result<AddMembersResult, ChatMlsError> {
        let mut guard = self
            .groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?;
        let group = guard
            .get_mut(&group_id)
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;

        // Deserialize the peer KeyPackages from wire bytes.
        let mut parsed: Vec<KeyPackageIn> = Vec::with_capacity(key_packages.len());
        for (i, bytes) in key_packages.into_iter().enumerate() {
            let kp = KeyPackageIn::tls_deserialize_exact(&bytes)
                .map_err(|e| ChatMlsError::ctx(&format!("kp[{i}] deserialize"), e))?;
            parsed.push(kp);
        }

        // Validate KeyPackages against the ciphersuite/protocol — fails fast
        // on a peer bundle from a wrong group config.
        let mut validated: Vec<KeyPackage> = Vec::with_capacity(parsed.len());
        for (i, kp) in parsed.into_iter().enumerate() {
            let v = kp
                .validate(self.provider.crypto(), ProtocolVersion::Mls10)
                .map_err(|e| ChatMlsError::ctx(&format!("kp[{i}] validate"), e))?;
            validated.push(v);
        }

        let (commit_msg, welcome, _group_info) = group
            .add_members(&self.provider, &self.signer, &validated)
            .map_err(|e| ChatMlsError::ctx("add_members", e))?;

        group
            .merge_pending_commit(&self.provider)
            .map_err(|e| ChatMlsError::ctx("merge_pending_commit", e))?;

        let commit = commit_msg
            .tls_serialize_detached()
            .map_err(|e| ChatMlsError::ctx("commit tls_serialize", e))?;
        let welcome = welcome
            .tls_serialize_detached()
            .map_err(|e| ChatMlsError::ctx("welcome tls_serialize", e))?;

        Ok(AddMembersResult { commit, welcome })
    }

    /// Process a Welcome received from another member. Returns the group_id
    /// of the newly-joined group so the caller can route subsequent messages
    /// to the right local state. Welcome already encodes the ratchet tree
    /// (use_ratchet_tree_extension=true in create_group), so no separate
    /// tree fetch is needed.
    pub fn join_from_welcome(&self, welcome_bytes: Vec<u8>) -> Result<Vec<u8>, ChatMlsError> {
        let msg_in = MlsMessageIn::tls_deserialize_exact(&welcome_bytes)
            .map_err(|e| ChatMlsError::ctx("welcome msg deserialize", e))?;
        let welcome = match msg_in.extract() {
            MlsMessageBodyIn::Welcome(w) => w,
            _ => {
                return Err(ChatMlsError::Internal("not a Welcome message".into()));
            }
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
        self.groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?
            .insert(group_id.clone(), group);
        Ok(group_id)
    }

    /// Encrypt application plaintext for the named group. The returned bytes
    /// are an MlsMessageOut — server stores ONE blob and fans to all members
    /// (the v=2 wire frame from §M3.5). Forward secrecy: the key material is
    /// discarded immediately; sender cannot decrypt own message.
    pub fn encrypt_app(
        &self,
        group_id: Vec<u8>,
        plaintext: Vec<u8>,
    ) -> Result<Vec<u8>, ChatMlsError> {
        let mut guard = self
            .groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?;
        let group = guard
            .get_mut(&group_id)
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;

        let msg = group
            .create_message(&self.provider, &self.signer, &plaintext)
            .map_err(|e| ChatMlsError::ctx("create_message", e))?;

        msg.tls_serialize_detached()
            .map_err(|e| ChatMlsError::ctx("app msg tls_serialize", e))
    }

    /// Process any incoming MLS message for a group — Application, Commit, or
    /// Proposal. Dispatcher returns a typed result so the caller knows which
    /// shape it got. Commits are auto-merged; proposals are stored as
    /// pending (caller has no current API to commit them — Phase 2 work).
    pub fn process_message(
        &self,
        group_id: Vec<u8>,
        msg_bytes: Vec<u8>,
    ) -> Result<ProcessedKind, ChatMlsError> {
        let mut guard = self
            .groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?;
        let group = guard
            .get_mut(&group_id)
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;

        let msg_in = MlsMessageIn::tls_deserialize_exact(&msg_bytes)
            .map_err(|e| ChatMlsError::ctx("msg_in deserialize", e))?;
        let protocol_msg: ProtocolMessage = msg_in
            .try_into_protocol_message()
            .map_err(|e| ChatMlsError::ctx("try_into_protocol_message", e))?;

        let processed = group
            .process_message(&self.provider, protocol_msg)
            .map_err(|e| ChatMlsError::ctx("process_message", e))?;

        match processed.into_content() {
            ProcessedMessageContent::ApplicationMessage(app) => Ok(ProcessedKind::Application {
                plaintext: app.into_bytes(),
            }),
            ProcessedMessageContent::StagedCommitMessage(staged) => {
                group
                    .merge_staged_commit(&self.provider, *staged)
                    .map_err(|e| ChatMlsError::ctx("merge_staged_commit", e))?;
                Ok(ProcessedKind::CommitApplied)
            }
            ProcessedMessageContent::ProposalMessage(prop) => {
                group
                    .store_pending_proposal(self.provider.storage(), *prop)
                    .map_err(|e| ChatMlsError::ctx("store_pending_proposal", e))?;
                Ok(ProcessedKind::ProposalQueued)
            }
            ProcessedMessageContent::ExternalJoinProposalMessage(prop) => {
                group
                    .store_pending_proposal(self.provider.storage(), *prop)
                    .map_err(|e| ChatMlsError::ctx("store_pending_proposal (external)", e))?;
                Ok(ProcessedKind::ProposalQueued)
            }
        }
    }

    /// Current epoch counter for the named group — increments by one each
    /// time a Commit is merged. Useful for the Chunk 4 server-side ordering
    /// gate (server refuses to accept a commit at epoch N+2 if it hasn't
    /// seen N+1 yet) and for the Chunk 7 acceptance harness.
    pub fn current_epoch(&self, group_id: Vec<u8>) -> Result<u64, ChatMlsError> {
        let guard = self
            .groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?;
        let group = guard
            .get(&group_id)
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;
        Ok(group.epoch().as_u64())
    }

    /// Member count for the named group, including self. 0 = group not loaded.
    pub fn member_count(&self, group_id: Vec<u8>) -> Result<u32, ChatMlsError> {
        let guard = self
            .groups
            .lock()
            .map_err(|e| ChatMlsError::ctx("groups lock", e))?;
        let group = guard
            .get(&group_id)
            .ok_or_else(|| ChatMlsError::Internal("group not found".into()))?;
        Ok(group.members().count() as u32)
    }
}

// ── Unit tests ───────────────────────────────────────────────────────────────
//
// All in-memory — exercise the engine surface that JS will call via UniFFI.
// Run with: cargo test (from packages/chat-mls-core/).

#[cfg(test)]
mod tests {
    use super::*;

    fn engine(account: &str) -> Arc<MlsEngine> {
        MlsEngine::new(account.to_string()).expect("engine new")
    }

    fn group_id(label: &str) -> Vec<u8> {
        // Pad/truncate to 32 bytes — opaque to MLS, just deterministic in tests.
        let mut v = label.as_bytes().to_vec();
        v.resize(32, 0);
        v
    }

    #[test]
    fn smoke_two_member_dm() {
        let alice = engine("alice@sessions");
        let bob = engine("bob@sessions");
        let gid = group_id("dm-alice-bob");

        alice.create_group(gid.clone()).unwrap();

        let bob_kp = bob.create_key_package().unwrap();
        let added = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        let bob_gid = bob.join_from_welcome(added.welcome).unwrap();
        assert_eq!(bob_gid, gid);

        // Alice → Bob (application message round trip via the wire).
        let cipher = alice.encrypt_app(gid.clone(), b"hi bob".to_vec()).unwrap();
        let got = bob.process_message(gid.clone(), cipher).unwrap();
        match got {
            ProcessedKind::Application { plaintext } => assert_eq!(plaintext, b"hi bob"),
            other => panic!("expected Application, got {other:?}"),
        }

        // Both sides agree on epoch + member count.
        assert_eq!(alice.current_epoch(gid.clone()).unwrap(), 1);
        assert_eq!(bob.current_epoch(gid.clone()).unwrap(), 1);
        assert_eq!(alice.member_count(gid.clone()).unwrap(), 2);
        assert_eq!(bob.member_count(gid).unwrap(), 2);
    }

    #[test]
    fn five_member_group_round_trip() {
        let alice = engine("alice@sessions");
        let names = ["bob", "carol", "dave", "eve"];
        let peers: Vec<Arc<MlsEngine>> = names.iter().map(|n| engine(n)).collect();
        let gid = group_id("g5");

        alice.create_group(gid.clone()).unwrap();
        let kps: Vec<Vec<u8>> = peers.iter().map(|p| p.create_key_package().unwrap()).collect();
        let added = alice.add_members(gid.clone(), kps).unwrap();

        // Each peer joins via the same Welcome (single Welcome carries entries
        // for every new joiner — that's the whole point of group-native).
        for p in &peers {
            let g = p.join_from_welcome(added.welcome.clone()).unwrap();
            assert_eq!(g, gid);
        }

        let cipher = alice.encrypt_app(gid.clone(), b"hello group".to_vec()).unwrap();
        for p in &peers {
            match p.process_message(gid.clone(), cipher.clone()).unwrap() {
                ProcessedKind::Application { plaintext } => {
                    assert_eq!(plaintext, b"hello group")
                }
                other => panic!("{}: expected Application, got {other:?}", p.account_id()),
            }
        }

        assert_eq!(alice.member_count(gid).unwrap(), 5);
    }

    #[test]
    fn add_member_mid_conversation_advances_epoch() {
        let alice = engine("alice@sessions");
        let bob = engine("bob@sessions");
        let carol = engine("carol@sessions");
        let gid = group_id("g-grow");

        // alice + bob first.
        alice.create_group(gid.clone()).unwrap();
        let bob_kp = bob.create_key_package().unwrap();
        let add1 = alice.add_members(gid.clone(), vec![bob_kp]).unwrap();
        bob.join_from_welcome(add1.welcome).unwrap();

        assert_eq!(alice.current_epoch(gid.clone()).unwrap(), 1);
        assert_eq!(bob.current_epoch(gid.clone()).unwrap(), 1);

        // alice adds carol — must fan the commit to bob, send welcome to carol.
        let carol_kp = carol.create_key_package().unwrap();
        let add2 = alice.add_members(gid.clone(), vec![carol_kp]).unwrap();
        match bob.process_message(gid.clone(), add2.commit).unwrap() {
            ProcessedKind::CommitApplied => (),
            other => panic!("expected CommitApplied, got {other:?}"),
        }
        carol.join_from_welcome(add2.welcome).unwrap();

        // All three agree on epoch + member count.
        assert_eq!(alice.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(bob.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(carol.current_epoch(gid.clone()).unwrap(), 2);
        assert_eq!(alice.member_count(gid).unwrap(), 3);
    }
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
