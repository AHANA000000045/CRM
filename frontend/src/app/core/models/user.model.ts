export interface Organization {
  id: string;
  name: string;
  domain: string;
  billingPlan: 'Free' | 'Growth' | 'Enterprise';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Super Admin' | 'Organization Admin' | 'Sales Manager' | 'Sales Executive' | 'Support Executive' | 'Marketing Executive';
  isActive: boolean;
  organizationId?: string | Organization;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: User['role'];
  };
}
