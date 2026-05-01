import { createFileRoute, Link } from "@tanstack/react-router";
import { getUserActivePlan, getUserPlanSchedule } from "#/lib/plans.ts";
import { Target, Calendar, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
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

function HomePage() {
	const { activePlan, schedule } = Route.useLoaderData();

	if (!activePlan || !schedule) {
		return (
			<main className="max-w-4xl mx-auto px-4 py-16">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight mb-4">
						Your Running Journey Starts Here
					</h1>
					<p className="text-lg text-neutral-500 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
						Pick a training plan and start working toward your goal. From your
						first 5K to your first marathon.
					</p>
					<Link
						to="/plans"
						className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
					>
						<Target className="h-4 w-4" />
						Browse Training Plans
					</Link>
				</div>

				<div className="mt-16 grid gap-6 sm:grid-cols-3">
					{[
						{
							title: "Structured Plans",
							desc: "Follow proven training plans designed by running coaches for 5K, 10K, half marathon, and marathon distances.",
						},
						{
							title: "Track Progress",
							desc: "Log every workout, see your completion rate, and watch yourself get closer to race day.",
						},
						{
							title: "Stay Consistent",
							desc: "A clear weekly schedule keeps you accountable and builds habits that lead to results.",
						},
					].map((feature) => (
						<div
							key={feature.title}
							className="p-6 border border-neutral-200 dark:border-neutral-800"
						>
							<h3 className="font-semibold mb-2">{feature.title}</h3>
							<p className="text-sm text-neutral-500 dark:text-neutral-400">
								{feature.desc}
							</p>
						</div>
					))}
				</div>
			</main>
		);
	}

	const { userPlan, workouts } = schedule;
	const completedCount = workouts.filter((w) => w.completed).length;
	const totalCount = workouts.length;
	const progressPercent = Math.round((completedCount / totalCount) * 100);

	// Get this week's workouts
	const today = new Date();
	const daysSinceStart = Math.floor(
		(today.getTime() - new Date(userPlan.startDate).getTime()) /
			(1000 * 60 * 60 * 24),
	);
	const currentWeek = Math.min(
		Math.floor(daysSinceStart / 7) + 1,
		activePlan.plan.durationWeeks,
	);
	const thisWeekWorkouts = workouts.filter((w) => w.weekNumber === currentWeek);
	const thisWeekCompleted = thisWeekWorkouts.filter((w) => w.completed).length;

	// Upcoming workout (first incomplete)
	const upcomingWorkout = workouts.find((w) => !w.completed);

	return (
		<main className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
				<p className="text-neutral-500 dark:text-neutral-400">
					{activePlan.plan.name} ·{" "}
					{distanceLabels[activePlan.plan.distanceType] ||
						activePlan.plan.distanceType}
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3 mb-8">
				<div className="p-4 border border-neutral-200 dark:border-neutral-800">
					<div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-2">
						<TrendingUp className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							Overall Progress
						</span>
					</div>
					<div className="text-2xl font-bold">{progressPercent}%</div>
					<div className="text-xs text-neutral-500 dark:text-neutral-400">
						{completedCount} of {totalCount} workouts
					</div>
				</div>

				<div className="p-4 border border-neutral-200 dark:border-neutral-800">
					<div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-2">
						<Calendar className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							This Week
						</span>
					</div>
					<div className="text-2xl font-bold">
						{thisWeekCompleted}/{thisWeekWorkouts.length}
					</div>
					<div className="text-xs text-neutral-500 dark:text-neutral-400">
						Week {currentWeek} of {activePlan.plan.durationWeeks}
					</div>
				</div>

				<div className="p-4 border border-neutral-200 dark:border-neutral-800">
					<div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-2">
						<Target className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							Weeks Left
						</span>
					</div>
					<div className="text-2xl font-bold">
						{activePlan.plan.durationWeeks - currentWeek + 1}
					</div>
					<div className="text-xs text-neutral-500 dark:text-neutral-400">
						until race day
					</div>
				</div>
			</div>

			{upcomingWorkout && (
				<div className="border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
								Next Workout
							</p>
							<h2 className="text-xl font-semibold">{upcomingWorkout.title}</h2>
							<p className="text-sm text-neutral-500 dark:text-neutral-400">
								Week {upcomingWorkout.weekNumber} · Day{" "}
								{upcomingWorkout.dayNumber}
								{upcomingWorkout.distanceKm &&
									` · ${upcomingWorkout.distanceKm}K`}
								{upcomingWorkout.durationMinutes &&
									` · ${upcomingWorkout.durationMinutes} min`}
							</p>
						</div>
						<Link
							to="/workouts/$workoutId"
							search={{ userPlanId: userPlan.id }}
							params={{ workoutId: String(upcomingWorkout.id) }}
							className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
						>
							Start
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			)}

			<div className="flex items-center gap-4">
				<Link
					to="/schedule"
					className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
				>
					<Calendar className="h-4 w-4" />
					View Full Schedule
				</Link>
				<Link
					to="/plans"
					className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
				>
					Browse other plans
				</Link>
			</div>
		</main>
	);
}
