import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { db } from "#/db/index.ts";
import {
	trainingPlans,
	workouts,
	userPlans,
	workoutCompletions,
} from "#/db/schema.ts";
import { getSession } from "./session.ts";

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

export const enrollInPlan = createServerFn({
	method: "POST",
})
	.inputValidator((planId: number) => planId)
	.handler(async ({ data: planId }) => {
		const session = await getSession();
		if (!session?.user) throw new Error("Not authenticated");

		// Check if already enrolled in this plan
		const existing = await db.query.userPlans.findFirst({
			where: and(
				eq(userPlans.userId, session.user.id),
				eq(userPlans.planId, planId),
				eq(userPlans.status, "active"),
			),
		});

		if (existing) throw new Error("Already enrolled in this plan");

		// Deactivate any other active plans
		await db
			.update(userPlans)
			.set({ status: "abandoned" })
			.where(
				and(
					eq(userPlans.userId, session.user.id),
					eq(userPlans.status, "active"),
				),
			);

		// Create new user plan
		const [userPlan] = await db
			.insert(userPlans)
			.values({
				userId: session.user.id,
				planId,
				startDate: new Date(),
				status: "active",
			})
			.returning();

		return userPlan;
	});

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

		return {
			userPlan,
			workouts: planWorkouts.map((w) => ({
				...w,
				completed: completedWorkoutIds.has(w.id),
			})),
		};
	});

export const completeWorkout = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			userPlanId: number;
			workoutId: number;
			actualDistanceKm?: number;
			actualDurationMinutes?: number;
			notes?: string;
			perceivedEffort?: number;
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

		// Calculate pace if both distance and duration provided
		let pace: number | null = null;
		if (
			data.actualDistanceKm &&
			data.actualDistanceKm > 0 &&
			data.actualDurationMinutes
		) {
			pace = data.actualDurationMinutes / data.actualDistanceKm;
		}

		const [completion] = await db
			.insert(workoutCompletions)
			.values({
				userPlanId: data.userPlanId,
				workoutId: data.workoutId,
				actualDistanceKm: data.actualDistanceKm ?? null,
				actualDurationMinutes: data.actualDurationMinutes ?? null,
				actualPacePerKm: pace,
				notes: data.notes ?? null,
				perceivedEffort: data.perceivedEffort ?? null,
			})
			.returning();

		return completion;
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
