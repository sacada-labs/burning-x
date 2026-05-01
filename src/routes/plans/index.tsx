import { createFileRoute, Link } from "@tanstack/react-router";
import { getTrainingPlans } from "#/lib/plans.ts";
import { Clock, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/plans/")({
	component: PlansPage,
	loader: async () => {
		return getTrainingPlans();
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

function PlansPage() {
	const plans = Route.useLoaderData();

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">
					Training Plans
				</h1>
				<p className="text-neutral-500 dark:text-neutral-400">
					Choose a plan tailored to your goal. From your first 5K to your first
					marathon.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{plans.map((plan) => (
					<Link
						key={plan.id}
						to="/plans/$planId"
						params={{ planId: String(plan.id) }}
						className="group block p-6 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
					>
						<div className="flex items-start justify-between mb-3">
							<h2 className="text-lg font-semibold group-hover:underline">
								{plan.name}
							</h2>
							<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
								{distanceLabels[plan.distanceType] || plan.distanceType}
							</span>
						</div>

						<p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
							{plan.description}
						</p>

						<div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
							<span className="inline-flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								{plan.durationWeeks} weeks
							</span>
							<span className="inline-flex items-center gap-1">
								<Zap className="h-3.5 w-3.5" />
								{difficultyLabels[plan.difficulty] || plan.difficulty}
							</span>
							<span className="inline-flex items-center gap-1">
								<Target className="h-3.5 w-3.5" />
								{distanceLabels[plan.distanceType] || plan.distanceType}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
