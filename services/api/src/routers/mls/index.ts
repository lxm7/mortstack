import { router } from "../../trpc";
import { keysRouter } from "./keys";
import { groupsRouter } from "./groups";

// The MLS namespace — `mls.keys.*` for KeyPackage publish/consume and
// `mls.groups.*` for the Delivery Service (commit log + welcome routing).
// See ADR-015 for the libsignal → OpenMLS swap that gates everything here.
export const mlsRouter = router({
  keys: keysRouter,
  groups: groupsRouter,
});
