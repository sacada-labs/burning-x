import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getUserPlanHistory, unenrollFromPlan } from "#/lib/plans.ts";
import { getAuthSession } from "#/lib/auth-server.ts";
import { useState } from "react";
import { Calendar, Target, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/history")({
	component: HistoryPage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({ to: "/auth" });
		}
		const history = await getUserPlanHistory();
		return { history };
	},
});

const distanceLabels: Record<string, string> = {
	"5k": "5K",
	"10k": "10K",
	half_marathon: "Half Marathon",
	marathon: "Marathon",
};

function HistoryPage() {
	const { history } = Route.useLoaderData();
	const [localHistory, setLocalHistory] = useState(history);
	const [unenrollingId, setUnenrollingId] = useState<number | null>(null);

	const handleUnenroll = async (userPlanId: number) => {
		setUnenrollingId(userPlanId);
		try {
			await unenrollFromPlan({ data: userPlanId });
			setLocalHistory((prev) =>
				prev.map((item) =>
					item.id === userPlanId ? { ...item, status: "abandoned" } : item,
				),
			);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to unenroll");
		} finally {
			setUnenrollingId(null);
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">History</h1>
				<p className="text-[var(--muted-foreground)]">
					Plans you've started or finished.
				</p>
			</div>

			{localHistory.length === 0 ? (
				<div className="text-center py-16">
					<AlertTriangle className="h-8 w-8 mx-auto mb-4 text-[var(--muted-foreground)]" />
					<p className="text-[var(--muted-foreground)] mb-4">No plans yet.</p>
					<Link
						to="/plans"
						className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
					>
						Browse Plans
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{localHistory.map((item) => {
						const isActive = item.status === "active";
						return (
							<div
								key={item.id}
								className="border border-[var(--border)] p-4 rounded"
							>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<h3 className="text-lg font-semibold">
												{item.plan.name}
											</h3>
											<span
												className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
													isActive
														? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
														: "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]"
												}`}
											>
												{isActive ? "Active" : "Stopped"}
											</span>
										</div>
										<div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
											<span className="inline-flex items-center gap-1">
												<Target className="h-3.5 w-3.5" />
												{distanceLabels[item.plan.distanceType] ||
													item.plan.distanceType}
											</span>
											<span className="inline-flex items-center gap-1">
												<Calendar className="h-3.5 w-3.5" />
												Started {new Date(item.startDate).toLocaleDateString()}
											</span>
											<span className="capitalize">{item.fitnessLevel}</span>
										</div>
									</div>

									<div className="flex items-center gap-2">
										{isActive && (
											<Link
												to="/schedule"
												className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors rounded"
											>
												View Schedule
											</Link>
										)}
										{isActive && (
											<button
												onClick={() => handleUnenroll(item.id)}
												disabled={unenrollingId === item.id}
												className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 rounded"
											>
												{unenrollingId === item.id
													? "Unenrolling..."
													: "Unenroll"}
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
