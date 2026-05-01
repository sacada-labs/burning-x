import { createFileRoute, Link } from "@tanstack/react-router";
import {
	getTrainingPlan,
	getWorkoutCompletion,
	completeWorkout,
	getUserActivePlan,
} from "#/lib/plans.ts";
import { useState } from "react";
import {
	ChevronLeft,
	Check,
	Clock,
	MapPin,
	Timer,
	Activity,
} from "lucide-react";

export const Route = createFileRoute("/workouts/$workoutId")({
	component: WorkoutDetailPage,
	loader: async ({ params, deps }) => {
		const workoutId = Number.parseInt(params.workoutId, 10);
		const search = deps.search as { userPlanId?: string };
		const userPlanId = search?.userPlanId
			? Number.parseInt(search.userPlanId, 10)
			: undefined;

		// Get the workout details through the plan
		const activePlan = await getUserActivePlan();
		if (!activePlan) throw new Error("No active plan");

		const planData = await getTrainingPlan({ data: activePlan.planId });
		const workout = planData.workouts.find((w) => w.id === workoutId);
		if (!workout) throw new Error("Workout not found");

		let completion = null;
		if (userPlanId) {
			try {
				completion = await getWorkoutCompletion({
					data: { userPlanId, workoutId },
				});
			} catch {
				// Not completed yet
			}
		}

		return {
			workout,
			plan: planData.plan,
			completion,
			userPlanId: activePlan.id,
		};
	},
});

const workoutTypeLabels: Record<string, string> = {
	easy: "Easy Run",
	tempo: "Tempo Run",
	interval: "Intervals",
	long_run: "Long Run",
	rest: "Rest Day",
	cross_train: "Cross Training",
	race: "Race Day",
};

function WorkoutDetailPage() {
	const { workout, plan, completion, userPlanId } = Route.useLoaderData();
	const [isCompleting, setIsCompleting] = useState(false);
	const [completed, setCompleted] = useState(!!completion);
	const [formData, setFormData] = useState({
		actualDistanceKm: "",
		actualDurationMinutes: "",
		perceivedEffort: "",
		notes: "",
	});

	const handleComplete = async () => {
		setIsCompleting(true);
		try {
			await completeWorkout({
				data: {
					userPlanId,
					workoutId: workout.id,
					actualDistanceKm: formData.actualDistanceKm
						? Number.parseFloat(formData.actualDistanceKm)
						: undefined,
					actualDurationMinutes: formData.actualDurationMinutes
						? Number.parseInt(formData.actualDurationMinutes, 10)
						: undefined,
					perceivedEffort: formData.perceivedEffort
						? Number.parseInt(formData.perceivedEffort, 10)
						: undefined,
					notes: formData.notes || undefined,
				},
			});
			setCompleted(true);
		} catch (err) {
			console.error("Completion failed:", err);
			alert(err instanceof Error ? err.message : "Failed to complete workout");
		} finally {
			setIsCompleting(false);
		}
	};

	if (workout.workoutType === "rest") {
		return (
			<div className="max-w-2xl mx-auto px-4 py-8">
				<Link
					to="/schedule"
					className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 mb-6"
				>
					<ChevronLeft className="h-4 w-4" />
					Back to schedule
				</Link>

				<div className="text-center py-12">
					<h1 className="text-2xl font-bold mb-2">{workout.title}</h1>
					<p className="text-neutral-500 dark:text-neutral-400 mb-6">
						{workout.instructions ||
							"Take a complete rest day. Your body needs time to recover and adapt."}
					</p>
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm">
						<Activity className="h-4 w-4" />
						Rest Day
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto px-4 py-8">
			<Link
				to="/schedule"
				className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 mb-6"
			>
				<ChevronLeft className="h-4 w-4" />
				Back to schedule
			</Link>

			<div className="mb-6">
				<div className="flex items-start justify-between mb-2">
					<h1 className="text-2xl font-bold">{workout.title}</h1>
					<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
						{workoutTypeLabels[workout.workoutType] || workout.workoutType}
					</span>
				</div>
				<p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
					Week {workout.weekNumber} · Day {workout.dayNumber} · {plan.name}
				</p>

				<div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
					{workout.distanceKm && (
						<span className="inline-flex items-center gap-1.5">
							<MapPin className="h-4 w-4" />
							{workout.distanceKm} km planned
						</span>
					)}
					{workout.durationMinutes && (
						<span className="inline-flex items-center gap-1.5">
							<Timer className="h-4 w-4" />
							{workout.durationMinutes} min planned
						</span>
					)}
				</div>
			</div>

			{workout.instructions && (
				<div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-6">
					<h3 className="font-medium text-sm mb-2">Instructions</h3>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
						{workout.instructions}
					</p>
				</div>
			)}

			{completed ? (
				<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
					<div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 mb-3">
						<Check className="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<h3 className="font-medium text-green-800 dark:text-green-400 mb-1">
						Workout Completed
					</h3>
					{completion && (
						<div className="text-sm text-green-700 dark:text-green-500 mt-2 space-y-1">
							{completion.actualDistanceKm && (
								<p>{completion.actualDistanceKm} km</p>
							)}
							{completion.actualDurationMinutes && (
								<p>{completion.actualDurationMinutes} minutes</p>
							)}
							{completion.actualPacePerKm && (
								<p>Pace: {completion.actualPacePerKm.toFixed(2)} min/km</p>
							)}
						</div>
					)}
				</div>
			) : (
				<div className="border border-neutral-200 dark:border-neutral-800">
					<div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
						<h3 className="font-medium text-sm">Log Workout</h3>
					</div>
					<div className="p-4 space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium mb-1.5 block">
									Distance (km)
								</label>
								<input
									type="number"
									step="0.1"
									value={formData.actualDistanceKm}
									onChange={(e) =>
										setFormData({
											...formData,
											actualDistanceKm: e.target.value,
										})
									}
									placeholder={
										workout.distanceKm ? String(workout.distanceKm) : ""
									}
									className="flex h-9 w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1.5 block">
									Duration (min)
								</label>
								<input
									type="number"
									value={formData.actualDurationMinutes}
									onChange={(e) =>
										setFormData({
											...formData,
											actualDurationMinutes: e.target.value,
										})
									}
									placeholder={
										workout.durationMinutes
											? String(workout.durationMinutes)
											: ""
									}
									className="flex h-9 w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
								/>
							</div>
						</div>

						<div>
							<label className="text-sm font-medium mb-1.5 block">
								Perceived Effort (1-10)
							</label>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.perceivedEffort || "5"}
								onChange={(e) =>
									setFormData({ ...formData, perceivedEffort: e.target.value })
								}
								className="w-full"
							/>
							<div className="flex justify-between text-xs text-neutral-400 mt-1">
								<span>Easy</span>
								<span>{formData.perceivedEffort || "5"}</span>
								<span>Max</span>
							</div>
						</div>

						<div>
							<label className="text-sm font-medium mb-1.5 block">Notes</label>
							<textarea
								value={formData.notes}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								rows={3}
								placeholder="How did it feel?"
								className="flex w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 resize-none"
							/>
						</div>

						<button
							onClick={handleComplete}
							disabled={isCompleting}
							className="w-full h-9 px-4 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isCompleting ? "Saving..." : "Mark as Complete"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
