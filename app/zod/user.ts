import { z } from 'zod';

const ALLOWED_DOMAINS = ['beauwise.tech', 'gmail.com'];
export const newUser = z.object({
	email: z.email().refine(
		(email) => {
			const domain = email.split('@')[1]?.toLowerCase();
			return ALLOWED_DOMAINS.includes(domain);
		},
		{
			message: `Email must belong to an authorized domain: ${ALLOWED_DOMAINS.join(', ')}`
		}
	),
	role: z.string().optional(),
	password: z
		.string()
		.min(8, { error: 'Password must be at least 8 characters long' })
		.max(20, { error: 'Password must be at most 20 characters long' })
		.refine((password) => /[A-Z]/.test(password), {
			error: 'Password must contain at least one uppercase letter'
		})
		.refine((password) => /[a-z]/.test(password), {
			error: 'Password must contain at least one lowercase letter'
		})
		.refine((password) => /[0-9]/.test(password), {
			error: 'Password must contain at least one number'
		})
		.refine((password) => /[!@#$%^&*]/.test(password), {
			error: 'Password must contain at least one special character'
		})
});

export type NewUserFormValues = z.infer<typeof newUser>;
