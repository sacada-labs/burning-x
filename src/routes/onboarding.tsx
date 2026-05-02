import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getAuthSession } from "#/lib/auth-server.ts";
import { saveUserProfile, getUserProfile } from "#/lib/plans.ts";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({ to: "/auth" });
		}
		const profile = await getUserProfile();
		return { profile };
	},
});

function OnboardingPage() {
	const { profile } = Route.useLoaderData();
	const [step, setStep] = useState(profile ? 2 : 1);
	const [form, setForm] = useState({
		birthYear: profile?.birthYear ? String(profile.birthYear) : "",
		gender: profile?.gender ?? "",
		weightKg: profile?.weightKg ? String(profile.weightKg) : "",
		heightCm: profile?.heightCm ? String(profile.heightCm) : "",
	});
	const [saving, setSaving] = useState(false);

	const handleSaveProfile = async () => {
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
			setStep(2);
		} catch {
			alert("Failed to save profile");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-4 py-12">
			{step === 1 && (
				<div>
					<h1 className="text-2xl font-bold tracking-tight mb-2">
						Welcome to burning-x
					</h1>
					<p className="text-[var(--muted-foreground)] mb-8">
						We use this to set up your plans. Nothing else.
					</p>

					<div className="grid gap-4">
						<div>
							<label className="text-sm font-medium mb-1.5 block">
								Birth Year
							</label>
							<input
								type="number"
								value={form.birthYear}
								onChange={(e) =>
									setForm({ ...form, birthYear: e.target.value })
								}
								placeholder="1990"
								className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							/>
						</div>

						<div>
							<label className="text-sm font-medium mb-1.5 block">Gender</label>
							<select
								value={form.gender}
								onChange={(e) => setForm({ ...form, gender: e.target.value })}
								className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							>
								<option value="">Select</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
								<option value="prefer_not_to_say">Prefer not to say</option>
							</select>
						</div>

						<div>
							<label className="text-sm font-medium mb-1.5 block">
								Weight (kg)
							</label>
							<input
								type="number"
								step="0.1"
								value={form.weightKg}
								onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
								placeholder="70"
								className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							/>
						</div>

						<div>
							<label className="text-sm font-medium mb-1.5 block">
								Height (cm)
							</label>
							<input
								type="number"
								value={form.heightCm}
								onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
								placeholder="175"
								className="flex h-9 w-full border border-[var(--border)] bg-transparent px-3 text-sm focus:outline-none focus:border-[var(--foreground)] rounded"
							/>
						</div>

						<button
							onClick={handleSaveProfile}
							disabled={saving}
							className="w-full h-9 px-4 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity disabled:opacity-50 rounded"
						>
							{saving ? "Saving..." : "Continue"}
						</button>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="text-center">
					<h1 className="text-2xl font-bold tracking-tight mb-2">
						You're all set
					</h1>
					<p className="text-[var(--muted-foreground)] mb-8">
						Profile saved. Pick a plan and start running.
					</p>
					<Link
						to="/plans"
						className="inline-flex items-center px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition-opacity rounded"
					>
						Browse Plans
					</Link>
				</div>
			)}
		</div>
	);
}
