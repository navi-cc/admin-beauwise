import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton
} from '@/components/ui/sidebar';
import { NavLink, useNavigation } from 'react-router';

export function NavMain({
	items
}: {
	items: {
		title: string;
		path: string;
		icon?: React.ReactNode;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<NavLink key={item.path} viewTransition to={item.path}>
						{({ isActive }) => (
							<SidebarMenuButton
								className='transition-all duration-180 ease-linear data-active:bg-primary data-active:hover:bg-primary data-active:text-white data-active:hover:text-white'
								isActive={isActive}
								tooltip={item.title}
							>
								{item.icon}
								<span>{item.title}</span>
							</SidebarMenuButton>
						)}
					</NavLink>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
