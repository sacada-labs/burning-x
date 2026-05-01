import { auth } from "./auth.ts";
import { getRequest } from "@tanstack/react-start/server";

export async function getSession() {
	const request = getRequest();
	if (!request) return null;

	const session = await auth.api.getSession({
		headers: request.headers,
	});

	return session;
}
