'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
	useSidebar
} from '@/components/ui/sidebar';

import AiNetworkIcon from '@/components/icons/ai-network';
import UserMultipleIcon from '@/components/icons/user-multiple';
import ThreeDScaleIcon from '@/components/icons/three-d-scale';
import CollectionsBookmark from '@/components/icons/collections-bookmark';
import Archive from '@/components/icons/archive';
import Books from '@/components/icons/books';
import { auth } from '@/lib/firebase';
import Logo from './icons/logo';
import { Link } from 'react-router';

const data = {
	user: {
		name: auth.currentUser?.displayName,
		email: auth.currentUser?.email
	},
	teams: [
		{
			name: 'BeauWise',
			plan: 'Admin Suite'
		}
	],
	navMain: [
		{
			title: 'Users & Authentication',
			path: '/',
			icon: <UserMultipleIcon />
		},

		{
			title: 'Ingredients Glossary',
			path: 'ingredients-glossary',
			icon: <Books />
		},

		{
			title: 'Myths & Facts Directory',
			path: 'myths-facts-directory',
			icon: <Archive />
		},

		{
			title: 'Consumer Guide Collections',
			path: 'consumer-guides-collections',
			icon: <CollectionsBookmark />
		},

		{
			title: 'LLM Prompts',
			path: 'llm-ops',
			icon: <AiNetworkIcon />
		}
	]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { setOpen, open } = useSidebar();

	return (
		<Sidebar
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			collapsible='icon'
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem className='flex items-center pt-2'>
						<Link to={'https://beauwise.tech'} />
						<Logo
							className={`aspect-square size-8 shrink-0 hover:cursor-pointer ${open ? 'ml-1.5 mr-1' : ''} transition-all duration-80`}
						/>
						<div
							className={`grid flex-1 text-left pl-1.5 text-sm leading-tight ${open ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
						>
							<span className='truncate text-sidebar-foreground'>BeauWise</span>
							<span className={`truncate text-xs font-extralight`}>Managment System</span>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
