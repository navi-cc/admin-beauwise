import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton
} from '@/components/ui/sidebar';
import { NavLink, useNavigation } from 'react-router';
import ArrowLeft from './icons/arrow-left';

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
			<SidebarGroupLabel>Explore</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<NavLink key={item.path} viewTransition to={item.path}>
						{({ isActive }) => (
							<SidebarMenuButton
								className='group transition-all duration-180 ease-linear data-active:bg-primary data-active:hover:bg-primary data-active:text-white data-active:hover:text-white'
								isActive={isActive}
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
