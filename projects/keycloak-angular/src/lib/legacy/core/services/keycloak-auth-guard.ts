/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

import { KeycloakService } from './keycloak.service';

/**
 * A simple guard implementation out of the box. This class should be inherited and
 * implemented by the application. The only method that should be implemented is #isAccessAllowed.
 * The reason for this is that the authorization flow is usually not unique, so in this way you will
 * have more freedom to customize your authorization flow.
 *
 * @deprecated Class based guards are deprecated in Keycloak Angular and will be removed in future versions.
 * Use the new `createAuthGuard` function to create a Guard for your application.
 * More info: https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/migration-guides/v19.md
 */
export abstract class KeycloakAuthGuard implements CanActivate {
  /**
   * Indicates if the user is authenticated or not.
   */
  protected authenticated: boolean;
  /**
   * Roles of the logged user. It contains the clientId and realm user roles.
   */
  protected roles: string[];

  constructor(
    protected router: Router,
    protected keycloakAngular: KeycloakService
  ) {}

  /**
   * CanActivate checks if the user is logged in and get the full list of roles (REALM + CLIENT)
   * of the logged user. This values are set to authenticated and roles params.
   *
   * @param route
   * @param state
   */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    try {
      this.authenticated = await this.keycloakAngular.isLoggedIn();
      this.roles = await this.keycloakAngular.getUserRoles(true);

      return await this.isAccessAllowed(route, state);
    } catch (error) {
      throw new Error('An error happened during access validation. Details:' + error);
    }
  }

  /**
   * Create your own customized authorization flow in this method. From here you already known
   * if the user is authenticated (this.authenticated) and the user roles (this.roles).
   *
   * Return a UrlTree if the user should be redirected to another route.
   *
   * @param route
   * @param state
   */
  abstract isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree>;
}
