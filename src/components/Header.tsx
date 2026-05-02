import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'

export default function Header() {
	const { data: session } = authClient.useSession()
	const isLoggedIn = !!session?.user

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)] px-4">
			<nav className="page-wrap flex items-center justify-between h-14">
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-base font-semibold tracking-tight no-underline text-[var(--foreground)]"
				>
					<span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
					burning-x
				</Link>

				{/* Desktop nav - hidden on mobile */}
				{isLoggedIn && (
					<div className="hidden sm:flex items-center gap-1 text-sm font-semibold">
						<Link
							to="/"
							className="nav-link"
							activeProps={{ className: 'nav-link is-active' }}
						>
							Home
						</Link>
						<Link
							to="/plans"
							className="nav-link"
							activeProps={{ className: 'nav-link is-active' }}
						>
							Plans
						</Link>
						<Link
							to="/schedule"
							className="nav-link"
							activeProps={{ className: 'nav-link is-active' }}
						>
							Schedule
						</Link>
					</div>
				)}

				<div className="flex items-center gap-2">
					{isLoggedIn && (
						<div className="hidden sm:block">
							<BetterAuthHeader />
						</div>
					)}
					<ThemeToggle />
				</div>
			</nav>
		</header>
	)
}
