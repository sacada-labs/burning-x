import { createFileRoute, Link } from "@tanstack/react-router";
import { getUserActivePlan, getUserPlanSchedule } from "#/lib/plans.ts";
import { Check, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/schedule")({
	component: SchedulePage,
	loader: async () => {
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

const workoutTypeStyles: Record<string, string> = {
	easy: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
	tempo:
		"bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400",
	interval:
		"bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
	long_run:
		"bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400",
	rest: "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400",
	cross_train:
		"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
	race: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
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

function SchedulePage() {
	const { activePlan, schedule } = Route.useLoaderData();

	if (!activePlan || !schedule) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">No Active Plan</h1>
				<p className="text-neutral-500 dark:text-neutral-400 mb-6">
					You don't have an active training plan. Browse our plans and start
					your journey.
				</p>
				<Link
					to="/plans"
					className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
				>
					Browse Plans
				</Link>
			</div>
		);
	}

	const { userPlan, workouts } = schedule;

	// Group by week
	const weeks: Record<number, typeof workouts> = {};
	for (const workout of workouts) {
		if (!weeks[workout.weekNumber]) weeks[workout.weekNumber] = [];
		weeks[workout.weekNumber].push(workout);
	}

	const completedCount = workouts.filter((w) => w.completed).length;
	const totalCount = workouts.length;
	const progressPercent = Math.round((completedCount / totalCount) * 100);

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">
					{activePlan.plan.name}
				</h1>
				<div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
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
					<span className="text-neutral-500 dark:text-neutral-400">
						{progressPercent}%
					</span>
				</div>
				<div className="h-2 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
					<div
						className="h-full bg-neutral-900 dark:bg-neutral-50 transition-all"
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
							className="border border-neutral-200 dark:border-neutral-800"
						>
							<div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
								<h3 className="font-semibold text-sm">Week {weekNum}</h3>
								{weekDone && (
									<span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
										<Check className="h-3.5 w-3.5" />
										Complete
									</span>
								)}
							</div>
							<div className="divide-y divide-neutral-200 dark:divide-neutral-800">
								{weekWorkouts.map((workout) => (
									<div
										key={workout.id}
										className="px-4 py-3 flex items-center justify-between"
									>
										<div className="flex items-center gap-3">
											{workout.completed ? (
												<div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
													<Check className="h-4 w-4 text-green-600 dark:text-green-400" />
												</div>
											) : (
												<div className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
													<span className="text-xs text-neutral-500 dark:text-neutral-400">
														{workout.dayNumber}
													</span>
												</div>
											)}
											<div>
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium">{workout.title}</p>
													<span
														className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium border ${workoutTypeStyles[workout.workoutType] || "bg-neutral-50 border-neutral-200 text-neutral-600"}`}
													>
														{workoutTypeLabels[workout.workoutType] ||
															workout.workoutType}
													</span>
												</div>
												<p className="text-xs text-neutral-500 dark:text-neutral-400">
													{workout.distanceKm && `${workout.distanceKm}K`}
													{workout.distanceKm &&
														workout.durationMinutes &&
														" · "}
													{workout.durationMinutes &&
														`${workout.durationMinutes} min`}
												</p>
											</div>
										</div>
										<Link
											to="/workouts/$workoutId"
											search={{ userPlanId: userPlan.id }}
											params={{ workoutId: String(workout.id) }}
											className="text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
										>
											{workout.completed ? "View" : "Start"}
										</Link>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
