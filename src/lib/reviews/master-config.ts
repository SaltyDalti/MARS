/**
 * MARS Master Configuration Dictionary
 * Source of truth for dynamic review JSONB keys and UI routing.
 */

export type ScoreField = {
  id: string;
  label: string;
  description: string;
  min: 1;
  max: 5;
};

export type OrgActivityType = "dci" | "wgi";

export type ReviewTargetKind = "organization" | "staff" | "housing_site";

export type ReviewerRoleId =
  | "performer"
  | "instructional_staff"
  | "design_staff"
  | "admin_tour_ops"
  | "medical_media"
  | "site_host"
  | "vendor";

export type SectionId =
  | "color_guard"
  | "brass_winds"
  | "battery"
  | "front_ensemble"
  | "visual";

function score(
  id: string,
  label: string,
  description: string,
): ScoreField {
  return { id, label, description, min: 1, max: 5 };
}

/** A. Universal Core — org reviews (not staff_profile / housing alt contexts) */
export const UNIVERSAL_CORE: ScoreField[] = [
  score("score_overall", "Overall experience", "Overall experience rating"),
  score(
    "score_environment",
    "Environment",
    "Team cohesion, morale, and ensemble environment",
  ),
  score(
    "score_communication",
    "Communication",
    "Clarity of schedules and general transparency",
  ),
  score(
    "score_wellness",
    "Wellness",
    "Management of injuries, recovery, and medical needs",
  ),
];

/** B. Context modules — by organization activity type */
export const CONTEXT_MODULES: Record<OrgActivityType, ScoreField[]> = {
  dci: [
    score(
      "score_dci_food",
      "Food",
      "Quality and dietary accommodation of food truck",
    ),
    score(
      "score_dci_housing",
      "Housing",
      "Management of gym floors and sleep spaces",
    ),
    score(
      "score_dci_travel",
      "Travel",
      "Safety and organization of fleet/buses",
    ),
  ],
  wgi: [
    score(
      "score_wgi_facilities",
      "Facilities",
      "Quality and consistency of rehearsal gyms",
    ),
    score(
      "score_wgi_logistics",
      "Logistics",
      "Assistance with carpools and local housing",
    ),
    score(
      "score_wgi_financial",
      "Financial clarity",
      "Clarity of dues and absence of hidden costs",
    ),
  ],
};

/** C. Role modules — checkbox multi-select */
export const ROLE_MODULES: Record<ReviewerRoleId, ScoreField[]> = {
  performer: [
    score(
      "score_perf_culture",
      "Feedback culture",
      "Constructive / educational feedback style",
    ),
    score(
      "score_perf_schedule",
      "Schedule integrity",
      "Adherence to sleep minimums and schedules",
    ),
    score(
      "score_perf_demand",
      "Demand & pacing",
      "Physical/mental pacing and expectations",
    ),
  ],
  instructional_staff: [
    score(
      "score_tech_admin",
      "Admin support",
      "Admin support for instructional decisions",
    ),
    score(
      "score_tech_pay",
      "Pay & contracts",
      "Contract integrity and timely payment",
    ),
    score(
      "score_tech_members",
      "Ensemble work ethic",
      "Ensemble receptiveness and work ethic",
    ),
    score(
      "score_tech_creative",
      "Design cohesion",
      "Cohesion with the design team's vision",
    ),
  ],
  design_staff: [
    score(
      "score_design_autonomy",
      "Autonomy",
      "Freedom from admin micromanagement",
    ),
    score(
      "score_design_implementation",
      "Implementation",
      "How well techs cleaned/realized the book",
    ),
    score(
      "score_design_budget",
      "Design budget",
      "Financial resources provided for props/design",
    ),
  ],
  admin_tour_ops: [
    score(
      "score_admin_exec",
      "Executive support",
      "Support from Board of Directors / CEO",
    ),
    score(
      "score_admin_conditions",
      "Working conditions",
      "Respect for admin sleep/workspace limits",
    ),
    score(
      "score_admin_crisis",
      "Crisis response",
      "Handling of emergencies or housing changes",
    ),
  ],
  medical_media: [
    score(
      "score_spec_autonomy",
      "Professional autonomy",
      "Respect for medical/creative autonomy",
    ),
    score(
      "score_spec_resources",
      "Resources",
      "Adequate budget/time for supplies or editing",
    ),
  ],
  site_host: [
    score(
      "score_host_respect",
      "Facility respect",
      "Did the organization leave the facility spotless?",
    ),
    score(
      "score_host_prof",
      "Professionalism",
      "Did admin respect curfews and school rules?",
    ),
  ],
  vendor: [
    score(
      "score_vendor_pay",
      "Payment reliability",
      "Payment reliability and invoice clearing",
    ),
    score(
      "score_vendor_specs",
      "Specs & deadlines",
      "Clarity of design specs and deadlines",
    ),
  ],
};

export const REVIEWER_ROLE_OPTIONS: {
  id: ReviewerRoleId;
  label: string;
}[] = [
  { id: "performer", label: "Performer" },
  { id: "instructional_staff", label: "Instructional staff" },
  { id: "design_staff", label: "Design staff" },
  { id: "admin_tour_ops", label: "Admin / tour ops" },
  { id: "medical_media", label: "Medical / media" },
  { id: "site_host", label: "Site host / venue manager" },
  { id: "vendor", label: "Vendor / contractor" },
];

/** D. Section modules */
export const SECTION_MODULES: Record<SectionId, ScoreField[]> = {
  color_guard: [
    score(
      "score_sect_cg_safety",
      "Guard safety",
      "Choreography/staging safety and physical demand",
    ),
    score(
      "score_sect_cg_equip",
      "Equipment & floor",
      "Equipment/floor logistics and maintenance",
    ),
  ],
  brass_winds: [
    score(
      "score_sect_wind_pedagogy",
      "Wind pedagogy",
      "Consistency of technique instruction",
    ),
    score(
      "score_sect_wind_integration",
      "Visual–musical balance",
      "Balance of visual demand vs. musical responsibilities",
    ),
  ],
  battery: [
    score(
      "score_sect_batt_maint",
      "Instrument upkeep",
      "Dedicated time and resources for tuning/upkeep",
    ),
    score(
      "score_sect_batt_balance",
      "Staff collaboration",
      "Healthy collaborative balance between visual/music staff",
    ),
  ],
  front_ensemble: [
    score(
      "score_sect_front_audio",
      "Audio / synth support",
      "Quality and management of synth/audio tech support",
    ),
    score(
      "score_sect_front_setup",
      "Pit logistics",
      "Logistics of moving the pit in and out of spaces",
    ),
  ],
  visual: [
    score(
      "score_sect_vis_movement",
      "Movement alignment",
      "Alignment between dance/body program and drill/staging",
    ),
    score(
      "score_sect_vis_adapt",
      "Drill adaptation",
      "Effectiveness of modifying drill to fit performer realities",
    ),
  ],
};

export const SECTION_OPTIONS: {
  id: SectionId;
  label: string;
  instructionalOnly?: boolean;
}[] = [
  { id: "color_guard", label: "Color guard" },
  { id: "brass_winds", label: "Brass / winds" },
  { id: "battery", label: "Battery" },
  { id: "front_ensemble", label: "Front ensemble" },
  { id: "visual", label: "Visual", instructionalOnly: true },
];

/** E. Housing alternative context */
export const HOUSING_SITE_CORE: ScoreField[] = [
  score(
    "score_site_quality",
    "Site quality",
    "Safety of gym floors and field conditions",
  ),
  score(
    "score_site_amenities",
    "Amenities",
    "Access to hot water, AC, and parking space",
  ),
];

/** @deprecated Use INDIVIDUAL_STAFF_UNIVERSAL + relational matrix */
export const ALTERNATIVE_CONTEXTS = {
  housing_site: HOUSING_SITE_CORE,
} as const;

// ---------------------------------------------------------------------------
// Individual (staff_profile) — Relational Axis
// ---------------------------------------------------------------------------

export type StaffRevieweeRoleId =
  | "executive"
  | "caption_head"
  | "instructional_tech"
  | "design_staff"
  | "tour_ops_admin";

/** Reviewer's position relative to the individual */
export type StaffReviewerRelationId =
  | "performer_upward"
  | "peer_lateral"
  | "director_downward";

export type BooleanField = {
  kind: "boolean";
  id: string;
  label: string;
  description: string;
};

export type ScoreFieldDef = ScoreField & { kind?: "score" };

export type FieldDef = ScoreFieldDef | BooleanField;

function bool(
  id: string,
  label: string,
  description: string,
): BooleanField {
  return { kind: "boolean", id, label, description };
}

export const STAFF_REVIEWEE_ROLE_OPTIONS: {
  id: StaffRevieweeRoleId;
  label: string;
}[] = [
  {
    id: "executive",
    label: "Executive leadership (CEO, corps director, board)",
  },
  {
    id: "caption_head",
    label: "Caption head / educational lead",
  },
  {
    id: "instructional_tech",
    label: "Instructional staff (tech)",
  },
  {
    id: "design_staff",
    label: "Design staff (arranger, choreographer, drill writer)",
  },
  {
    id: "tour_ops_admin",
    label: "Tour ops / admin",
  },
];

export const STAFF_REVIEWER_RELATION_OPTIONS: {
  id: StaffReviewerRelationId;
  label: string;
}[] = [
  {
    id: "performer_upward",
    label: "Performer / student (upward review)",
  },
  {
    id: "peer_lateral",
    label: "Peer / co-staff (lateral review)",
  },
  {
    id: "director_downward",
    label: "Director / admin (downward review)",
  },
];

/** A. Universal staff core — always for individuals */
export const INDIVIDUAL_STAFF_UNIVERSAL: FieldDef[] = [
  score(
    "score_indiv_conduct",
    "Professional conduct",
    "Maintenance of professional boundaries and emotional regulation",
  ),
  score(
    "score_indiv_comm",
    "Communication",
    "Clarity, tone, and timeliness of communication",
  ),
  bool(
    "score_indiv_recommend",
    "Work with again",
    "Would you want to work with or be taught by this individual again?",
  ),
];

/** B–E Relational modules: reviewee role × reviewer relation */
export const STAFF_RELATIONAL_MODULES: Partial<
  Record<
    StaffRevieweeRoleId,
    Partial<Record<StaffReviewerRelationId, ScoreField[]>>
  >
> = {
  executive: {
    performer_upward: [
      score(
        "score_exec_presence",
        "Presence",
        "Visibility, approachability, and engagement with the membership",
      ),
      score(
        "score_exec_culture",
        "Top-down culture",
        "Fostering a safe, inclusive, and professional top-down culture",
      ),
    ],
    peer_lateral: [
      score(
        "score_exec_support",
        "Staff support",
        "Providing budget, resources, and administrative backing for staff to succeed",
      ),
      score(
        "score_exec_vision",
        "Vision & stability",
        "Clear strategic direction, crisis management, and organizational stability",
      ),
    ],
    director_downward: [
      score(
        "score_exec_support",
        "Staff support",
        "Providing budget, resources, and administrative backing for staff to succeed",
      ),
      score(
        "score_exec_vision",
        "Vision & stability",
        "Clear strategic direction, crisis management, and organizational stability",
      ),
    ],
  },
  caption_head: {
    performer_upward: [
      score(
        "score_head_curriculum",
        "Curriculum",
        "Quality and consistency of the overall educational program for the section",
      ),
      score(
        "score_head_pacing",
        "Rehearsal pacing",
        "Efficient management of ensemble block rehearsals without causing burnout",
      ),
    ],
    // Tech (peer/subordinate) reviewing their caption head
    peer_lateral: [
      score(
        "score_head_delegation",
        "Delegation",
        "Empowering techs to teach rather than micromanaging the floor",
      ),
      score(
        "score_head_alignment",
        "Staff alignment",
        "Clear communication of daily goals and technique to the rest of the staff",
      ),
    ],
    // Director→caption head not yet specified — universal core only
  },
  instructional_tech: {
    performer_upward: [
      score(
        "score_tech_pedagogy",
        "Pedagogy",
        "Clarity in breaking down concepts and demonstrating technique",
      ),
      score(
        "score_tech_feedback",
        "Feedback quality",
        "Delivering actionable, constructive critique instead of emotional/reactive feedback",
      ),
    ],
    peer_lateral: [
      score(
        "score_tech_compliance",
        "Curriculum compliance",
        "Teaching the agreed-upon curriculum without going rogue or contradicting the lead",
      ),
      score(
        "score_tech_reliability",
        "Reliability",
        "Punctuality, attendance, and adherence to the rehearsal schedule",
      ),
    ],
    director_downward: [
      score(
        "score_tech_compliance",
        "Curriculum compliance",
        "Teaching the agreed-upon curriculum without going rogue or contradicting the lead",
      ),
      score(
        "score_tech_reliability",
        "Reliability",
        "Punctuality, attendance, and adherence to the rehearsal schedule",
      ),
    ],
  },
  design_staff: {
    performer_upward: [
      score(
        "score_design_safety",
        "Written safety",
        "Drill/choreography/staging written with physical safety in mind",
      ),
      score(
        "score_design_achievable",
        "Achievability",
        "Written appropriately for the ensemble's talent level without constant mid-season rewrites",
      ),
    ],
    // Product-focused metrics also useful for peers / leads evaluating the book
    peer_lateral: [
      score(
        "score_design_safety",
        "Written safety",
        "Drill/choreography/staging written with physical safety in mind",
      ),
      score(
        "score_design_achievable",
        "Achievability",
        "Written appropriately for the ensemble's talent level without constant mid-season rewrites",
      ),
    ],
    director_downward: [
      score(
        "score_design_safety",
        "Written safety",
        "Drill/choreography/staging written with physical safety in mind",
      ),
      score(
        "score_design_achievable",
        "Achievability",
        "Written appropriately for the ensemble's talent level without constant mid-season rewrites",
      ),
    ],
  },
  // Tour ops / admin: relational packs not fully specified — universal core only for now
  tour_ops_admin: {},
};

export type QuestionGroup = {
  id: string;
  title: string;
  fields: FieldDef[];
};

export type ResolveInput = {
  targetKind: ReviewTargetKind;
  activityType?: OrgActivityType | null;
  /** Organization review: multi-select roles */
  roles: ReviewerRoleId[];
  sections: SectionId[];
  /** Staff profile relational axis */
  staffRevieweeRole?: StaffRevieweeRoleId | null;
  staffReviewerRelation?: StaffReviewerRelationId | null;
};

/**
 * Build ordered question groups for the review wizard.
 */
export function resolveQuestionGroups(input: ResolveInput): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const roles = [...new Set(input.roles)];
  const sections = [...new Set(input.sections)];

  if (input.targetKind === "staff") {
    groups.push({
      id: "individual_universal",
      title: "Professional core",
      fields: INDIVIDUAL_STAFF_UNIVERSAL,
    });

    const reviewee = input.staffRevieweeRole;
    const relation = input.staffReviewerRelation;
    if (reviewee && relation) {
      const relational =
        STAFF_RELATIONAL_MODULES[reviewee]?.[relation] ?? [];
      if (relational.length) {
        const revieweeLabel =
          STAFF_REVIEWEE_ROLE_OPTIONS.find((o) => o.id === reviewee)?.label ??
          reviewee;
        groups.push({
          id: `staff_rel_${reviewee}_${relation}`,
          title: revieweeLabel,
          fields: relational,
        });
      }
    }

    return groups;
  }

  if (input.targetKind === "housing_site") {
    groups.push({
      id: "housing_site",
      title: "Housing site",
      fields: HOUSING_SITE_CORE,
    });
    return groups;
  }

  groups.push({
    id: "universal_core",
    title: "Core experience",
    fields: UNIVERSAL_CORE,
  });

  if (input.activityType && CONTEXT_MODULES[input.activityType]) {
    groups.push({
      id: `context_${input.activityType}`,
      title:
        input.activityType === "dci"
          ? "Drum corps context"
          : "Winter guard context",
      fields: CONTEXT_MODULES[input.activityType],
    });
  }

  for (const role of roles) {
    const fields = ROLE_MODULES[role];
    if (fields?.length) {
      groups.push({
        id: `role_${role}`,
        title:
          REVIEWER_ROLE_OPTIONS.find((r) => r.id === role)?.label ?? role,
        fields,
      });
    }
  }

  const allowSections =
    roles.includes("performer") || roles.includes("instructional_staff");

  if (allowSections) {
    for (const section of sections) {
      if (section === "visual" && !roles.includes("instructional_staff")) {
        continue;
      }
      const fields = SECTION_MODULES[section];
      if (fields?.length) {
        groups.push({
          id: `section_${section}`,
          title:
            SECTION_OPTIONS.find((s) => s.id === section)?.label ?? section,
          fields,
        });
      }
    }
  }

  return groups;
}

export function flattenScoreFields(groups: QuestionGroup[]): ScoreField[] {
  const seen = new Set<string>();
  const out: ScoreField[] = [];
  for (const group of groups) {
    for (const field of group.fields) {
      if (field.kind === "boolean") continue;
      if (!seen.has(field.id)) {
        seen.add(field.id);
        out.push(field);
      }
    }
  }
  return out;
}

export function flattenBooleanFields(groups: QuestionGroup[]): BooleanField[] {
  const seen = new Set<string>();
  const out: BooleanField[] = [];
  for (const group of groups) {
    for (const field of group.fields) {
      if (field.kind !== "boolean") continue;
      if (!seen.has(field.id)) {
        seen.add(field.id);
        out.push(field);
      }
    }
  }
  return out;
}

export function isReviewerRoleId(value: string): value is ReviewerRoleId {
  return value in ROLE_MODULES;
}

export function isSectionId(value: string): value is SectionId {
  return value in SECTION_MODULES;
}

export function isOrgActivityType(value: string): value is OrgActivityType {
  return value === "dci" || value === "wgi";
}

export function isStaffRevieweeRoleId(
  value: string,
): value is StaffRevieweeRoleId {
  return STAFF_REVIEWEE_ROLE_OPTIONS.some((o) => o.id === value);
}

export function isStaffReviewerRelationId(
  value: string,
): value is StaffReviewerRelationId {
  return STAFF_REVIEWER_RELATION_OPTIONS.some((o) => o.id === value);
}
