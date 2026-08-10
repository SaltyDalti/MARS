# MARS review Master Configuration Dictionary

Canonical field ids for dynamic JSONB `reviews.responses` and UI routing.
Implementation source: [`src/lib/reviews/master-config.ts`](../src/lib/reviews/master-config.ts).

## Routing rules

1. **Target kind**
   - `organization` → Universal Core + Context (`activity_type` dci|wgi) + Role modules + Section modules (if eligible)
   - `staff` → **Relational Axis** (reviewee role × reviewer relation) + Individual Universal Core
   - `housing_site` → Housing site core (replaces org Universal)

2. **Organization roles** — multi-select checkboxes; each selected role injects its module.

3. **Sections** — only if Performer and/or Instructional Staff selected on an **organization** review. Visual section requires Instructional Staff.

4. **Staff Relational Axis** — before scores render, the form requires:
   1. Target’s primary season role (`staff_reviewee_role`)
   2. Reviewer’s relation to them (`staff_reviewer_relation`)

5. **Closing** — org/housing use top-level `would_recommend`; staff uses `score_indiv_recommend` (Yes/No) inside the universal pack.

6. **Persisted columns**
   - `score_overall` / `score_demand` denormalized from responses
   - `responses` JSONB: `{ [fieldId]: number | boolean }`
   - Org: `reviewer_roles` text[], `sections` text[]
   - Staff: `staff_reviewee_role`, `staff_reviewer_relation`

---

## Organization packs

### A. Universal Core

| Id | Label |
|----|--------|
| score_overall | Overall experience |
| score_environment | Environment |
| score_communication | Communication |
| score_wellness | Wellness |

### B. Context

**dci:** score_dci_food, score_dci_housing, score_dci_travel  
**wgi:** score_wgi_facilities, score_wgi_logistics, score_wgi_financial

### C. Roles / D. Sections

See `ROLE_MODULES` / `SECTION_MODULES` in master-config.ts.

### Housing

score_site_quality, score_site_amenities

---

## Individual (staff) packs

### A. Universal Staff Core (always)

| Id | Type | Prompt |
|----|------|--------|
| score_indiv_conduct | 1–5 | Professional boundaries and emotional regulation |
| score_indiv_comm | 1–5 | Clarity, tone, and timeliness of communication |
| score_indiv_recommend | Yes/No | Want to work with / be taught by this person again? |

### Relational matrix

| Reviewee | Reviewer relation | Fields |
|----------|-------------------|--------|
| **executive** | performer_upward | score_exec_presence, score_exec_culture |
| **executive** | peer_lateral / director_downward | score_exec_support, score_exec_vision |
| **caption_head** | performer_upward | score_head_curriculum, score_head_pacing |
| **caption_head** | peer_lateral (tech) | score_head_delegation, score_head_alignment |
| **instructional_tech** | performer_upward | score_tech_pedagogy, score_tech_feedback |
| **instructional_tech** | peer_lateral / director_downward | score_tech_compliance, score_tech_reliability |
| **design_staff** | any (product focus) | score_design_safety, score_design_achievable |
| **tour_ops_admin** | — | Universal only (packs TBD) |

Dropdown values:

- Reviewee: `executive` · `caption_head` · `instructional_tech` · `design_staff` · `tour_ops_admin`
- Relation: `performer_upward` · `peer_lateral` · `director_downward`
