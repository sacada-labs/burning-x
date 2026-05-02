import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	getTrainingPlan,
	enrollInPlan,
	getUserActivePlan,
} from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { useState } from "react";
import { Clock, Calendar, Target, ChevronLeft, Check } from "lucide-react";

export const Route = createFileRoute("/plans/$planId")({
	component: PlanDetailPage,
	loader: async ({ params }) => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({ to: "/auth" });
		}
		const planId = Number.parseInt(params.planId, 10);
		const [planData, activePlan] = await Promise.all([
			getTrainingPlan({ data: planId }),
			getUserActivePlan(),
		]);
		return { ...planData, activePlan };
	},
});

const distanceLabels: Record<string, string> = {
	"5k": "5K",
	"10k": "10K",
	half_marathon: "Half Marathon",
	marathon: "Marathon",
};

const difficultyLabels: Record<string, string> = {
	beginner: "Beginner",
	intermediate: "Intermediate",
	advanced: "Advanced",
};

const workoutTypeLabels: Record<string, string> = {
	easy: "Easy Run",
	tempo: "Tempo Run",
	interval: "Intervals",
	long_run: "Long Run",
	rest: "Rest Day",
	cross_train: "Cross Training",
	race: "Race Day",
};

function getStartWeek(
	fitnessLevel: string | null,
	durationWeeks: number,
): number {
	if (fitnessLevel === "advanced") {
		return Math.max(1, Math.ceil(durationWeeks * 0.4));
	}
	if (fitnessLevel === "intermediate") {
		return Math.max(1, Math.ceil(durationWeeks * 0.2));
	}
	return 1;
}

function PlanDetailPage() {
	const { plan, workouts, activePlan } = Route.useLoaderData();
	const [showAssessment, setShowAssessment] = useState(false);
	const [enrolling, setEnrolling] = useState(false);
	const [enrolled, setEnrolled] = useState(activePlan?.planId === plan.id);
	const [enrollmentResult, setEnrollmentResult] = useState<{
		fitnessLevel: string;
		startWeek: number;
	} | null>(null);

	const isEnrolledInThisPlan = activePlan?.planId === plan.id;

	const [assessment, setAssessment] = useState({
		canRun2kNonstop: false,
		canRun5kNonstop: false,
		canRun5kUnder30: false,
		canRun10kNonstop: false,
		recentWeeklyMileage: "",
	});

	const handleEnroll = async () => {
		setEnrolling(true);
		try {
			const result = await enrollInPlan({
				data: {
					planId: plan.id,
					assessment: {
						canRun2kNonstop: assessment.canRun2kNonstop,
						canRun5kNonstop: assessment.canRun5kNonstop,
						canRun5kUnder30: assessment.canRun5kUnder30,
						canRun10kNonstop: assessment.canRun10kNonstop,
						recentWeeklyMileage: assessment.recentWeeklyMileage
							? Number.parseInt(assessment.recentWeeklyMileage, 10)
							: undefined,
					},
				},
			});
			const level = result.fitnessLevel ?? "beginner";
			const startWeek = getStartWeek(level, plan.durationWeeks);
			setEnrollmentResult({ fitnessLevel: level, startWeek });
			setEnrolled(true);
			setShowAssessment(false);
		} catch (err) {
			console.error("Enrollment failed:", err);
			alert(err instanceof Error ? err.message : "Enrollment failed");
		} finally {
			setEnrolling(false);
		}
	};

	// Group workouts by week
	const weeks: Record<number, typeof workouts> = {};
	for (const workout of workouts) {
		if (!weeks[workout.weekNumber]) weeks[workout.weekNumber] = [];
		weeks[workout.weekNumber].push(workout);
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

				{isEnrolledInThisPlan || enrolled ? (
					<div className="space-y-3">
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
						{enrollmentResult && enrollmentResult.startWeek > 1 && (
							<div className="px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] text-sm rounded">
								<p className="font-medium mb-1">Your plan has been adapted</p>
								<p className="text-[var(--muted-foreground)]">
									Based on your assessment, you were rated as{" "}
									<strong className="capitalize text-[var(--foreground)]">
										{enrollmentResult.fitnessLevel}
									</strong>
									. Your training starts at{" "}
									<strong className="text-[var(--foreground)]">
										Week {enrollmentResult.startWeek}
									</strong>{" "}
									instead of Week 1.
								</p>
							</div>
						)}
					</div>
				) : (
					<button
						onClick={() => setShowAssessment(true)}
						className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
					>
						Start This Plan
					</button>
				)}
			</div>

			<div className="space-y-6">
				{Object.entries(weeks).map(([weekNum, weekWorkouts]) => (
					<div key={weekNum} className="border border-[var(--border)] rounded">
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
											<p className="text-sm font-medium">{workout.title}</p>
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

			{/* Assessment Modal */}
			{showAssessment && (
				<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setShowAssessment(false)}
					/>
					<div className="relative bg-[var(--background)] border border-[var(--border)] w-full max-w-md p-6 rounded">
						<h2 className="text-xl font-bold mb-2">Fitness Assessment</h2>
						<p className="text-sm text-[var(--muted-foreground)] mb-6">
							Help us personalize your plan by answering a few quick questions
							about your current fitness.
						</p>

						<div className="space-y-4 mb-6">
							<label className="flex items-start gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={assessment.canRun2kNonstop}
									onChange={(e) =>
										setAssessment({
											...assessment,
											canRun2kNonstop: e.target.checked,
										})
									}
									className="mt-0.5 h-4 w-4"
								/>
								<span className="text-sm">I can run 2 km without stopping</span>
							</label>

							<label className="flex items-start gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={assessment.canRun5kNonstop}
									onChange={(e) =>
										setAssessment({
											...assessment,
											canRun5kNonstop: e.target.checked,
										})
									}
									className="mt-0.5 h-4 w-4"
								/>
								<span className="text-sm">I can run 5 km without stopping</span>
							</label>

							<label className="flex items-start gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={assessment.canRun5kUnder30}
									onChange={(e) =>
										setAssessment({
											...assessment,
											canRun5kUnder30: e.target.checked,
										})
									}
									className="mt-0.5 h-4 w-4"
								/>
								<span className="text-sm">
									I can run 5 km in under 30 minutes
								</span>
							</label>

							<label className="flex items-start gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={assessment.canRun10kNonstop}
									onChange={(e) =>
										setAssessment({
											...assessment,
											canRun10kNonstop: e.target.checked,
										})
									}
									className="mt-0.5 h-4 w-4"
								/>
								<span className="text-sm">
									I can run 10 km without stopping
								</span>
							</label>

							<div>
								<label className="text-sm font-medium mb-1.5 block">
									Recent weekly mileage (km)
								</label>
								<input
									type="number"
									value={assessment.recentWeeklyMileage}
									onChange={(e) =>
										setAssessment({
											...assessment,
											recentWeeklyMileage: e.target.value,
										})
									}
									placeholder="e.g. 15"
									className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
								/>
							</div>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowAssessment(false)}
								className="flex-1 h-9 px-4 text-sm font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors rounded"
							>
								Cancel
							</button>
							<button
								onClick={handleEnroll}
								disabled={enrolling}
								className="flex-1 h-9 px-4 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity disabled:opacity-50 rounded"
							>
								{enrolling ? "Enrolling..." : "Enroll"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
