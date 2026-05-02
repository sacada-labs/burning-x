import { createServerFn } from "@tanstack/react-start";
import { eq, and, sql } from "drizzle-orm";
import { db } from "#/db/index.ts";
import {
	trainingPlans,
	workouts,
	userPlans,
	workoutCompletions,
	userProfiles,
	planAssessments,
} from "#/db/schema.ts";
import { getSession } from "./session.ts";

// ─── Training Plans ───────────────────────────────────────────────

export const getTrainingPlans = createServerFn({
	method: "GET",
}).handler(async () => {
	return db.query.trainingPlans.findMany({
		orderBy: (plans, { asc }) => [asc(plans.id)],
	});
});

export const getTrainingPlan = createServerFn({
	method: "GET",
})
	.inputValidator((planId: number) => planId)
	.handler(async ({ data: planId }) => {
		const plan = await db.query.trainingPlans.findFirst({
			where: eq(trainingPlans.id, planId),
		});
		if (!plan) throw new Error("Plan not found");

		const planWorkouts = await db.query.workouts.findMany({
			where: eq(workouts.planId, planId),
			orderBy: (workouts, { asc }) => [
				asc(workouts.weekNumber),
				asc(workouts.dayNumber),
			],
		});

		return { plan, workouts: planWorkouts };
	});

// ─── User Profile / Onboarding ────────────────────────────────────

export const getUserProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getSession();
	if (!session?.user) return null;

	return db.query.userProfiles.findFirst({
		where: eq(userProfiles.userId, session.user.id),
	});
});

export const saveUserProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			birthYear?: number;
			gender?: string;
			weightKg?: number;
			heightCm?: number;
		}) => data,
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		const existing = await db.query.userProfiles.findFirst({
			where: eq(userProfiles.userId, session.user.id),
		});

		if (existing) {
			await db
				.update(userProfiles)
				.set({
					birthYear: data.birthYear ?? existing.birthYear,
					gender: data.gender ?? existing.gender,
					weightKg: data.weightKg ?? existing.weightKg,
					heightCm: data.heightCm ?? existing.heightCm,
					updatedAt: new Date(),
				})
				.where(eq(userProfiles.id, existing.id));
			return existing.id;
		}

		const [profile] = await db
			.insert(userProfiles)
			.values({
				userId: session.user.id,
				birthYear: data.birthYear ?? null,
				gender: data.gender ?? null,
				weightKg: data.weightKg ?? null,
				heightCm: data.heightCm ?? null,
			})
			.returning();

		return profile.id;
	});

// ─── Active Plan ──────────────────────────────────────────────────

export const getUserActivePlan = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getSession();
	if (!session?.user) return null;

	return db.query.userPlans.findFirst({
		where: and(
			eq(userPlans.userId, session.user.id),
			eq(userPlans.status, "active"),
		),
		with: {
			plan: true,
		},
	});
});

// ─── Enrollment with Assessment ───────────────────────────────────

export const enrollInPlan = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			planId: number;
			trainingDaysPerWeek?: number;
			assessment: {
				canRun2kNonstop?: boolean;
				canRun5kNonstop?: boolean;
				canRun5kUnder30?: boolean;
				canRun10kNonstop?: boolean;
				recentWeeklyMileage?: number;
			};
		}) => data,
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		// Check if already enrolled in this plan
		const existing = await db.query.userPlans.findFirst({
			where: and(
				eq(userPlans.userId, session.user.id),
				eq(userPlans.planId, data.planId),
				eq(userPlans.status, "active"),
			),
		});

		if (existing) throw new Error("Already enrolled in this plan");

		// Derive fitness level from assessment
		let fitnessLevel = "beginner";
		const a = data.assessment;
		if (a.canRun10kNonstop) {
			fitnessLevel = "advanced";
		} else if (a.canRun5kUnder30 || a.canRun5kNonstop) {
			fitnessLevel = "intermediate";
		}

		// Create new user plan
		const [userPlan] = await db
			.insert(userPlans)
			.values({
				userId: session.user.id,
				planId: data.planId,
				startDate: new Date(),
				status: "active",
				fitnessLevel,
				trainingDaysPerWeek: data.trainingDaysPerWeek ?? 3,
			})
			.returning();

		// Save assessment
		await db.insert(planAssessments).values({
			userPlanId: userPlan.id,
			canRun2kNonstop: a.canRun2kNonstop ?? null,
			canRun5kNonstop: a.canRun5kNonstop ?? null,
			canRun5kUnder30: a.canRun5kUnder30 ?? null,
			canRun10kNonstop: a.canRun10kNonstop ?? null,
			recentWeeklyMileage: a.recentWeeklyMileage ?? null,
		});

		return userPlan;
	});

// ─── Schedule ─────────────────────────────────────────────────────

function getStartWeek(
	fitnessLevel: string | null,
	durationWeeks: number,
): number {
	if (fitnessLevel === "advanced") {
		return Math.max(1, Math.ceil(durationWeeks * 0.4));
	}
	if (fitnessLevel === "intermediate") {
		return Math.max(1, Math.ceil(durationWeeks * 0.2));
	}
	return 1;
}

export const getUserPlanSchedule = createServerFn({
	method: "GET",
})
	.inputValidator((userPlanId: number) => userPlanId)
	.handler(async ({ data: userPlanId }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		const userPlan = await db.query.userPlans.findFirst({
			where: and(
				eq(userPlans.id, userPlanId),
				eq(userPlans.userId, session.user.id),
			),
			with: {
				plan: true,
			},
		});

		if (!userPlan) throw new Error("Plan not found");

		const startWeek = getStartWeek(
			userPlan.fitnessLevel,
			userPlan.plan.durationWeeks,
		);

		const planWorkouts = await db.query.workouts.findMany({
			where: eq(workouts.planId, userPlan.planId),
			orderBy: (workouts, { asc }) => [
				asc(workouts.weekNumber),
				asc(workouts.dayNumber),
			],
		});

		const completions = await db.query.workoutCompletions.findMany({
			where: eq(workoutCompletions.userPlanId, userPlanId),
		});

		const completedWorkoutIds = new Set(completions.map((c) => c.workoutId));
		const completionMap = new Map(completions.map((c) => [c.workoutId, c]));

		const enrichedWorkouts = planWorkouts.map((w) => ({
			...w,
			completed: completedWorkoutIds.has(w.id),
			completion: completionMap.get(w.id) ?? null,
		}));

		return {
			userPlan,
			startWeek,
			workouts: enrichedWorkouts,
		};
	});

// ─── Complete Workout (simplified) ────────────────────────────────

export const completeWorkout = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			userPlanId: number;
			workoutId: number;
			effortFeedback?: "easy" | "moderate" | "hard";
		}) => data,
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		const userPlan = await db.query.userPlans.findFirst({
			where: and(
				eq(userPlans.id, data.userPlanId),
				eq(userPlans.userId, session.user.id),
			),
		});

		if (!userPlan) throw new Error("Plan not found");

		const existing = await db.query.workoutCompletions.findFirst({
			where: and(
				eq(workoutCompletions.userPlanId, data.userPlanId),
				eq(workoutCompletions.workoutId, data.workoutId),
			),
		});

		if (existing) {
			await db
				.update(workoutCompletions)
				.set({ effortFeedback: data.effortFeedback ?? null })
				.where(eq(workoutCompletions.id, existing.id));
			return existing;
		}

		const [completion] = await db
			.insert(workoutCompletions)
			.values({
				userPlanId: data.userPlanId,
				workoutId: data.workoutId,
				effortFeedback: data.effortFeedback ?? null,
			})
			.returning();

		return completion;
	});

export const uncompleteWorkout = createServerFn({
	method: "POST",
})
	.inputValidator((data: { userPlanId: number; workoutId: number }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		await db
			.delete(workoutCompletions)
			.where(
				and(
					eq(workoutCompletions.userPlanId, data.userPlanId),
					eq(workoutCompletions.workoutId, data.workoutId),
				),
			);
	});

export const updateWorkoutEffort = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			userPlanId: number;
			workoutId: number;
			effortFeedback?: "easy" | "moderate" | "hard";
		}) => data,
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		await db
			.update(workoutCompletions)
			.set({ effortFeedback: data.effortFeedback ?? null })
			.where(
				and(
					eq(workoutCompletions.userPlanId, data.userPlanId),
					eq(workoutCompletions.workoutId, data.workoutId),
				),
			);
	});

export const unenrollFromPlan = createServerFn({
	method: "POST",
})
	.inputValidator((userPlanId: number) => userPlanId)
	.handler(async ({ data: userPlanId }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		await db
			.update(userPlans)
			.set({ status: "abandoned" })
			.where(
				and(
					eq(userPlans.id, userPlanId),
					eq(userPlans.userId, session.user.id),
				),
			);
	});

export const getUserPlanHistory = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getSession();
	if (!session?.user) return [];
	return db.query.userPlans.findMany({
		where: eq(userPlans.userId, session.user.id),
		with: { plan: true },
		orderBy: (plans, { desc }) => [desc(plans.createdAt)],
	});
});

export const getActivePlanCount = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getSession();
	if (!session?.user) return 0;
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(userPlans)
		.where(
			and(
				eq(userPlans.userId, session.user.id),
				eq(userPlans.status, "active"),
			),
		);
	return result[0]?.count ?? 0;
});

export const getWorkoutCompletion = createServerFn({
	method: "GET",
})
	.inputValidator((data: { userPlanId: number; workoutId: number }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		return db.query.workoutCompletions.findFirst({
			where: and(
				eq(workoutCompletions.userPlanId, data.userPlanId),
				eq(workoutCompletions.workoutId, data.workoutId),
			),
		});
	});
