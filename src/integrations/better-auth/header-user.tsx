import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();
	const [imgError, setImgError] = useState(false);

	if (isPending) {
		return <div className="h-8 w-8 bg-[var(--muted)] animate-pulse rounded" />;
	}

	if (session?.user) {
		const name = session.user.name?.trim() || "";
		const image = session.user.image?.trim() || "";
		const initial = name.charAt(0).toUpperCase() || "U";

		return (
			<div className="flex items-center gap-2">
				{image && !imgError ? (
					<img
						src={image}
						alt=""
						className="h-8 w-8 rounded object-cover"
						onError={() => setImgError(true)}
					/>
				) : (
					<div className="h-8 w-8 bg-[var(--muted)] flex items-center justify-center rounded">
						<span className="text-xs font-medium text-[var(--muted-foreground)]">
							{initial}
						</span>
					</div>
				)}
				<button
					onClick={() => {
						void authClient.signOut();
					}}
					className="inline-flex h-9 w-9 items-center justify-center rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
					aria-label="Sign out"
				>
					<LogOut className="h-4 w-4" />
				</button>
			</div>
		);
	}

	return (
		<Link
			to="/auth"
			className="h-9 px-4 text-sm font-medium bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors inline-flex items-center rounded"
		>
			Sign in
		</Link>
	);
}
