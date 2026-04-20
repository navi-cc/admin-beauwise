import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarRail,
	SidebarFooter,
	SidebarMenuItem,
	SidebarMenuButton
} from '@/components/ui/sidebar';
import {
	BookOpenTextIcon,
	GearIcon,
	UserIcon,
	UsersThreeIcon
} from '@phosphor-icons/react';
import { NavLink, useLocation } from 'react-router';
const appSideBarSchema = [
	{
		name: 'Learn Module',
		path: '/',
		icon: BookOpenTextIcon
	},

	{
		name: 'User Management',
		path: '/user-management',
		icon: UsersThreeIcon
	}
];

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function AppSideBar() {
	const location = useLocation();
	const currentPath = location.pathname;
	return (
		<Sidebar>
			<div className='flex gap-y-0 items-center p-2 gap-x-2'>
				<GearIcon size={20} />
				<div className='flex flex-col'>
					<span className='text-lg font-semibold'>Beauwise</span>
					<span className='text-[10px] uppercase font-light'>admin suite</span>
				</div>
			</div>

			<SidebarContent>
				{appSideBarSchema.map((item) => (
					<SidebarMenuItem key={item.name}>
						<Tooltip>
							<TooltipTrigger
								render={
									<SidebarMenuButton
										isActive={currentPath === item.path}
										render={
											<NavLink to={item.path}>
												{({ isActive }) => {
													return (
														<>
															<item.icon
																size={20}
																weight={isActive ? 'fill' : 'regular'}
															/>
															{item.name}
														</>
													);
												}}
											</NavLink>
										}
									/>
								}
							/>
							<TooltipContent side='right'>
								<p>{item.name}</p>
							</TooltipContent>
						</Tooltip>
					</SidebarMenuItem>
				))}
			</SidebarContent>

			<SidebarFooter>
				<span className='text-center text-xs'>version 1.0.0</span>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
