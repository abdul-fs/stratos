import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

import { environment } from '../../../../../../environments/environment';
import { CurrentUserPermissionsChecker } from '../../../../../core/current-user-permissions.checker';
import { CurrentUserPermissions } from '../../../../../core/current-user-permissions.config';
import { CurrentUserPermissionsService } from '../../../../../core/current-user-permissions.service';
import { IHeaderBreadcrumb } from '../../../../../shared/components/page-header/page-header.types';
import { ISubHeaderTabs } from '../../../../../shared/components/page-subheader/page-subheader.types';
import { CfUserService } from '../../../../../shared/data-services/cf-user.service';
import { entityFactory, EntitySchema, organizationSchemaKey } from '../../../../../store/helpers/entity-factory';
import { canUpdateOrgSpaceRoles, getActiveRouteCfOrgSpaceProvider } from '../../../cf.helpers';
import { CloudFoundryEndpointService } from '../../../services/cloud-foundry-endpoint.service';
import { CloudFoundryOrganizationService } from '../../../services/cloud-foundry-organization.service';
import {
  getTabsFromExtensions,
  StratosTabType,
  StratosActionMetadata,
  getActionsFromExtensions,
  StratosActionType
} from '../../../../../core/extension/extension-service';
import { getFavoriteFromCfEntity } from '../../../../../core/user-favorite-helpers';
import { UserFavorite } from '../../../../../store/types/user-favorites.types';

@Component({
  selector: 'app-cloud-foundry-organization-base',
  templateUrl: './cloud-foundry-organization-base.component.html',
  styleUrls: ['./cloud-foundry-organization-base.component.scss'],
  providers: [
    getActiveRouteCfOrgSpaceProvider,
    CfUserService,
    CloudFoundryEndpointService,
    CloudFoundryOrganizationService
  ]
})
export class CloudFoundryOrganizationBaseComponent {

  tabLinks: ISubHeaderTabs[] = [
    {
      link: 'summary',
      label: 'Summary'
    },
    {
      link: 'spaces',
      label: 'Spaces'
    },
    {
      link: 'users',
      label: 'Users',
    }
  ];

  public breadcrumbs$: Observable<IHeaderBreadcrumb[]>;

  public name$: Observable<string>;

  // Used to hide tab that is not yet implemented when in production
  public isDevEnvironment = !environment.production;

  public permsOrgEdit = CurrentUserPermissions.ORGANIZATION_EDIT;
  public permsSpaceCreate = CurrentUserPermissions.SPACE_CREATE;
  public canUpdateRoles$: Observable<boolean>;
  public schema: EntitySchema;

  public extensionActions: StratosActionMetadata[] = getActionsFromExtensions(StratosActionType.CloudFoundryOrg);

  public favorite: UserFavorite;

  constructor(
    public cfEndpointService: CloudFoundryEndpointService,
    public cfOrgService: CloudFoundryOrganizationService,
    private currentUserPermissionsService: CurrentUserPermissionsService
  ) {
    this.schema = entityFactory(organizationSchemaKey);

    this.name$ = cfOrgService.org$.pipe(
      tap(org => this.favorite = getFavoriteFromCfEntity(org.entity, organizationSchemaKey)),
      map(org => org.entity.entity.name),
      filter(name => !!name),
      first()
    );
    this.breadcrumbs$ = this.getBreadcrumbs();

    this.canUpdateRoles$ = this.getUpdatePermissionsObservable();

    // Add any tabs from extensions
    this.tabLinks = this.tabLinks.concat(getTabsFromExtensions(StratosTabType.CloudFoundryOrg));
  }

  private getUpdatePermissionsObservable() {
    return canUpdateOrgSpaceRoles(
      this.currentUserPermissionsService,
      this.cfOrgService.cfGuid,
      this.cfOrgService.orgGuid,
      CurrentUserPermissionsChecker.ALL_SPACES);
  }

  private getBreadcrumbs() {
    return this.cfEndpointService.endpoint$.pipe(
      map(endpoint => ([
        {
          breadcrumbs: [
            {
              value: endpoint.entity.name,
              routerLink: `/cloud-foundry/${endpoint.entity.guid}/organizations`
            }
          ]
        }
      ])),
      first()
    );
  }
}
