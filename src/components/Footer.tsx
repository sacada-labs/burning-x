export default function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer className="hidden sm:block mt-20 border-t border-[var(--border)] px-4 pb-14 pt-10 text-[var(--muted-foreground)]">
			<div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
				<p className="m-0 text-sm">&copy; {year} Runna. All rights reserved.</p>
				<p className="m-0 text-xs">Your personal running coach.</p>
			</div>
		</footer>
	)
}
