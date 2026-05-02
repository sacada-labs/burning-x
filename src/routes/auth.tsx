import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authClient } from "#/lib/auth-client";
import { getUserProfile } from "#/lib/plans.ts";

export const Route = createFileRoute("/auth")({
	component: AuthPage,
});

function AuthRedirect() {
	useEffect(() => {
		getUserProfile().then((profile) => {
			window.location.href = profile ? "/" : "/onboarding";
		});
	}, []);
	return (
		<div className="flex items-center justify-center py-10">
			<div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
		</div>
	);
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor">
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
		</svg>
	);
}

function AuthPage() {
	const { data: session, isPending } = authClient.useSession();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [signedUp, setSignedUp] = useState(false);

	if (isPending) {
		return (
			<div className="flex items-center justify-center py-10">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
			</div>
		);
	}

	if (session?.user) {
		return <AuthRedirect />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (isSignUp) {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
				});
				if (result.error) {
					setError(result.error.message || "Sign up failed");
				} else {
					setSignedUp(true);
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				});
				if (result.error) {
					setError(result.error.message || "Sign in failed");
				} else {
					// Check if user has profile, redirect accordingly
					const profile = await getUserProfile();
					if (!profile) {
						window.location.href = "/onboarding";
					} else {
						window.location.href = "/";
					}
				}
			}
		} catch (err) {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (signedUp) {
		return (
			<div className="max-w-md mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Account created</h1>
				<p className="text-[var(--muted-foreground)] mb-8">
					Welcome. Let's set up your profile before you start training.
				</p>
				<Link
					to="/onboarding"
					className="inline-flex items-center px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
				>
					Set Up Profile
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto px-4 py-16">
			<h1 className="text-2xl font-bold tracking-tight mb-2">
				{isSignUp ? "Create an account" : "Sign in"}
			</h1>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">
				{isSignUp ? "Create your account" : "Email and password to sign in"}
			</p>

			<button
				type="button"
				onClick={() => {
					void authClient.signIn.social({
						provider: "google",
						callbackURL: "/",
					});
				}}
				className="w-full h-9 px-4 text-sm font-medium border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors inline-flex items-center justify-center gap-2 rounded"
			>
				<GoogleIcon className="h-4 w-4" />
				Continue with Google
			</button>

			<div className="relative my-2">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-[var(--border)]" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">
						or
					</span>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="grid gap-4">
				{isSignUp && (
					<div className="grid gap-2">
						<label htmlFor="name" className="text-sm font-medium leading-none">
							Name
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							required
						/>
					</div>
				)}

				<div className="grid gap-2">
					<label htmlFor="email" className="text-sm font-medium leading-none">
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
						required
					/>
				</div>

				<div className="grid gap-2">
					<label
						htmlFor="password"
						className="text-sm font-medium leading-none"
					>
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
						required
						minLength={8}
					/>
				</div>

				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					</div>
				)}

				<button
					type="submit"
					disabled={loading}
					className="w-full h-9 px-4 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded"
				>
					{loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
				</button>
			</form>

			<div className="mt-4 text-center">
				<button
					type="button"
					onClick={() => {
						setIsSignUp(!isSignUp);
						setError("");
					}}
					className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
				>
					{isSignUp
						? "Already have an account? Sign in"
						: "Don't have an account? Sign up"}
				</button>
			</div>
		</div>
	);
}
