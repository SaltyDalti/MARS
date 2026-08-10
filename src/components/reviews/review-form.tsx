"use client";

import { useActionState, useMemo, useState } from "react";
import { createReview, type ReviewActionState } from "@/lib/reviews/actions";
import {
  REVIEWER_ROLE_OPTIONS,
  SECTION_OPTIONS,
  STAFF_REVIEWEE_ROLE_OPTIONS,
  STAFF_REVIEWER_RELATION_OPTIONS,
  resolveQuestionGroups,
  type OrgActivityType,
  type ReviewTargetKind,
  type ReviewerRoleId,
  type SectionId,
  type StaffRevieweeRoleId,
  type StaffReviewerRelationId,
} from "@/lib/reviews/master-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ReviewActionState = {};

type Props = {
  targetType: ReviewTargetKind;
  targetId: string;
  targetLabel: string;
  activityType?: OrgActivityType | null;
};

export function ReviewForm({
  targetType,
  targetId,
  targetLabel,
  activityType = null,
}: Props) {
  const [state, action, pending] = useActionState(createReview, initial);
  const [roles, setRoles] = useState<ReviewerRoleId[]>([]);
  const [sections, setSections] = useState<SectionId[]>([]);
  const [staffRevieweeRole, setStaffRevieweeRole] =
    useState<StaffRevieweeRoleId | "">("");
  const [staffReviewerRelation, setStaffReviewerRelation] =
    useState<StaffReviewerRelationId | "">("");
  const year = new Date().getFullYear();
  const isStaff = targetType === "staff";

  const showSections =
    targetType === "organization" &&
    (roles.includes("performer") || roles.includes("instructional_staff"));

  const staffAxisReady =
    !isStaff || (Boolean(staffRevieweeRole) && Boolean(staffReviewerRelation));

  const groups = useMemo(() => {
    if (isStaff && !staffAxisReady) return [];
    return resolveQuestionGroups({
      targetKind: targetType,
      activityType: targetType === "organization" ? activityType : null,
      roles: isStaff ? [] : roles,
      sections: showSections ? sections : [],
      staffRevieweeRole: isStaff
        ? (staffRevieweeRole as StaffRevieweeRoleId)
        : null,
      staffReviewerRelation: isStaff
        ? (staffReviewerRelation as StaffReviewerRelationId)
        : null,
    });
  }, [
    targetType,
    activityType,
    roles,
    sections,
    showSections,
    isStaff,
    staffAxisReady,
    staffRevieweeRole,
    staffReviewerRelation,
  ]);

  function toggleRole(role: ReviewerRoleId) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role],
    );
  }

  function toggleSection(section: SectionId) {
    setSections((current) =>
      current.includes(section)
        ? current.filter((s) => s !== section)
        : [...current, section],
    );
  }

  const canSubmit = isStaff
    ? staffAxisReady
    : targetType === "housing_site" || roles.length > 0;

  return (
    <form action={action} className="flex max-w-lg flex-col gap-8">
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      {activityType ? (
        <input type="hidden" name="activity_type" value={activityType} />
      ) : null}
      {!isStaff &&
        roles.map((role) => (
          <input key={role} type="hidden" name="reviewer_roles" value={role} />
        ))}
      {showSections &&
        sections.map((section) => (
          <input
            key={section}
            type="hidden"
            name="sections"
            value={section}
          />
        ))}
      {isStaff && staffRevieweeRole ? (
        <input
          type="hidden"
          name="staff_reviewee_role"
          value={staffRevieweeRole}
        />
      ) : null}
      {isStaff && staffReviewerRelation ? (
        <input
          type="hidden"
          name="staff_reviewer_relation"
          value={staffReviewerRelation}
        />
      ) : null}

      <p className="text-sm text-muted-foreground">
        Reviewing <span className="text-foreground">{targetLabel}</span>
        {activityType ? (
          <>
            {" "}
            · <span className="uppercase tracking-wide">{activityType}</span>
          </>
        ) : null}
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="season_year">Season year</Label>
        <Input
          id="season_year"
          name="season_year"
          type="number"
          defaultValue={year}
          min={1970}
          max={year + 1}
          required
        />
      </div>

      {isStaff ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="staff_reviewee_role">
              What was this individual’s primary role during this season?
            </Label>
            <select
              id="staff_reviewee_role"
              className="border-input bg-background h-10 rounded-lg border px-3 text-sm"
              value={staffRevieweeRole}
              onChange={(e) =>
                setStaffRevieweeRole(e.target.value as StaffRevieweeRoleId | "")
              }
              required
            >
              <option value="">Select role…</option>
              {STAFF_REVIEWEE_ROLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="staff_reviewer_relation">
              What was your role relative to them?
            </Label>
            <select
              id="staff_reviewer_relation"
              className="border-input bg-background h-10 rounded-lg border px-3 text-sm"
              value={staffReviewerRelation}
              onChange={(e) =>
                setStaffReviewerRelation(
                  e.target.value as StaffReviewerRelationId | "",
                )
              }
              required
            >
              <option value="">Select relationship…</option>
              {STAFF_REVIEWER_RELATION_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : targetType === "organization" ? (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">
              Your role(s) that season
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {REVIEWER_ROLE_OPTIONS.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={roles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          {showSections ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Section(s)</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SECTION_OPTIONS.map((section) => {
                  if (
                    section.instructionalOnly &&
                    !roles.includes("instructional_staff")
                  ) {
                    return null;
                  }
                  return (
                    <label
                      key={section.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={sections.includes(section.id)}
                        onChange={() => toggleSection(section.id)}
                      />
                      {section.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </>
      ) : null}

      {!canSubmit ? (
        <p className="text-sm text-muted-foreground">
          {isStaff
            ? "Answer the two relationship questions to load the right metrics."
            : "Select at least one role to load score dimensions."}
        </p>
      ) : (
        groups.map((group) => (
          <fieldset key={group.id} className="flex flex-col gap-4">
            <legend className="font-heading text-lg font-semibold tracking-tight">
              {group.title}
            </legend>
            {group.fields.map((field) =>
              field.kind === "boolean" ? (
                <fieldset key={field.id} className="flex flex-col gap-2">
                  <legend className="text-sm font-medium">{field.label}</legend>
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`response__${field.id}`}
                      value="true"
                      defaultChecked
                      required
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`response__${field.id}`}
                      value="false"
                    />
                    No
                  </label>
                </fieldset>
              ) : (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <Label htmlFor={field.id}>{field.label} (1–5)</Label>
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                  <Input
                    id={field.id}
                    name={`response__${field.id}`}
                    type="number"
                    min={field.min}
                    max={field.max}
                    defaultValue={3}
                    required
                  />
                </div>
              ),
            )}
          </fieldset>
        ))
      )}

      {!isStaff ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Would recommend?</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="would_recommend"
              value="true"
              defaultChecked
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="would_recommend" value="false" />
            No
          </label>
        </fieldset>
      ) : (
        <input type="hidden" name="would_recommend" value="true" />
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="written_feedback">Written feedback</Label>
        <textarea
          id="written_feedback"
          name="written_feedback"
          rows={5}
          className="border-input bg-background focus-visible:ring-ring flex w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || !canSubmit}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Reviews cannot be edited after submit. They appear publicly after
        moderation.
      </p>
    </form>
  );
}
