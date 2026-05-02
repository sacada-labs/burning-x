import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getTrainingPlans } from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { Clock, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/plans/")({
	component: PlansPage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({ to: "/auth" });
		}
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
				<p className="text-[var(--muted-foreground)]">
					Pick a plan that matches what you're after. First 5K, first marathon,
					or somewhere in between.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{plans.map((plan) => (
					<Link
						key={plan.id}
						to="/plans/$planId"
						params={{ planId: String(plan.id) }}
						className="group block p-6 border border-[var(--border)] hover:border-[var(--foreground)] transition-colors rounded"
					>
						<div className="flex items-start justify-between mb-3">
							<h2 className="text-lg font-semibold group-hover:underline">
								{plan.name}
							</h2>
							<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
								{distanceLabels[plan.distanceType] || plan.distanceType}
							</span>
						</div>

						<p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
							{plan.description}
						</p>

						<div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
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
