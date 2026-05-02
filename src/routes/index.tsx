import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getUserActivePlan, getUserPlanSchedule } from '#/lib/plans.ts'
import { getAuthSession } from '#/lib/auth-server.ts'
import { Calendar, TrendingUp, Target, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
	component: HomePage,
	loader: async () => {
		const session = await getAuthSession()
		if (!session?.user) {
			return { activePlan: null, schedule: null, isLoggedIn: false }
		}

		const activePlan = await getUserActivePlan()
		if (!activePlan) return { activePlan: null, schedule: null, isLoggedIn: true }

		const schedule = await getUserPlanSchedule({ data: activePlan.id })
		return { activePlan, schedule, isLoggedIn: true }
	},
})

const distanceLabels: Record<string, string> = {
	'5k': '5K',
	'10k': '10K',
	half_marathon: 'Half Marathon',
	marathon: 'Marathon',
}

function HomePage() {
	const { activePlan, schedule, isLoggedIn } = Route.useLoaderData()

	// Landing page for non-logged-in users
	if (!isLoggedIn) {
		return (
			<main className="flex flex-col items-center justify-center px-4 py-24 text-center">
				<div className="mb-6">
					<span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
						<span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
						Runna
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
			</main>
		)
	}

	// Dashboard for logged-in users without an active plan
	if (!activePlan || !schedule) {
		return (
			<main className="max-w-4xl mx-auto px-4 py-16">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight mb-4">
						Welcome back
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
			</main>
		)
	}

	// Full dashboard
	const { userPlan, workouts } = schedule
	const completedCount = workouts.filter((w) => w.completed).length
	const totalCount = workouts.length
	const progressPercent = Math.round((completedCount / totalCount) * 100)

	const today = new Date()
	const daysSinceStart = Math.floor(
		(today.getTime() - new Date(userPlan.startDate).getTime()) /
			(1000 * 60 * 60 * 24),
	)
	const currentWeek = Math.min(
		Math.floor(daysSinceStart / 7) + 1,
		activePlan.plan.durationWeeks,
	)
	const thisWeekWorkouts = workouts.filter((w) => w.weekNumber === currentWeek)
	const thisWeekCompleted = thisWeekWorkouts.filter((w) => w.completed).length

	const upcomingWorkout = workouts.find((w) => !w.completed)

	return (
		<main className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
				<p className="text-[var(--muted-foreground)]">
					{activePlan.plan.name} ·{' '}
					{distanceLabels[activePlan.plan.distanceType] ||
						activePlan.plan.distanceType}
				</p>
			</div>

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
						<Calendar className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							This Week
						</span>
					</div>
					<div className="text-2xl font-bold">
						{thisWeekCompleted}/{thisWeekWorkouts.length}
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						Week {currentWeek} of {activePlan.plan.durationWeeks}
					</div>
				</div>

				<div className="p-4 border border-[var(--border)] rounded">
					<div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-2">
						<Target className="h-4 w-4" />
						<span className="text-xs font-medium uppercase tracking-wider">
							Weeks Left
						</span>
					</div>
					<div className="text-2xl font-bold">
						{activePlan.plan.durationWeeks - currentWeek + 1}
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						until race day
					</div>
				</div>
			</div>

			{upcomingWorkout && (
				<div className="border border-[var(--border)] p-6 mb-8 rounded">
					<div className="flex items-center justify-between mb-4">
						<div>
							<p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
								Next Workout
							</p>
							<h2 className="text-xl font-semibold">{upcomingWorkout.title}</h2>
							<p className="text-sm text-[var(--muted-foreground)]">
								Week {upcomingWorkout.weekNumber} · Day{' '}
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
							className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
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
					className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors rounded"
				>
					<Calendar className="h-4 w-4" />
					View Full Schedule
				</Link>
				<Link
					to="/plans"
					className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
				>
					Browse other plans
				</Link>
			</div>
		</main>
	)
}
