import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	getUserActivePlan,
	getUserPlanSchedule,
	completeWorkout,
} from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { useState, useRef, useEffect } from "react";
import { Check, Zap } from "lucide-react";

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

const workoutTypeLabels: Record<string, string> = {
	easy: "Easy",
	tempo: "Tempo",
	interval: "Intervals",
	long_run: "Long Run",
	rest: "Rest",
	cross_train: "Cross Train",
	race: "Race",
};

function formatPace(
	distanceKm: number | null,
	durationMin: number | null,
): string {
	if (!distanceKm || !durationMin || distanceKm <= 0) return "—";
	const pace = durationMin / distanceKm;
	const m = Math.floor(pace);
	const s = Math.round((pace - m) * 60);
	return `${m}:${s.toString().padStart(2, "0")}/km`;
}

function formatDistance(distanceKm: number | null): string {
	if (!distanceKm) return "—";
	return `${distanceKm}K`;
}

function formatDuration(durationMin: number | null): string {
	if (!durationMin) return "—";
	return `${durationMin}m`;
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

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setActiveWorkoutId(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
		if (workout.completed) {
			setActiveWorkoutId(null);
			return;
		}
		setActiveWorkoutId(workout.id);
	};

	const handleSetEffort = async (
		workout: WorkoutItem,
		effort: "easy" | "moderate" | "hard" | null,
	) => {
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

	return (
		<div className="max-w-4xl mx-auto px-4 py-8" ref={containerRef}>
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
				</div>

				{startWeek > 1 && (
					<div className="mb-4 flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-sm rounded">
						<Zap className="h-4 w-4 text-[var(--accent)]" />
						<span>
							<strong className="capitalize">{fitnessLevel}</strong> fitness
							level detected. Your plan starts at{" "}
							<strong>Week {startWeek}</strong> to match your current ability.
						</span>
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
							<div className="divide-y divide-[var(--border)]">
								{weekWorkouts.map((workout) => {
									const isActive = activeWorkoutId === workout.id;
									const isLoading = loadingId === workout.id;

									return (
										<div key={workout.id}>
											<button
												onClick={() => handleRowClick(workout)}
												disabled={isLoading}
												className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-colors ${
													isActive
														? "bg-[var(--secondary)]"
														: "hover:bg-[var(--muted)]"
												}`}
											>
												{/* Checkbox */}
												<div
													className={`shrink-0 h-7 w-7 flex items-center justify-center rounded-full border transition-colors ${
														workout.completed
															? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
															: "bg-[var(--background)] border-[var(--border)]"
													}`}
												>
													{workout.completed ? (
														<Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
													) : (
														<span className="text-xs text-[var(--muted-foreground)]">
															{workout.dayNumber}
														</span>
													)}
												</div>

												{/* Title */}
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{workout.title}
													</p>
												</div>

												{/* Objective data */}
												<div className="hidden sm:flex items-center gap-4 text-xs text-[var(--muted-foreground)] shrink-0">
													<span className="w-12 text-right font-medium text-[var(--foreground)]">
														{formatDistance(workout.distanceKm)}
													</span>
													<span className="w-12 text-right">
														{formatDuration(workout.durationMinutes)}
													</span>
													<span className="w-16 text-right">
														{formatPace(
															workout.distanceKm,
															workout.durationMinutes,
														)}
													</span>
												</div>

												{/* Type + effort badge */}
												<div className="flex items-center gap-2 shrink-0 ml-2">
													<span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)]">
														{workoutTypeLabels[workout.workoutType] ||
															workout.workoutType}
													</span>
													{workout.completed &&
														workout.completion?.effortFeedback && (
															<span className="text-xs text-[var(--muted-foreground)] capitalize">
																· {workout.completion.effortFeedback}
															</span>
														)}
												</div>
											</button>

											{/* Mobile objective data */}
											<div className="sm:hidden px-4 pb-2 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
												<span className="font-medium text-[var(--foreground)]">
													{formatDistance(workout.distanceKm)}
												</span>
												<span>{formatDuration(workout.durationMinutes)}</span>
												<span>
													{formatPace(
														workout.distanceKm,
														workout.durationMinutes,
													)}
												</span>
											</div>

											{/* Effort selector */}
											{isActive && !workout.completed && (
												<div className="px-4 pb-3 flex items-center gap-2">
													<span className="text-xs text-[var(--muted-foreground)] mr-1">
														Effort:
													</span>
													{(["easy", "moderate", "hard"] as const).map(
														(level) => (
															<button
																key={level}
																onClick={(e) => {
																	e.stopPropagation();
																	handleSetEffort(workout, level);
																}}
																disabled={isLoading}
																className="px-2.5 py-1 text-xs font-medium border border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] transition-colors disabled:opacity-50 rounded"
															>
																{level.charAt(0).toUpperCase() + level.slice(1)}
															</button>
														),
													)}
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleSetEffort(workout, null);
														}}
														disabled={isLoading}
														className="px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-50 rounded"
													>
														{isLoading ? "..." : "Done"}
													</button>
												</div>
											)}
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
