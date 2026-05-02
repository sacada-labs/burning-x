import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const userProfiles = sqliteTable("user_profiles", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userId: text("user_id").notNull().unique(),
	birthYear: integer("birth_year"),
	gender: text(), // male, female, other, prefer_not_to_say
	weightKg: real("weight_kg"),
	heightCm: real("height_cm"),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
	assessments: many(planAssessments),
}));

export const trainingPlans = sqliteTable("training_plans", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	description: text(),
	distanceType: text("distance_type").notNull(),
	durationWeeks: integer("duration_weeks").notNull(),
	difficulty: text().notNull().default("beginner"),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const trainingPlansRelations = relations(trainingPlans, ({ many }) => ({
	workouts: many(workouts),
	userPlans: many(userPlans),
}));

export const workouts = sqliteTable("workouts", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	planId: integer("plan_id").notNull(),
	weekNumber: integer("week_number").notNull(),
	dayNumber: integer("day_number").notNull(),
	title: text().notNull(),
	description: text(),
	workoutType: text("workout_type").notNull().default("easy"),
	distanceKm: real("distance_km"),
	durationMinutes: integer("duration_minutes"),
	instructions: text(),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
	plan: one(trainingPlans, {
		fields: [workouts.planId],
		references: [trainingPlans.id],
	}),
	completions: many(workoutCompletions),
}));

export const userPlans = sqliteTable("user_plans", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userId: text("user_id").notNull(),
	planId: integer("plan_id").notNull(),
	startDate: integer("start_date", { mode: "timestamp" }).notNull(),
	status: text().notNull().default("active"),
	fitnessLevel: text("fitness_level").default("beginner"), // beginner, intermediate, advanced (derived from assessment)
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const userPlansRelations = relations(userPlans, ({ one, many }) => ({
	plan: one(trainingPlans, {
		fields: [userPlans.planId],
		references: [trainingPlans.id],
	}),
	completions: many(workoutCompletions),
	assessment: one(planAssessments),
}));

export const planAssessments = sqliteTable("plan_assessments", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userPlanId: integer("user_plan_id").notNull().unique(),
	canRun2kNonstop: integer("can_run_2k_nonstop", { mode: "boolean" }),
	canRun5kNonstop: integer("can_run_5k_nonstop", { mode: "boolean" }),
	canRun5kUnder30: integer("can_run_5k_under_30", { mode: "boolean" }),
	canRun10kNonstop: integer("can_run_10k_nonstop", { mode: "boolean" }),
	recentWeeklyMileage: integer("recent_weekly_mileage"), // km per week
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});

export const planAssessmentsRelations = relations(planAssessments, ({ one }) => ({
	userPlan: one(userPlans, {
		fields: [planAssessments.userPlanId],
		references: [userPlans.id],
	}),
}));

export const workoutCompletions = sqliteTable("workout_completions", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userPlanId: integer("user_plan_id").notNull(),
	workoutId: integer("workout_id").notNull(),
	completedDate: integer("completed_date", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
	// Simplified: just optional effort feedback and notes
	effortFeedback: text("effort_feedback"), // easy, moderate, hard
	notes: text(),
});

export const workoutCompletionsRelations = relations(
	workoutCompletions,
	({ one }) => ({
		userPlan: one(userPlans, {
			fields: [workoutCompletions.userPlanId],
			references: [userPlans.id],
		}),
		workout: one(workouts, {
			fields: [workoutCompletions.workoutId],
			references: [workouts.id],
		}),
	}),
);
