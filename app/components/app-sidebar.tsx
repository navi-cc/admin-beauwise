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
	SidebarRail
} from '@/components/ui/sidebar';

import AiNetworkIcon from '@/components/icons/ai-network';
import UserMultipleIcon from '@/components/icons/user-multiple';
import ThreeDScaleIcon from '@/components/icons/three-d-scale';
import CollectionsBookmark from '@/components/icons/collections-bookmark';
import Archive from '@/components/icons/archive';
import Books from '@/components/icons/books';
import { auth } from '@/lib/firebase';

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
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader></SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
