import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();
	const [imgError, setImgError] = useState(false);

	if (isPending) {
		return (
			<div className="h-8 w-8 rounded-full bg-[var(--muted)] animate-pulse" />
		);
	}

	if (session?.user) {
		const name = session.user.name?.trim() || "";
		const image = session.user.image?.trim() || "";
		const initial = name.charAt(0).toUpperCase() || "U";

		return (
			<Link
				to="/settings"
				className="block h-8 w-8 rounded-full overflow-hidden ring-1 ring-transparent hover:ring-[var(--border)] transition-all"
				aria-label="Go to settings"
			>
				{image && !imgError ? (
					<img
						src={image}
						alt=""
						className="h-full w-full object-cover"
						onError={() => setImgError(true)}
					/>
				) : (
					<div className="h-full w-full bg-[var(--muted)] flex items-center justify-center">
						<span className="text-xs font-medium text-[var(--muted-foreground)]">
							{initial}
						</span>
					</div>
				)}
			</Link>
		);
	}

	return (
		<Link
			to="/auth"
			className="h-8 px-3 text-sm font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors inline-flex items-center rounded-full"
		>
			Sign in
		</Link>
	);
}
