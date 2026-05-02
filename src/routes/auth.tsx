import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/auth')({
	component: AuthPage,
})

function AuthPage() {
	const { data: session, isPending } = authClient.useSession()
	const [isSignUp, setIsSignUp] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	if (isPending) {
		return (
			<div className="flex items-center justify-center py-10">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
			</div>
		)
	}

	if (session?.user) {
		return (
			<div className="max-w-md mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Welcome back</h1>
				<p className="text-[var(--muted-foreground)] mb-6">
					You are signed in as {session.user.email}
				</p>
				<button
					onClick={() => {
						void authClient.signOut()
					}}
					className="px-4 py-2 text-sm font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors rounded"
				>
					Sign out
				</button>
			</div>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			if (isSignUp) {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
				})
				if (result.error) {
					setError(result.error.message || 'Sign up failed')
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				})
				if (result.error) {
					setError(result.error.message || 'Sign in failed')
				}
			}
		} catch (err) {
			setError('An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-md mx-auto px-4 py-16">
			<h1 className="text-2xl font-bold tracking-tight mb-2">
				{isSignUp ? 'Create an account' : 'Sign in'}
			</h1>
			<p className="text-sm text-[var(--muted-foreground)] mb-8">
				{isSignUp
					? 'Enter your information to create an account'
					: 'Enter your email below to login to your account'}
			</p>

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
					{loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
				</button>
			</form>

			<div className="mt-4 text-center">
				<button
					type="button"
					onClick={() => {
						setIsSignUp(!isSignUp)
						setError('')
					}}
					className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
				>
					{isSignUp
						? 'Already have an account? Sign in'
						: "Don't have an account? Sign up"}
				</button>
			</div>
		</div>
	)
}
