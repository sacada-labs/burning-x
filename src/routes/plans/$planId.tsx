import { createFileRoute, Link } from '@tanstack/react-router'
import {
	getTrainingPlan,
	enrollInPlan,
	getUserActivePlan,
} from '#/lib/plans.ts'
import { useState } from 'react'
import { Clock, Calendar, Target, ChevronLeft, Check } from 'lucide-react'

export const Route = createFileRoute('/plans/$planId')({
	component: PlanDetailPage,
	loader: async ({ params }) => {
		const planId = Number.parseInt(params.planId, 10)
		const [planData, activePlan] = await Promise.all([
			getTrainingPlan({ data: planId }),
			getUserActivePlan(),
		])
		return { ...planData, activePlan }
	},
})

const distanceLabels: Record<string, string> = {
	'5k': '5K',
	'10k': '10K',
	'half_marathon': 'Half Marathon',
	'marathon': 'Marathon',
}

const difficultyLabels: Record<string, string> = {
	beginner: 'Beginner',
	intermediate: 'Intermediate',
	advanced: 'Advanced',
}

const workoutTypeLabels: Record<string, string> = {
	easy: 'Easy Run',
	tempo: 'Tempo Run',
	interval: 'Intervals',
	long_run: 'Long Run',
	rest: 'Rest Day',
	cross_train: 'Cross Training',
	race: 'Race Day',
}

function PlanDetailPage() {
	const { plan, workouts, activePlan } = Route.useLoaderData()
	const [enrolling, setEnrolling] = useState(false)
	const [enrolled, setEnrolled] = useState(activePlan?.planId === plan.id)

	const isEnrolledInThisPlan = activePlan?.planId === plan.id

	const handleEnroll = async () => {
		setEnrolling(true)
		try {
			await enrollInPlan({ data: plan.id })
			setEnrolled(true)
		} catch (err) {
			console.error('Enrollment failed:', err)
			alert(err instanceof Error ? err.message : 'Enrollment failed')
		} finally {
			setEnrolling(false)
		}
	}

	// Group workouts by week
	const weeks: Record<number, typeof workouts> = {}
	for (const workout of workouts) {
		if (!weeks[workout.weekNumber]) weeks[workout.weekNumber] = []
		weeks[workout.weekNumber].push(workout)
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<Link
				to="/plans"
				className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
			>
				<ChevronLeft className="h-4 w-4" />
				Back to plans
			</Link>

			<div className="mb-8">
				<div className="flex items-start justify-between mb-3">
					<h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
					<span className="inline-flex items-center px-2.5 py-1 text-sm font-medium bg-[var(--muted)] text-[var(--foreground)]">
						{distanceLabels[plan.distanceType] || plan.distanceType}
					</span>
				</div>

				<p className="text-[var(--muted-foreground)] mb-4">
					{plan.description}
				</p>

				<div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)] mb-6">
					<span className="inline-flex items-center gap-1.5">
						<Clock className="h-4 w-4" />
						{plan.durationWeeks} weeks
					</span>
					<span className="inline-flex items-center gap-1.5">
						<Target className="h-4 w-4" />
						{difficultyLabels[plan.difficulty] || plan.difficulty}
					</span>
					<span className="inline-flex items-center gap-1.5">
						<Calendar className="h-4 w-4" />
						{workouts.length} workouts
					</span>
				</div>

				{isEnrolledInThisPlan ? (
					<div className="flex items-center gap-3">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium">
							<Check className="h-4 w-4" />
							You're enrolled in this plan
						</div>
						<Link
							to="/schedule"
							className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
						>
							View Schedule
						</Link>
					</div>
				) : enrolled ? (
					<div className="flex items-center gap-3">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium">
							<Check className="h-4 w-4" />
							Enrolled successfully
						</div>
						<Link
							to="/schedule"
							className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
						>
							View Schedule
						</Link>
					</div>
				) : (
					<button
						onClick={handleEnroll}
						disabled={enrolling}
						className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded"
					>
						{enrolling ? 'Enrolling...' : 'Start This Plan'}
					</button>
				)}
			</div>

			<div className="space-y-6">
				{Object.entries(weeks).map(([weekNum, weekWorkouts]) => (
					<div
						key={weekNum}
						className="border border-[var(--border)] rounded"
					>
						<div className="px-4 py-3 bg-[var(--muted)] border-b border-[var(--border)] rounded-t">
							<h3 className="font-semibold text-sm">Week {weekNum}</h3>
						</div>
						<div className="divide-y divide-[var(--border)]">
							{weekWorkouts.map((workout) => (
								<div
									key={workout.id}
									className="px-4 py-3 flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 text-xs text-[var(--muted-foreground)] text-center">
											Day {workout.dayNumber}
										</div>
										<div>
											<p className="text-sm font-medium">
												{workout.title}
											</p>
											<p className="text-xs text-[var(--muted-foreground)]">
												{workoutTypeLabels[workout.workoutType] ||
												workout.workoutType}
												{workout.distanceKm && ` · ${workout.distanceKm}K`}
												{workout.durationMinutes &&
													` · ${workout.durationMinutes} min`}
											</p>
										</div>
									</div>
								</div>
							))}
							</div>
						</div>
					))}
			</div>
		</div>
	)
}
