import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
	Palette,
	Info,
	LogOut,
	ChevronRight,
	Sun,
	Moon,
	Monitor,
	Pencil,
	X,
	Check,
} from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { getAuthSession } from "#/lib/auth-server";
import { getUserProfile, saveUserProfile } from "#/lib/plans";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({ to: "/auth" });
		}
		const profile = await getUserProfile();
		return { profile };
	},
});

type ThemeMode = "light" | "dark" | "auto";

function getStoredTheme(): ThemeMode {
	if (typeof window === "undefined") return "auto";
	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}
	return "auto";
}

function applyTheme(mode: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(resolved);

	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", mode);
	}

	document.documentElement.style.colorScheme = resolved;
}

function SettingsPage() {
	const { profile } = Route.useLoaderData();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());
	const [editingProfile, setEditingProfile] = useState(false);
	const [saving, setSaving] = useState(false);
	const [imgError, setImgError] = useState(false);

	const [form, setForm] = useState({
		birthYear: profile?.birthYear ? String(profile.birthYear) : "",
		gender: profile?.gender ?? "",
		weightKg: profile?.weightKg ? String(profile.weightKg) : "",
		heightCm: profile?.heightCm ? String(profile.heightCm) : "",
	});

	function setThemeMode(mode: ThemeMode) {
		setTheme(mode);
		applyTheme(mode);
		window.localStorage.setItem("theme", mode);
	}

	async function handleSaveProfile() {
		setSaving(true);
		try {
			await saveUserProfile({
				data: {
					birthYear: form.birthYear
						? Number.parseInt(form.birthYear, 10)
						: undefined,
					gender: form.gender || undefined,
					weightKg: form.weightKg
						? Number.parseFloat(form.weightKg)
						: undefined,
					heightCm: form.heightCm
						? Number.parseFloat(form.heightCm)
						: undefined,
				},
			});
			setEditingProfile(false);
		} catch {
			alert("Failed to save profile");
		} finally {
			setSaving(false);
		}
	}

	const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
		{ mode: "light", label: "Light", icon: Sun },
		{ mode: "dark", label: "Dark", icon: Moon },
		{ mode: "auto", label: "Auto", icon: Monitor },
	];

	return (
		<div className="page-wrap px-4 py-6">
			<h1 className="text-xl font-bold tracking-tight mb-6">Settings</h1>

			{/* Profile Card */}
			<div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 mb-6">
				<div className="flex items-center gap-3">
					{user?.image?.trim() && !imgError ? (
						<img
							src={user.image.trim()}
							alt=""
							className="h-12 w-12 rounded-full object-cover"
							onError={() => setImgError(true)}
						/>
					) : (
						<div className="h-12 w-12 rounded-full bg-[var(--muted)] flex items-center justify-center">
							<span className="text-base font-medium text-[var(--muted-foreground)]">
								{user?.name?.trim().charAt(0).toUpperCase() || "U"}
							</span>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-[var(--foreground)] truncate">
							{user?.name?.trim() || "User"}
						</p>
						<p className="text-xs text-[var(--muted-foreground)] truncate">
							{user?.email || ""}
						</p>
					</div>
					<button
						type="button"
						onClick={() => setEditingProfile(!editingProfile)}
						className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
						aria-label={editingProfile ? "Cancel editing" : "Edit profile"}
					>
						{editingProfile ? (
							<X className="h-4 w-4" />
						) : (
							<Pencil className="h-4 w-4" />
						)}
					</button>
				</div>

				{/* Inline Edit Form */}
				{editingProfile && (
					<div className="mt-4 pt-4 border-t border-[var(--border)] grid gap-3">
						<div>
							<label className="text-xs font-medium mb-1 block text-[var(--muted-foreground)]">
								Birth Year
							</label>
							<input
								type="number"
								value={form.birthYear}
								onChange={(e) =>
									setForm({ ...form, birthYear: e.target.value })
								}
								placeholder="1990"
								className="flex h-9 w-full border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							/>
						</div>
						<div>
							<label className="text-xs font-medium mb-1 block text-[var(--muted-foreground)]">
								Gender
							</label>
							<select
								value={form.gender}
								onChange={(e) => setForm({ ...form, gender: e.target.value })}
								className="flex h-9 w-full border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							>
								<option value="">Select</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
								<option value="prefer_not_to_say">Prefer not to say</option>
							</select>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="text-xs font-medium mb-1 block text-[var(--muted-foreground)]">
									Weight (kg)
								</label>
								<input
									type="number"
									step="0.1"
									value={form.weightKg}
									onChange={(e) =>
										setForm({ ...form, weightKg: e.target.value })
									}
									placeholder="70"
									className="flex h-9 w-full border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
								/>
							</div>
							<div>
								<label className="text-xs font-medium mb-1 block text-[var(--muted-foreground)]">
									Height (cm)
								</label>
								<input
									type="number"
									value={form.heightCm}
									onChange={(e) =>
										setForm({ ...form, heightCm: e.target.value })
									}
									placeholder="175"
									className="flex h-9 w-full border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
								/>
							</div>
						</div>
						<button
							onClick={handleSaveProfile}
							disabled={saving}
							className="w-full h-9 px-4 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity disabled:opacity-50 rounded inline-flex items-center justify-center gap-2"
						>
							<Check className="h-4 w-4" />
							{saving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				)}
			</div>

			{/* Appearance */}
			<div className="mb-6">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 px-1">
					Appearance
				</h2>
				<div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] overflow-hidden">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-3">
							<Palette className="h-4 w-4 text-[var(--muted-foreground)]" />
							<span className="text-sm font-medium">Theme</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							{themeOptions.map((option) => {
								const Icon = option.icon;
								const isActive = theme === option.mode;
								return (
									<button
										key={option.mode}
										type="button"
										onClick={() => setThemeMode(option.mode)}
										className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
											isActive
												? "border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)]"
												: "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
										}`}
									>
										<Icon className="h-4 w-4" />
										{option.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Links */}
			<div className="mb-6">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 px-1">
					About
				</h2>
				<div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] overflow-hidden">
					<Link
						to="/about"
						className="flex items-center gap-3 px-4 py-3 no-underline text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
					>
						<Info className="h-4 w-4 text-[var(--muted-foreground)]" />
						<span className="text-sm font-medium flex-1">About burning-x</span>
						<ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
					</Link>
				</div>
			</div>

			{/* Account */}
			<div className="mb-6">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 px-1">
					Account
				</h2>
				<div className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] overflow-hidden">
					<button
						type="button"
						onClick={() => {
							void authClient.signOut();
						}}
						className="flex items-center gap-3 px-4 py-3 w-full text-left text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
					>
						<LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
						<span className="text-sm font-medium flex-1 text-red-600 dark:text-red-400">
							Sign Out
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
