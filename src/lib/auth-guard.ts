import { createServerFn } from "@tanstack/react-start";
import { getSession } from "./session.ts";

export const requireAuth = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session?.user) {
			throw new Error("Unauthorized");
		}
		return session;
	},
);
