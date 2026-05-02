import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	getUserActivePlan,
	getUserPlanSchedule,
	getUserProfile,
} from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { TrendingUp, Target, Flame, Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			return {
				activePlan: null,
				schedule: null,
				isLoggedIn: false,
				userName: null,
			};
		}

		const profile = await getUserProfile();
		if (!profile) {
			throw redirect({ to: "/onboarding" });
		}

		const activePlan = await getUserActivePlan();
		if (!activePlan)
			return {
				activePlan: null,
				schedule: null,
				isLoggedIn: true,
				userName: session.user.name || session.user.email || null,
			};

		const schedule = await getUserPlanSchedule({ data: activePlan.id });
		return {
			activePlan,
			schedule,
			isLoggedIn: true,
			userName: session.user.name || session.user.email || null,
		};
	},
});

const distanceLabels: Record<string, string> = {
	"5k": "5K",
	"10k": "10K",
	half_marathon: "Half Marathon",
	marathon: "Marathon",
};

function HomePage() {
	const { activePlan, schedule, isLoggedIn, userName } = Route.useLoaderData();

	// Landing page for non-logged-in users
	if (!isLoggedIn) {
		return (
			<div className="flex flex-col items-center justify-center px-4 py-24 text-center">
				<div className="mb-6">
					<span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
						<span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
						burning-x
					</span>
				</div>
				<h1 className="text-4xl font-bold tracking-tight mb-4 sm:text-5xl">
					Your personal running coach.
				</h1>
				<p className="text-lg text-[var(--muted-foreground)] mb-10 max-w-md">
					Structured training plans for 5K, 10K, half marathon, and marathon.
					Log workouts and track your progress.
				</p>
				<Link
					to="/auth"
					className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
				>
					Get Started
				</Link>
			</div>
		);
	}

	// Dashboard for logged-in users without an active plan
	if (!activePlan || !schedule) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight mb-4">
						Welcome back{userName ? `, ${userName}` : ""}
					</h1>
					<p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
						Pick a training plan and start working toward your goal.
					</p>
					<Link
						to="/plans"
						className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
					>
						<Target className="h-4 w-4" />
						Browse Training Plans
					</Link>
				</div>
			</div>
		);
	}

	// Full dashboard
	const { userPlan, startWeek, workouts } = schedule;
	const fitnessLevel = userPlan.fitnessLevel ?? "beginner";
	const completedCount = workouts.filter((w) => w.completed).length;
	const totalCount = workouts.length;
	const progressPercent =
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	const totalDistanceKm = workouts
		.filter((w) => w.completed)
		.reduce((sum, w) => sum + (w.distanceKm ?? 0), 0);
	const estimatedCalories = Math.round(totalDistanceKm * 60);

	const upcomingWorkout = workouts.find((w) => !w.completed);

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<div className="flex items-start gap-3 mb-2">
					<h1 className="text-3xl font-bold tracking-tight min-w-0">
						<span className="block">Dashboard</span>
						{userName && (
							<span className="block text-lg text-[var(--muted-foreground)] truncate">
								{userName}
							</span>
						)}
					</h1>
					<span className="shrink-0 inline-flex items-center px-2 py-0.5 text-xs font-medium border border-[var(--border)] capitalize">
						{fitnessLevel}
					</span>
				</div>
				<p className="text-[var(--muted-foreground)]">
					{activePlan.plan.name} ·{" "}
					{distanceLabels[activePlan.plan.distanceType] ||
						activePlan.plan.distanceType}
				</p>
				{startWeek > 1 && (
					<p className="text-xs text-[var(--muted-foreground)] mt-1">
						Plan starts at Week {startWeek} based on your fitness assessment.
					</p>
				)}
			</div>

			{progressPercent === 100 ? (
				<div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 mb-8 rounded">
					<div className="text-center">
						<div className="text-4xl mb-2">🏁</div>
						<h2 className="text-xl font-bold text-green-800 dark:text-green-400 mb-1">
							Plan Complete
						</h2>
						<p className="text-sm text-green-700 dark:text-green-500 mb-4">
							You finished {activePlan.plan.name}. Great work.
						</p>
						<Link
							to="/plans"
							className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
						>
							<Target className="h-4 w-4" />
							Start a New Plan
						</Link>
					</div>
				</div>
			) : upcomingWorkout ? (
				<div className="border border-[var(--border)] p-6 mb-8 rounded">
					<div>
						<p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
							Next Workout
						</p>
						<h2 className="text-xl font-semibold">{upcomingWorkout.title}</h2>
						<p className="text-sm text-[var(--muted-foreground)]">
							Week {upcomingWorkout.weekNumber} · Day{" "}
							{upcomingWorkout.dayNumber}
							{upcomingWorkout.distanceKm &&
								` · ${upcomingWorkout.distanceKm}K`}
							{upcomingWorkout.durationMinutes &&
								` · ${upcomingWorkout.durationMinutes} min`}
						</p>
					</div>
				</div>
			) : null}

			<div className="grid gap-4 sm:grid-cols-3 mb-8">
				<div className="p-4 border border-[var(--border)] rounded">
					<div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-2">
						<TrendingUp className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							Overall Progress
						</span>
					</div>
					<div className="text-2xl font-bold">{progressPercent}%</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						{completedCount} of {totalCount} workouts
					</div>
				</div>

				<div className="p-4 border border-[var(--border)] rounded">
					<div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-2">
						<RouteIcon className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							Distance
						</span>
					</div>
					<div className="text-2xl font-bold">
						{totalDistanceKm.toFixed(1)}K
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						total run
					</div>
				</div>

				<div className="p-4 border border-[var(--border)] rounded">
					<div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-2">
						<Flame className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							Calories
						</span>
					</div>
					<div className="text-2xl font-bold">{estimatedCalories}</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						estimated burned
					</div>
				</div>
			</div>
		</div>
	);
}
