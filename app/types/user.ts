export type UserStatus = 'ACTIVE' | 'DISABLED' | 'PENDING_DELETION';

type Roles = 'admin' | 'superadmin' | 'basic';

// const permissions = [
// 	'read:documents',
// 	'create:documents',
// 	'delete:documents',
// 	'update:documents'
// ] as const;

type AccountAccess = {
	role: Roles;
	permissions: string[];
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
	user_name?: string;
	status: UserStatus;
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
	user: User;
	status: string;
}

export interface DisableUserPayload {
	user: User;
	status: string;
}

export interface DeleteUserPayload {
	user: User;
}

export interface AddUserPayload {
	email: string;
	role: string;
	password: string;
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
