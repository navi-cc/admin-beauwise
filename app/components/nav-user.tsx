import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from '@/components/ui/sidebar';
import {
	CaretUpDownIcon,
	SparkleIcon,
	CheckCircleIcon,
	CreditCardIcon,
	BellIcon,
	SignOutIcon
} from '@phosphor-icons/react';
import { Button } from './ui/button';
import User from './icons/user';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from './ui/alert-dialog';
import { signOut } from 'firebase/auth';
import { redirect, useNavigate } from 'react-router';
import { toast } from 'sonner';
import ChevronsLeftRight from './icons/chevrons-left-right';

export function NavUser({
	user
}: {
	user: {
		name: string;
		email: string;
	};
}) {
	const navigate = useNavigate();
	const { isMobile } = useSidebar();
	const [visible, setVisible] = useState(false);

	const handleConfirmLogout = async () => {
		setVisible(false);

		try {
			await signOut(auth);
			navigate('/sign-in', { replace: true });
		} catch {
			toast.error('Logout failed. Please try again');
		}
	};
	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<SidebarMenuButton size='lg' className='aria-expanded:bg-muted' />}
						>
							<Avatar>
								<AvatarImage src={auth.currentUser?.photoURL as string} />
								<AvatarFallback className='bg-red'>
									<User className='self-center text-primary' />
								</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left leading-tight'>
								<span className='truncate font-medium text-sidebar-foreground'>
									{auth.currentUser?.displayName}
								</span>
								<span className='truncate text-xs font-extralight'>
									{auth.currentUser?.email}
								</span>
							</div>
							<ChevronsLeftRight className='ml-auto size-4 rotate-z-[180deg]!' />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className='w-fit'
							side={isMobile ? 'bottom' : 'right'}
							align='end'
							sideOffset={4}
						>
							<DropdownMenuGroup>
								<DropdownMenuLabel className='p-0 font-normal'>
									<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
										<User className='size-4' />
										<div className='grid flex-1 text-left text-sm leading-tight'>
											<span className='truncate font-medium'>
												{auth.currentUser?.displayName}
											</span>
											<span className='truncate text-xs'>{auth.currentUser?.email}</span>
										</div>
									</div>
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={() => setVisible(true)}>
								<SignOutIcon />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<AlertDialog open={visible} onOpenChange={setVisible}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
						{/* <AlertDialogDescription>
							This action cannot be undone. This will permanently delete your account from
							our servers.
						</AlertDialogDescription> */}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>No</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmLogout}>Yes</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
