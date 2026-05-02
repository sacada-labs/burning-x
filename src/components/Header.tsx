import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'

export default function Header() {
	const { data: session } = authClient.useSession()
	const isLoggedIn = !!session?.user

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)] px-4">
			<nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-sm text-[var(--foreground)] no-underline sm:px-4 sm:py-2"
					>
						<span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
						Runna
					</Link>
				</h2>

				{isLoggedIn && (
					<div className="order-3 flex w-full flex-wrap items-center gap-x-1 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:ml-auto sm:w-auto sm:flex-nowrap sm:pb-0">
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

				<div className="ml-auto flex items-center gap-2 sm:ml-0">
					{isLoggedIn && <BetterAuthHeader />}
					<ThemeToggle />
				</div>
			</nav>
		</header>
	)
}
