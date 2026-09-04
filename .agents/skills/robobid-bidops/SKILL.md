---
name: robobid-bidops
description: Domain knowledge and operational guidelines for Korean public procurement (KONEPS, IRIS, TIPA, Bizinfo) and BidOps intelligence in RoboBid AI.
---

# RoboBid AI — Korean Public Procurement BidOps Skill

## Invariants & Rules
1. **Zero Auto-Submission**: Never submit bids or proposals automatically to external portals without human verification and explicit signature confirmation.
2. **Zero Fake Data**: Never populate production DB with artificial/mock opportunity data.
3. **Evidence Citations**: Every claim and technical section in a proposal draft must cite verified items from the Capability Vault or the RFP.
4. **Safe Key Encoding**: Ensure public data service keys are never double URL-encoded (`%25...`).

## Agency Proposal Formats
- **KONEPS (조달청)**: 5 Technical proposal sections (개요, 제안사 현황, 사업수행, 사업관리, 지원부문). Max bonus +3.0 pts.
- **NIPA/NIA**: AI/ICT voucher and field trial project proposals. Technical weight 85%, price 15%. Max bonus +5.0 pts.
- **TIPA/MSS (중기부)**: SME commercialization R&D project plan. Technical weight 90%, price 10%. Max bonus +5.0 pts.
- **IRIS**: Pan-ministerial R&D standard application format.
