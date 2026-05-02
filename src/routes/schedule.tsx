import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	getUserActivePlan,
	getUserPlanSchedule,
	completeWorkout,
} from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { useState } from "react";
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

const workoutTypeLabels: Record<string, string> = {
	easy: "Easy",
	tempo: "Tempo",
	interval: "Intervals",
	long_run: "Long Run",
	rest: "Rest",
	cross_train: "Cross Train",
	race: "Race",
};

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
	completion: { effortFeedback: string | null; notes: string | null } | null;
};

function SchedulePage() {
	const { activePlan, schedule } = Route.useLoaderData();
	const [localWorkouts, setLocalWorkouts] = useState<WorkoutItem[] | null>(
		schedule?.workouts ?? null,
	);
	const [completingId, setCompletingId] = useState<number | null>(null);
	const [effort, setEffort] = useState<"easy" | "moderate" | "hard" | "">("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);

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

	const { userPlan } = schedule;

	// Group by week
	const weeks: Record<number, WorkoutItem[]> = {};
	for (const workout of localWorkouts) {
		if (!weeks[workout.weekNumber]) weeks[workout.weekNumber] = [];
		weeks[workout.weekNumber].push(workout);
	}

	const completedCount = localWorkouts.filter((w) => w.completed).length;
	const totalCount = localWorkouts.length;
	const progressPercent = Math.round((completedCount / totalCount) * 100);

	const handleToggleComplete = async (workout: WorkoutItem) => {
		if (workout.completed) return;
		setCompletingId(workout.id);
		setEffort("");
		setNotes("");
	};

	const handleConfirmComplete = async (workout: WorkoutItem) => {
		setLoading(true);
		try {
			await completeWorkout({
				data: {
					userPlanId: userPlan.id,
					workoutId: workout.id,
					effortFeedback: effort || undefined,
					notes: notes || undefined,
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
											effortFeedback: effort || null,
											notes: notes || null,
										},
									}
								: w,
						)
					: prev,
			);
			setCompletingId(null);
			setEffort("");
			setNotes("");
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to complete");
		} finally {
			setLoading(false);
		}
	};

	const handleCancelComplete = () => {
		setCompletingId(null);
		setEffort("");
		setNotes("");
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
				</div>

				<div className="mb-2 flex items-center justify-between text-sm">
					<span className="font-medium">
						{completedCount} of {totalCount} workouts completed
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
									const isCompleting = completingId === workout.id;

									return (
										<div key={workout.id}>
											<div className="px-4 py-3 flex items-center justify-between">
												<div className="flex items-center gap-3">
													<button
														onClick={() =>
															!workout.completed &&
															handleToggleComplete(workout)
														}
														className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors ${
															workout.completed
																? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
																: "bg-[var(--muted)] border-[var(--border)] hover:border-[var(--foreground)]"
														}`}
														disabled={workout.completed}
													>
														{workout.completed ? (
															<Check className="h-4 w-4 text-green-600 dark:text-green-400" />
														) : (
															<span className="text-xs text-[var(--muted-foreground)]">
																{workout.dayNumber}
															</span>
														)}
													</button>
													<div>
														<div className="flex items-center gap-2">
															<p className="text-sm font-medium">
																{workout.title}
															</p>
															<span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)]">
																{workoutTypeLabels[workout.workoutType] ||
																	workout.workoutType}
															</span>
														</div>
														<p className="text-xs text-[var(--muted-foreground)]">
															{workout.distanceKm && `${workout.distanceKm}K`}
															{workout.distanceKm &&
																workout.durationMinutes &&
																" · "}
															{workout.durationMinutes &&
																`${workout.durationMinutes} min`}
														</p>
													</div>
												</div>
											</div>

											{isCompleting && (
												<div className="px-4 pb-4 pl-14">
													<div className="border border-[var(--border)] p-4 rounded">
														<p className="text-sm font-medium mb-3">
															How did it feel?
														</p>
														<div className="flex gap-2 mb-3">
															{(["easy", "moderate", "hard"] as const).map(
																(level) => (
																	<button
																		key={level}
																		onClick={() => setEffort(level)}
																		className={`px-3 py-1.5 text-xs font-medium border rounded transition-colors ${
																			effort === level
																				? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
																				: "border-[var(--border)] hover:bg-[var(--secondary)]"
																		}`}
																	>
																		{level.charAt(0).toUpperCase() +
																			level.slice(1)}
																	</button>
																),
															)}
														</div>
														<textarea
															value={notes}
															onChange={(e) => setNotes(e.target.value)}
															rows={2}
															placeholder="Optional notes..."
															className="flex w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--foreground)] resize-none rounded mb-3"
														/>
														<div className="flex gap-2">
															<button
																onClick={handleCancelComplete}
																className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors rounded"
															>
																Cancel
															</button>
															<button
																onClick={() => handleConfirmComplete(workout)}
																disabled={loading}
																className="px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity disabled:opacity-50 rounded"
															>
																{loading ? "Saving..." : "Mark Done"}
															</button>
														</div>
													</div>
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
