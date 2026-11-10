# $yllabus — prototype trust and compliance checklist

**Status:** Educational, demo-only prototype. Not legal advice or a launch-readiness certification.
**Reviewed:** 2026-11-09. Review again before publishing to real students or adding live financial or communications features.

| Risk shown in the reference | Current $yllabus demo | Before a real release |
|---|---|---|
| 1. Age and children's privacy | Intended 18+; signup has self-attestation, not identity/age verification. Guest demo is available. | Review audience and COPPA/child privacy requirements, age screening and data collection with counsel. 18+ checkbox alone is not an age-verification system. |
| 2. Auto-renew subscriptions | No subscriptions, renewal charges or checkout. | If added, show terms, prices, renewal notices and easy cancellation before purchase; review applicable state and federal law. |
| 3. Holding/moving money | Only fictional, browser-local balances; no actual payment processing, lending, settlement or custody. | Obtain qualified payments regulatory advice and required bank/payment partners before moving money or offering credit. |
| 4. Calling the app a bank | Product is a school fintech *prototype*, not a bank or FDIC-insured deposit product. | Avoid regulated terms or misleading representations without proper authorization. Review card graphics and copy. |
| 5. Image uploads and DMCA | Public profile-photo uploads are not part of the demo; sample student card images are fictional. Optional image-use choice should not gate signup. | Build takedown/reporting, copyrights/permissions and actual provider disclosure; determine whether a DMCA agent registration is appropriate before offering public hosted user content. |
| 6. Promotional SMS | No promotional texting is implemented. | Collect required consent and honor opt-outs before any marketing SMS; review TCPA and state laws. |
| 7. Privacy policy | Public prototype privacy explanation at /privacy; import snapshots may be stored but raw PDFs are read locally. | Verify all actual data categories, providers, access/deletion processes, operator identity, contact address, retention, applicable state rules, and a counsel-reviewed privacy policy before launch. |
| 8. Founders' 83(b) tax elections | Founders' equity/tax filings are not app features. | If founders receive restricted equity, ask a qualified tax advisor about any 83(b) election deadline, eligibility and proof of filing. |

## Authentication decision for demo

- New registration limited to email addresses *formatted* as `@aamu.edu` (exact domain, case-insensitive), with 18+ attestation, privacy-policy acceptance and optional image-use preference.
- Email **format/domain does not confirm mailbox ownership or current AAMU enrollment**. Never display `verified student` or `AAMU-verified` based on auto-confirmed email settings.
- The originally implemented six-digit OTP is not deliverable until a transactional email sender is configured; it currently makes signup impossible.
- A database trigger migration is pending **explicit authorization** before changing live account creation. Do not declare signup functional until migration, app UI and actual signup/login/signout testing all succeed.
- Do not create real tuition payment, financial custody, savings yields, subscriptions, image uploads or marketing messages as part of demo signup.
