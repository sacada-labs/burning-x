import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

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
}));

export const workoutCompletions = sqliteTable("workout_completions", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	userPlanId: integer("user_plan_id").notNull(),
	workoutId: integer("workout_id").notNull(),
	completedDate: integer("completed_date", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
	actualDistanceKm: real("actual_distance_km"),
	actualDurationMinutes: integer("actual_duration_minutes"),
	actualPacePerKm: real("actual_pace_per_km"),
	notes: text(),
	perceivedEffort: integer("perceived_effort"),
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
