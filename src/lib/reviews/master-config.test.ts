import { describe, expect, it } from "vitest";
import {
  flattenBooleanFields,
  flattenScoreFields,
  resolveQuestionGroups,
} from "@/lib/reviews/master-config";
import { validateDynamicReview } from "@/lib/reviews/validate-dynamic";

describe("resolveQuestionGroups", () => {
  it("builds DCI org pack with performer + battery", () => {
    const groups = resolveQuestionGroups({
      targetKind: "organization",
      activityType: "dci",
      roles: ["performer"],
      sections: ["battery"],
    });
    const ids = flattenScoreFields(groups).map((f) => f.id);
    expect(ids).toContain("score_overall");
    expect(ids).toContain("score_dci_food");
    expect(ids).toContain("score_perf_demand");
    expect(ids).toContain("score_sect_batt_maint");
    expect(ids).not.toContain("score_wgi_facilities");
  });

  it("routes staff executive × performer to presence/culture", () => {
    const groups = resolveQuestionGroups({
      targetKind: "staff",
      roles: [],
      sections: [],
      staffRevieweeRole: "executive",
      staffReviewerRelation: "performer_upward",
    });
    const ids = flattenScoreFields(groups).map((f) => f.id);
    expect(ids).toContain("score_indiv_conduct");
    expect(ids).toContain("score_exec_presence");
    expect(ids).toContain("score_exec_culture");
    expect(ids).not.toContain("score_exec_vision");
    expect(ids).not.toContain("score_tech_pedagogy");
    expect(flattenBooleanFields(groups).map((f) => f.id)).toContain(
      "score_indiv_recommend",
    );
  });

  it("routes staff tech × performer to pedagogy, not exec vision", () => {
    const groups = resolveQuestionGroups({
      targetKind: "staff",
      roles: [],
      sections: [],
      staffRevieweeRole: "instructional_tech",
      staffReviewerRelation: "performer_upward",
    });
    const ids = flattenScoreFields(groups).map((f) => f.id);
    expect(ids).toContain("score_tech_pedagogy");
    expect(ids).toContain("score_tech_feedback");
    expect(ids).not.toContain("score_exec_presence");
  });

  it("routes caption head × peer to delegation pack", () => {
    const groups = resolveQuestionGroups({
      targetKind: "staff",
      roles: [],
      sections: [],
      staffRevieweeRole: "caption_head",
      staffReviewerRelation: "peer_lateral",
    });
    const ids = flattenScoreFields(groups).map((f) => f.id);
    expect(ids).toContain("score_head_delegation");
    expect(ids).not.toContain("score_head_curriculum");
  });

  it("hides visual section without instructional staff", () => {
    const groups = resolveQuestionGroups({
      targetKind: "organization",
      activityType: "wgi",
      roles: ["performer"],
      sections: ["visual", "color_guard"],
    });
    const ids = flattenScoreFields(groups).map((f) => f.id);
    expect(ids).toContain("score_sect_cg_safety");
    expect(ids).not.toContain("score_sect_vis_movement");
  });
});

describe("validateDynamicReview", () => {
  it("accepts a complete DCI performer payload", () => {
    const groups = resolveQuestionGroups({
      targetKind: "organization",
      activityType: "dci",
      roles: ["performer"],
      sections: [],
    });
    const responses: Record<string, number> = {};
    for (const field of flattenScoreFields(groups)) {
      responses[field.id] = 4;
    }
    const result = validateDynamicReview(
      {
        target_type: "organization",
        target_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        season_year: 2024,
        activity_type: "dci",
        reviewer_roles: ["performer"],
        sections: [],
        responses,
        would_recommend: true,
        written_feedback: "Solid",
        tags: [],
      },
      2026,
    );
    expect(result.ok).toBe(true);
  });

  it("accepts staff relational payload and maps recommend boolean", () => {
    const groups = resolveQuestionGroups({
      targetKind: "staff",
      roles: [],
      sections: [],
      staffRevieweeRole: "executive",
      staffReviewerRelation: "peer_lateral",
    });
    const responses: Record<string, number | boolean> = {};
    for (const field of flattenScoreFields(groups)) {
      responses[field.id] = 4;
    }
    for (const field of flattenBooleanFields(groups)) {
      responses[field.id] = true;
    }
    const result = validateDynamicReview(
      {
        target_type: "staff",
        target_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        season_year: 2025,
        reviewer_roles: [],
        sections: [],
        staff_reviewee_role: "executive",
        staff_reviewer_relation: "peer_lateral",
        responses,
        would_recommend: false,
        written_feedback: null,
        tags: [],
      },
      2026,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.would_recommend).toBe(true);
      expect(result.data.responses.score_exec_vision).toBe(4);
    }
  });

  it("rejects staff reviews without relational axis", () => {
    const result = validateDynamicReview(
      {
        target_type: "staff",
        target_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        season_year: 2025,
        reviewer_roles: [],
        sections: [],
        responses: {},
        would_recommend: true,
        written_feedback: null,
        tags: [],
      },
      2026,
    );
    expect(result.ok).toBe(false);
  });
});
