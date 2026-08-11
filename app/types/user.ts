export type UserStatus = 'active' | 'disabled' | 'pending_deletion';

type Roles = 'admin' | 'client';

const permissions = [
	'read:documents',
	'create:documents',
	'delete:documents',
	'update:documents'
] as const;

type AccountAccess = {
	roles: Roles;
	permisions: (typeof permissions)[number][];
};

export type ProviderId = 'password' | 'google.com';

export interface User {
	id: string;
	email: string;
	account_disable: boolean;
	account_access: AccountAccess;
	createdAt: string;
	providerId: ProviderId;
	metadata: {
		lastSignInTime: string;
		creationTime: string;
	};
    user_status: UserStatus;
}

export interface ChangePasswordPayload {
	userId: string;
	newPassword: string;
}
export interface ChangeEmailPayload {
	userId: string;
	newEmail: string;
}

export interface CancelDeletionPayload {
	userId: string;
	status: string;
}

export interface DisableUserPayload {
	userId: string;
	status: string;
}

export interface DeleteUserPayload {
	userId: string;
}
export interface ChangeRolePayload {
	userId: string;
	newRole: Roles;
}
export interface ForceLogoutPayload {
	userId: string;
}
export interface AuditLogEntry {
	id: string;
	action: string;
	performedBy: string;
	timestamp: string;
	details?: string;
}
