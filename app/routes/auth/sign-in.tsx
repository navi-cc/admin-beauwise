import Eye from '@/components/icons/eye';
import EyeClose from '@/components/icons/eye-close';
import Loader from '@/components/icons/loader';
import Lock from '@/components/icons/lock';
import Logo from '@/components/icons/logo';
import { Mail } from '@/components/icons/mail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { redirect, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(4, { error: 'Invalid password' })
});

type FormValues = z.infer<typeof formSchema>;

export function meta() {
	return [{ title: 'Admin BeauWise | Sign In' }];
}

export async function clientLoader() {
	await auth.authStateReady();

	const user = await auth.currentUser?.getIdTokenResult();
	const isAllowed = user?.claims.role === 'admin' || user?.claims.role === 'superadmin';

	if (auth.currentUser && isAllowed) {
		return redirect('/');
	}

	return null;
}

export default function SignIn() {
	const navigate = useNavigate();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const { control, handleSubmit, setError, clearErrors, watch } = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	const password = watch('password');

	const signInMutation = useMutation({
		mutationFn: async ({ email, password }: FormValues) => {
			await signInWithEmailAndPassword(auth, email, password);
		},

		onMutate: () => clearErrors(),

		onSuccess: async () => {
			const user = await auth.currentUser?.getIdTokenResult();

			const isAllowed =
				user?.claims.role === 'admin' || user?.claims.role === 'superadmin';

			if (isAllowed) {
				if (user.claims.role === 'superadmin') {
					useAuthStore.getState().setIsSuperAdmin(true);
				}

				navigate('/');
				toast.success('Logged in successfully!', { position: 'top-right' });
			} else {
				throw new FirebaseError(
					'permission-denied',
					'You are not allowed to login with this account.'
				);
			}
		},

		onError: (
			err: Error & {
				code: string;
			}
		) => {
			let message = 'Invalid credentials';

			if (err.message && !err?.code.startsWith('auth/')) {
				console.log(!err?.code.startsWith('auth/'));

				message = err.message;
			}

			if (err?.code === 'auth/user-disabled') {
				message = 'This user has been disabled. Please contact the developer';
			}

			setError('email', { message });
			setError('password', { message });

			toast.error('Login failed. Please try again', {
				position: 'top-center',
				duration: 10000
			});
		}
	});

	const onSubmit = async (data: FormValues) => {
		signInMutation.mutate(data);
	};

	return (
		<div className='w-full h-dvh flex flex-col items-center justify-center'>
			<Logo className='size-30 mt-40' />

			<Card className='w-full max-w-sm'>
				<CardContent>
					<div className='flex flex-col gap-4'>
						<Controller
							control={control}
							name='email'
							render={({ field, fieldState: { error } }) => {
								return (
									<Field>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<InputGroup>
											<InputGroupAddon>
												<Mail />
											</InputGroupAddon>
											<InputGroupInput
												type='email'
												{...field}
												placeholder='johndoe@email.com'
											/>
										</InputGroup>
										<FieldError errors={[error]} />
									</Field>
								);
							}}
						/>

						<Controller
							control={control}
							name='password'
							render={({ field, fieldState: { error } }) => {
								return (
									<Field>
										<FieldLabel htmlFor={field.name}>Password</FieldLabel>
										<InputGroup>
											<InputGroupAddon>
												<Lock />
											</InputGroupAddon>
											<InputGroupInput
												placeholder='Enter password'
												type={passwordVisible ? 'text' : 'password'}
												{...field}
											/>

											{password.length > 0 && (
												<InputGroupButton
													onClick={() => setPasswordVisible((prev) => !prev)}
												>
													{passwordVisible ? <Eye /> : <EyeClose />}
												</InputGroupButton>
											)}
										</InputGroup>
										<FieldError errors={[error]} />
									</Field>
								);
							}}
						/>
					</div>
				</CardContent>
				<CardFooter className='flex-col gap-2'>
					<Button
						disabled={signInMutation.isPending}
						onClick={handleSubmit(onSubmit)}
						type='submit'
						className='w-full'
					>
						{signInMutation.isPending ? 'Logging in...' : 'Login'}
						{signInMutation.isPending && <Loader className='animate-spin size-4' />}
					</Button>
				</CardFooter>
			</Card>

			<h1 className='text-xs mt-auto mb-4'>version 1.0.0</h1>
		</div>
	);
}
