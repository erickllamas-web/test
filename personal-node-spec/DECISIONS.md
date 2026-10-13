# Decisions log

The decisions taken in conversation, in the order they were made, with the reasoning that carried them. The specification is the authoritative text; this is the trail.

## Architecture

1. **Local-first, not cloud.** Each user's data lives on their own devices and syncs between them. No provider holds plaintext or keys.
2. **PWAs everywhere, one native companion later.** Apps are zero-dependency static sites installed from the browser. The only native code is a single companion app for the things browsers refuse: autofill and passkey provider, call ringing, background photo upload on iOS, NFC, mobile tunnel client.
3. **One node, app-agnostic.** A single Go binary per computer that knows namespaces, documents, blobs and peers, and never contains app-specific logic. Heavy, app-specific work ships as sandboxed WASM capabilities.
4. **OS churn absorbed once.** An adapter layer inside the node is the only platform-aware code. Self-update with a separate tiny updater and rollback. Browsers carry the OS for the apps.
5. **Zero dependencies in apps.** Nothing rots, everything is auditable end to end, no supply chain.

## Identity and trust

6. **One root key per person.** All apps, all data, one pairing flow, one recovery. Keys derived per app so apps cannot read each other.
7. **Keys never leave the person.** Sealed in secure hardware behind biometrics via passkeys. Biometrics are the OS's gate to the enclave, never key material, and the software never stores biometric data.
8. **Pairing by QR with face consent.** The in-person scan authenticates the channel; the biometric is the consent.
9. **No directory.** You can only be found if you hand someone your card. No spam by construction. Introductions require the introduced person's consent. Cards rotate.
10. **Friends are the stewards.** Contacts' nodes relay, hold mail, and store encrypted backups. Contacts hold ciphertext only. Nodes never relay or store for strangers; one hop, contacts only.
11. **Recovery through people.** Restore needs the person's face on a device with the key plus one contact's nod. Any number of contacts cannot open anything.
12. **Total loss resolved as pieces, not people.** Three pieces rebuild root: contacts' shares (Shamir), an optional answers piece, an optional hardware-key piece. Contact-only paths have a 48-hour delay, broadcast to every shareholder and surviving device, and anyone can cancel. Paths with a person-held piece complete immediately. The vault requires at least one person-held piece.
13. **Accepting a card is identity verification.** The web of trust builds itself from ordinary contact lists; the same nod serves recovery, vouching, timestamps and relay permission.
14. **Signed records, not NFTs.** A hashed document with claims, signatures, countersignatures and contact-witnessed timestamps gives authorship, attestations, diplomas, contracts and issuer-managed ownership. No ledger. Global scarcity is out of scope.

## Network and names

15. **Path order.** LAN, direct with hole punching, contact relay, hosted TURN last. Hosted mailbox only for recipients with no node in their circle, ciphertext, 14 days.
16. **Zero-infrastructure mode is the target.** Signaling by contact nodes, mailbox by contact nodes, push by one's own node, apps served by nodes and mirrors.
17. **Self-exit only.** The node is a WireGuard endpoint for its owner's devices. No exit for others, so nobody carries risk for someone else.
18. **Distribution survives a ban.** Signed app bundles, mirrors on any domain, invite links pointing at the inviter's node, node-served installation with a per-node certificate, offline trust-once as a last resort, obfuscated transports as a capability.
19. **Names: many roots, one owner each.** Stewards fund several root domains on the public suffix list holding only delegations. A name is claimed by signing with the identity key; the owner's node answers DNS for it and gets its own certificate. Each subdomain is an independent site and mail domain. Groups delegate names beneath their own.
20. **Mail.** Received by the owner's node, encrypted on arrival. Sent through a stateless relay with a static address run by stewards or a group, accepting only from delegated names. One address for everyone was rejected: it needs a directory, shares one reputation, and is one seizure away from killing every address.

## Apps and the suite

21. **Messenger first, free.** Contacts, calls (already WebRTC; only the locked-screen ring needs the companion), groups, public inbox for journalists.
22. **Vault as its own app.** The wedge: useful alone, drives node adoption and recovery, and pulls friends in through backup contacts. Becomes the passkey provider through the companion.
23. **Identity carrier.** Web passkeys per site, vouching, credentials with selective disclosure, signed records, rail adapters for payments. Authorize, never custody.
24. **Feeds.** Each publisher's node serves a signed feed; paid feeds encrypted to subscribers, paid directly with no cut. Each person's personal feed is their social layer, subscribed by contacts by default. No comments, no counts, no ranking. Discussion goes to the messenger; letters to the author go to the public inbox.
25. **Forum.** Threads hosted by the creator's node, membership by card, optional public reading. The creator is the host; the project hosts nothing.
26. **Page.** The node serving the person's public name.
27. **The rest are ports.** Files, docs, photos, calendar and contacts, maps, location sharing, private resolver.
28. **Further out, with named hard parts.** Personal assistant (permissions before model), health (institutional ends), home hub (sidecar), offline transport (companion), compute with friends (public data only), official credentials and bank recognition (negotiations, for others).

## Business, legal, governance

29. **Nothing is sold.** The USD 24 node price was dropped. A price needs a seller, accounts and records; reciprocity between contacts only works unpriced.
30. **No marketing, no advertising.** Growth by contact card. A plain website, documentation, a changelog, answered questions.
31. **The project avoids regulation by never holding, transmitting to the public, or ranking.** Friends-only posting is a group message. Public publishing makes each person their own publisher. A forum owner is the host of their own room.
32. **Stewardship by press freedom and digital rights organizations.** Precedent: SecureDrop and the Freedom of the Press Foundation. Several stewards, release signing by a three-of-five threshold, the author as first maintainer through the handover. Grants through the stewards (NLnet, OTF, national funds) pay for the audit and the maintainer.
33. **The one paid piece.** The author's private, stateless geolocation engine is sold as a capability on the free node and as stateless APIs and licensed software to companies. Nothing free ever depends on it, and the stewards hold the project to that.
34. **Sequence.** Release to the stewards, let people use it, then build on it as the first developer on the platform rather than its owner.

## Hardening from the scenarios

35. Locked node after boot until the owner's phone unlocks it. Duress gesture and tap-plus-face for vault and carrier. Inheritance with a designated person, 30-day delay and broadcast. Removing a hostile contact retires their share and moves the backup in one action. Organizations get shared namespaces with onboarding and offboarding. Every signature and key carries a version for crypto agility.

## The principle underneath

Trust substitutes exist because systems needed to work between strangers: proof of work, certificate authorities, identity checks. This system never needs a stranger, so it needs no substitute. It runs on the trust people already have, which is abundant, free, distributed, and already robust to the failures that matter. That is why everything kept coming out free.
