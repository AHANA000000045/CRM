import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verify Role requirements if specified on route config
  const requiredRoles = route.data['roles'] as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const user = authService.currentUser();
    const userRole = user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      // If user doesn't have required roles, send to dashboard or fallback
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
