import { Link, useLocation } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { Home, Target, Calendar, History, Settings } from "lucide-react";

export default function BottomNav() {
	const { data: session } = authClient.useSession();
	const isLoggedIn = !!session?.user;
	const pathname = useLocation().pathname;

	if (!isLoggedIn) return null;

	const tabs = [
		{ to: "/", label: "Home", icon: Home },
		{ to: "/plans", label: "Plans", icon: Target },
		{ to: "/schedule", label: "Schedule", icon: Calendar },
		{ to: "/history", label: "History", icon: History },
		{ to: "/settings", label: "Settings", icon: Settings },
	];

	return (
		<nav
			className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)]"
			style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
		>
			<div className="flex items-center justify-around h-14">
				{tabs.map((tab) => {
					const isActive =
						tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
					const Icon = tab.icon;

					return (
						<Link
							key={tab.to}
							to={tab.to}
							className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full no-underline"
						>
							<Icon
								className={`h-5 w-5 ${
									isActive
										? "text-[var(--foreground)]"
										: "text-[var(--muted-foreground)]"
								}`}
							/>
							<span
								className={`text-[10px] font-medium ${
									isActive
										? "text-[var(--foreground)]"
										: "text-[var(--muted-foreground)]"
								}`}
							>
								{tab.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
