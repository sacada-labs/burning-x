import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	getUserActivePlan,
	getUserPlanSchedule,
	completeWorkout,
	uncompleteWorkout,
	updateWorkoutEffort,
} from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { useState, useCallback } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/schedule")({
	component: SchedulePage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({ to: "/auth" });
		}
		const activePlan = await getUserActivePlan();
		if (!activePlan) return { activePlan: null, schedule: null };

		const schedule = await getUserPlanSchedule({ data: activePlan.id });
		return { activePlan, schedule };
	},
});

const distanceLabels: Record<string, string> = {
	"5k": "5K",
	"10k": "10K",
	half_marathon: "Half Marathon",
	marathon: "Marathon",
};

function formatPace(
	distanceKm: number | null,
	durationMin: number | null,
): string {
	if (!distanceKm || !durationMin || distanceKm <= 0) return "";
	const pace = durationMin / distanceKm;
	const m = Math.floor(pace);
	const s = Math.round((pace - m) * 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

function rowTitle(w: {
	workoutType: string;
	distanceKm: number | null;
	durationMinutes: number | null;
	title: string;
}): string {
	if (w.workoutType === "rest") return "Rest Day";
	const parts: string[] = [];
	if (w.distanceKm) parts.push(`${w.distanceKm}K`);
	if (w.durationMinutes) parts.push(`${w.durationMinutes}m`);
	const pace =
		w.distanceKm && w.durationMinutes
			? formatPace(w.distanceKm, w.durationMinutes)
			: "";
	if (pace) parts.push(pace);
	return parts.join(" / ") || w.title;
}

type WorkoutItem = {
	id: number;
	weekNumber: number;
	dayNumber: number;
	title: string;
	workoutType: string;
	distanceKm: number | null;
	durationMinutes: number | null;
	instructions: string | null;
	completed: boolean;
	completion: { effortFeedback: string | null } | null;
};

function SchedulePage() {
	const { activePlan, schedule } = Route.useLoaderData();
	const [localWorkouts, setLocalWorkouts] = useState<WorkoutItem[] | null>(
		schedule?.workouts ?? null,
	);
	const [activeWorkoutId, setActiveWorkoutId] = useState<number | null>(null);
	const [loadingId, setLoadingId] = useState<number | null>(null);

	if (!activePlan || !schedule || !localWorkouts) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">No Active Plan</h1>
				<p className="text-[var(--muted-foreground)] mb-6">
					You don't have an active training plan. Browse our plans and start
					your journey.
				</p>
				<Link
					to="/plans"
					className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
				>
					Browse Plans
				</Link>
			</div>
		);
	}

	const { userPlan, startWeek } = schedule;
	const fitnessLevel = userPlan.fitnessLevel ?? "beginner";

	const weeks: Record<number, WorkoutItem[]> = {};
	for (const workout of localWorkouts) {
		if (!weeks[workout.weekNumber]) weeks[workout.weekNumber] = [];
		weeks[workout.weekNumber].push(workout);
	}

	const completedCount = localWorkouts.filter((w) => w.completed).length;
	const totalCount = localWorkouts.length;
	const progressPercent =
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	const handleRowClick = (workout: WorkoutItem) => {
		if (workout.workoutType === "rest") return;
		if (activeWorkoutId === workout.id) {
			setActiveWorkoutId(null);
			return;
		}
		setActiveWorkoutId(workout.id);
	};

	const handleComplete = async (
		workout: WorkoutItem,
		effort: "easy" | "moderate" | "hard" | null,
	) => {
		if (workout.workoutType === "rest") return;
		setLoadingId(workout.id);
		try {
			await completeWorkout({
				data: {
					userPlanId: userPlan.id,
					workoutId: workout.id,
					effortFeedback: effort ?? undefined,
				},
			});
			setLocalWorkouts((prev) =>
				prev
					? prev.map((w) =>
							w.id === workout.id
								? {
										...w,
										completed: true,
										completion: {
											effortFeedback: effort,
										},
									}
								: w,
						)
					: prev,
			);
			setActiveWorkoutId(null);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to complete");
		} finally {
			setLoadingId(null);
		}
	};

	const handleUncomplete = async (workout: WorkoutItem) => {
		if (workout.workoutType === "rest") return;
		setLoadingId(workout.id);
		try {
			await uncompleteWorkout({
				data: {
					userPlanId: userPlan.id,
					workoutId: workout.id,
				},
			});
			setLocalWorkouts((prev) =>
				prev
					? prev.map((w) =>
							w.id === workout.id
								? { ...w, completed: false, completion: null }
								: w,
						)
					: prev,
			);
			setActiveWorkoutId(null);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to uncomplete");
		} finally {
			setLoadingId(null);
		}
	};

	const handleUpdateEffort = async (
		workout: WorkoutItem,
		effort: "easy" | "moderate" | "hard" | null,
	) => {
		if (workout.workoutType === "rest") return;
		setLoadingId(workout.id);
		try {
			await updateWorkoutEffort({
				data: {
					userPlanId: userPlan.id,
					workoutId: workout.id,
					effortFeedback: effort ?? undefined,
				},
			});
			setLocalWorkouts((prev) =>
				prev
					? prev.map((w) =>
							w.id === workout.id
								? {
										...w,
										completion: {
											effortFeedback: effort,
										},
									}
								: w,
						)
					: prev,
			);
			setActiveWorkoutId(null);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update effort");
		} finally {
			setLoadingId(null);
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">
					{activePlan.plan.name}
				</h1>
				<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)] mb-4">
					<span>
						{distanceLabels[activePlan.plan.distanceType] ||
							activePlan.plan.distanceType}
					</span>
					<span>·</span>
					<span>{activePlan.plan.durationWeeks} weeks</span>
					<span>·</span>
					<span>
						Started {new Date(activePlan.startDate).toLocaleDateString()}
					</span>
					<span>·</span>
					<span className="capitalize">{fitnessLevel}</span>
				</div>

				{startWeek > 1 && (
					<div className="mb-4 px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-sm rounded">
						<strong className="capitalize">{fitnessLevel}</strong> fitness
						level. Your training starts at a higher intensity.
					</div>
				)}

				<div className="mb-2 flex items-center justify-between text-sm">
					<span className="font-medium">
						{completedCount} of {totalCount} workouts done
					</span>
					<span className="text-[var(--muted-foreground)]">
						{progressPercent}%
					</span>
				</div>
				<div className="h-2 bg-[var(--muted)] overflow-hidden rounded">
					<div
						className="h-full bg-[var(--accent)] transition-all"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			</div>

			<div className="space-y-6">
				{Object.entries(weeks).map(([weekNum, weekWorkouts]) => {
					const weekCompleted = weekWorkouts.filter((w) => w.completed).length;
					const weekTotal = weekWorkouts.length;
					const weekDone = weekCompleted === weekTotal;

					return (
						<div
							key={weekNum}
							className="border border-[var(--border)] rounded"
						>
							<div className="px-4 py-3 bg-[var(--muted)] border-b border-[var(--border)] flex items-center justify-between rounded-t">
								<h3 className="font-semibold text-sm">Week {weekNum}</h3>
								{weekDone && (
									<span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
										<Check className="h-3.5 w-3.5" />
										Complete
									</span>
								)}
							</div>
							<div>
								{weekWorkouts.map((workout, idx) => {
									const isActive = activeWorkoutId === workout.id;
									const isLoading = loadingId === workout.id;
									const title = rowTitle(workout);
									const isRest = workout.workoutType === "rest";

									return (
										<div
											key={workout.id}
											className={
												idx < weekWorkouts.length - 1
													? "border-b border-[var(--border)]"
													: ""
											}
										>
											<div
												role={isRest ? undefined : "button"}
												tabIndex={isRest ? undefined : 0}
												onClick={() => handleRowClick(workout)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														handleRowClick(workout);
													}
												}}
												className={`w-full text-left transition-colors px-4 py-3 flex items-center gap-3 ${
													isActive
														? "bg-[var(--secondary)]"
														: workout.completed
															? "opacity-60"
															: isRest
																? ""
																: "hover:bg-[var(--muted)] cursor-pointer"
												}`}
											>
												{/* Day circle */}
												<div
													className={`shrink-0 flex items-center justify-center h-7 w-7 rounded-full border text-xs font-medium ${
														workout.completed
															? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
															: "bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]"
													}`}
												>
													{workout.completed ? (
														<Check className="h-3.5 w-3.5" />
													) : (
														workout.dayNumber
													)}
												</div>

												{/* Title */}
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{title}
														{workout.completed &&
															workout.completion?.effortFeedback && (
																<span className="text-[var(--muted-foreground)] font-normal">
																	{" "}
																	· {workout.completion.effortFeedback}
																</span>
															)}
													</p>
												</div>

												{/* Right side: effort selector or uncomplete */}
												{isActive && !workout.completed && !isRest && (
													<div className="shrink-0 flex items-center gap-1">
														{(["easy", "moderate", "hard"] as const).map(
															(level) => (
																<button
																	key={level}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleComplete(workout, level);
																	}}
																	disabled={isLoading}
																	className="px-2 py-1 text-[10px] font-medium border border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] transition-colors disabled:opacity-50 rounded"
																>
																	{level.charAt(0).toUpperCase() +
																		level.slice(1)}
																</button>
															),
														)}
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleComplete(workout, null);
															}}
															disabled={isLoading}
															className="px-2 py-1 text-[10px] font-medium text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-50 rounded"
														>
															{isLoading ? "..." : "Just Done"}
														</button>
													</div>
												)}

												{isActive && workout.completed && !isRest && (
													<div className="shrink-0 flex items-center gap-1">
														{(["easy", "moderate", "hard"] as const).map(
															(level) => (
																<button
																	key={level}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleUpdateEffort(workout, level);
																	}}
																	disabled={isLoading}
																	className="px-2 py-1 text-[10px] font-medium border border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] transition-colors disabled:opacity-50 rounded"
																>
																	{level.charAt(0).toUpperCase() +
																		level.slice(1)}
																</button>
															),
														)}
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleUncomplete(workout);
															}}
															disabled={isLoading}
															className="px-2 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 border border-[var(--border)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 rounded"
														>
															{isLoading ? "..." : "Uncomplete"}
														</button>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
