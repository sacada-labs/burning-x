import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<div className="max-w-2xl mx-auto px-4 py-12">
			<h1 className="text-3xl font-bold tracking-tight mb-4">
				About burning-x
			</h1>
			<p className="text-[var(--muted-foreground)] mb-6 leading-relaxed">
				burning-x is a personal running coach in your pocket. Choose a training
				plan tailored to your goal — whether it is your first 5K or your first
				marathon — and follow a structured schedule designed to get you there.
			</p>

			<h2 className="text-xl font-semibold mb-3">How it works</h2>
			<ul className="space-y-3 text-[var(--muted-foreground)] mb-8">
				<li className="flex gap-3">
					<span className="font-semibold text-[var(--foreground)]">1.</span>
					<span>
						Pick a plan based on your target distance and current fitness level.
					</span>
				</li>
				<li className="flex gap-3">
					<span className="font-semibold text-[var(--foreground)]">2.</span>
					<span>
						Follow the weekly schedule of easy runs, tempo runs, intervals, and
						long runs.
					</span>
				</li>
				<li className="flex gap-3">
					<span className="font-semibold text-[var(--foreground)]">3.</span>
					<span>Log each workout and track your progress toward race day.</span>
				</li>
			</ul>

			<h2 className="text-xl font-semibold mb-3">Available Plans</h2>
			<div className="grid gap-3 sm:grid-cols-2 mb-8">
				{[
					{ name: "Couch to 5K", duration: "8 weeks", level: "Beginner" },
					{ name: "Beginner 10K", duration: "10 weeks", level: "Beginner" },
					{
						name: "Beginner Half Marathon",
						duration: "12 weeks",
						level: "Beginner",
					},
					{
						name: "Beginner Marathon",
						duration: "16 weeks",
						level: "Beginner",
					},
				].map((plan) => (
					<div
						key={plan.name}
						className="p-4 border border-[var(--border)] rounded"
					>
						<p className="font-medium text-sm">{plan.name}</p>
						<p className="text-xs text-[var(--muted-foreground)]">
							{plan.duration} · {plan.level}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
