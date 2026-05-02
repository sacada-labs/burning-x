import { createServerFn } from '@tanstack/react-start'
import { getSession } from './session.ts'

export const getAuthSession = createServerFn({ method: 'GET' }).handler(
	async () => {
		return getSession()
	},
)
