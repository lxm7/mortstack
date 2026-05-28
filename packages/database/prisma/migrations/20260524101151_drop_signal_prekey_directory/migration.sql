-- Cleanup migration: removes leftover libsignal directory artifacts from the
-- (now-deleted) 20260522100000_add_signal_prekey_directory migration. ADR-015
-- replaced libsignal with OpenMLS; this rolls forward the dev DB so the
-- Prisma migration history matches the working tree.
--
-- All statements are IF EXISTS / CASCADE so the migration is idempotent and
-- replays cleanly on the shadow DB (which never had the libsignal tables).

-- DropTable — CASCADE pulls the FK constraints with the tables.
DROP TABLE IF EXISTS "OneTimePrekey" CASCADE;
DROP TABLE IF EXISTS "PreKeyBundle"  CASCADE;

-- DropIndex (composite unique index Prisma would have created)
DROP INDEX IF EXISTS "UserDevice_accountId_signalDeviceId_key";

-- DropColumn — UserDevice.signal* superseded by MLS BasicCredential
-- (reuses the existing ed25519Pub per ADR-015 §5; no new directory column).
ALTER TABLE "UserDevice" DROP COLUMN IF EXISTS "signalDeviceId";
ALTER TABLE "UserDevice" DROP COLUMN IF EXISTS "signalIdentityKey";
ALTER TABLE "UserDevice" DROP COLUMN IF EXISTS "signalRegistrationId";
