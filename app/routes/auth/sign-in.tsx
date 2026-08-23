import BadgeAlert from '@/components/icons/badge-alert';
import BlockedIcon from '@/components/icons/blocked-icon';
import Eye from '@/components/icons/eye';
import EyeClose from '@/components/icons/eye-close';
import Loader from '@/components/icons/loader';
import Lock from '@/components/icons/lock';
import Logo from '@/components/icons/logo';
import { Mail } from '@/components/icons/mail';
import UserShield from '@/components/icons/user-shield';
import X from '@/components/icons/x';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
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
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, redirect, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { v4 as uuidV4 } from 'uuid';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import MonitorSmartphone from '@/components/icons/monitor-smartphone';

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
	const sessionModalOpen = useAuthStore((state) => state.sessionOpenModal);
	const setSessionModalOpen = useAuthStore((state) => state.setSessionOpenModal);
	const setSessionId = useAuthStore((state) => state.setSessionId);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [sessionDupModalOpen, setSessionDupModalOpen] = useState(false);

	const [passwordVisible, setPasswordVisible] = useState(false);
	const { control, handleSubmit, setError, clearErrors, watch } = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	const password = watch('password');
	const handleSignIn = async () => {
		if (auth.currentUser) {
			const sessionId = uuidV4();

			const userDoc = doc(db, 'users', auth.currentUser.uid);
			setSessionId(sessionId);
			await setDoc(
				userDoc,
				{
					currentSessionId: sessionId
				},
				{ merge: true }
			);

			navigate('/');
			toast.success('Account Signed In Successfully!', {
				position: 'top-right',
				description: `Last Sign In: ${auth.currentUser?.metadata.lastSignInTime}`,
				descriptionClassName: 'text-red',
				duration: 20000,
				icon: <UserShield className='text-green-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
		}
	};
	const signInMutation = useMutation({
		mutationFn: async ({ email, password }: FormValues) => {
			await signInWithEmailAndPassword(auth, email, password);
		},

		onMutate: () => clearErrors(),

		onSuccess: async () => {
			const user = await auth.currentUser?.getIdTokenResult();

			const isAllowed =
				user?.claims.role === 'admin' || user?.claims.role === 'superadmin';

			if (isAllowed && auth.currentUser) {
				if (user.claims.role === 'superadmin') {
					useAuthStore.getState().setIsSuperAdmin(true);
				}

				const userDoc = doc(db, 'users', auth.currentUser.uid);
				const userSnap = await getDoc(userDoc);
				const userData = userSnap.data();

				if (userData?.currentSessionId && userData.currentSessionId.length > 0) {
					setSessionDupModalOpen(true);
					return;
				}

				handleSignIn();
			} else {
				signOut(auth);
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
				setDialogOpen(true);
				return;
			}

			setError('email', { message });
			setError('password', { message });

			toast.error('Account Login Failed', {
				description: message,
				position: 'top-center',
				duration: 12000,
				icon: <BadgeAlert className='text-red-500 size-5' />,
				cancel: {
					label: <X className='size-6 hover:bg-muted/80 duration-300 rounded-full p-1' />,
					onClick: () => {}
				}
			});
		}
	});

	const onSubmit = async (data: FormValues) => {
		signInMutation.mutate(data);
	};

	return (
		<>
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

			<AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<AlertDialogContent className='sm:max-w-[350px]'>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex flex-row-reverse items-center gap-x-1'>
							<BlockedIcon className='text-red-400 size-6' />
							Access Restricted
						</AlertDialogTitle>
						<AlertDialogDescription className='flex flex-col'>
							Your account has been permanently banned. You no longer have access to this
							platform, its services, or your saved data. All active sessions have been
							terminated
							<span className='flex flex-col mt-4'>
								Contact:
								<span>support@beauwise.tech</span>
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<Button type='button' variant='ghost' onClick={() => setDialogOpen(false)}>
							Close
						</Button>
						<Button
							render={<Link target='_blank' to={'mailto:support@beauwise.tech'} />}
							onClick={() => {}}
						>
							Contact Support
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={sessionDupModalOpen} onOpenChange={setSessionDupModalOpen}>
				<AlertDialogContent className='sm:max-w-[550px]'>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex flex-row-reverse items-center gap-x-1'>
							<MonitorSmartphone className='text-primary size-6' />
							Duplicate Session Detected
						</AlertDialogTitle>
						<AlertDialogDescription className='flex flex-col'>
							If you continue, your active session on the other device will be
							disconnected immediately, and this device will become your primary active
							workspace.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<Button variant='ghost' onClick={() => setSessionDupModalOpen(false)}>
							Cancel (Keep other session)
						</Button>
						<Button onClick={handleSignIn}>Disconnect Other & Continue</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={sessionModalOpen} onOpenChange={setSessionModalOpen}>
				<AlertDialogContent className='sm:max-w-[350px]'>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex flex-row-reverse items-center gap-x-1'>
							<BlockedIcon className='text-red-400 size-6' />
							Session Expired
						</AlertDialogTitle>
						<AlertDialogDescription className='flex flex-col'>
							Your active session has been revoked by a superadmin or a security policy.
							For your protection, you have been securely logged out of this device. Any
							unsaved changes have been discarded.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<Button onClick={() => setSessionModalOpen(false)}>I understand</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
