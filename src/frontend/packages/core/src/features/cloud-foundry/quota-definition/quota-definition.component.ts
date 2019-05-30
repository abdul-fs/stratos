import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import { GetQuotaDefinition } from '../../../../../store/src/actions/quota-definitions.actions';
import { AppState } from '../../../../../store/src/app-state';
import { entityFactory, quotaDefinitionSchemaKey } from '../../../../../store/src/helpers/entity-factory';
import { APIResource } from '../../../../../store/src/types/api.types';
import { EndpointModel } from '../../../../../store/src/types/endpoint.types';
import { IOrganization, IQuotaDefinition, ISpace } from '../../../core/cf-api.types';
import { EntityServiceFactory } from '../../../core/entity-service-factory.service';
import { IHeaderBreadcrumb } from '../../../shared/components/page-header/page-header.types';
import { ActiveRouteCfOrgSpace } from '../cf-page.types';
import { getActiveRouteCfOrgSpaceProvider } from '../cf.helpers';
import { QuotaDefinitionBaseComponent } from '../quota-definition-base/quota-definition-base.component';

@Component({
  selector: 'app-quota-definition',
  templateUrl: './quota-definition.component.html',
  styleUrls: ['../quota-definition-base/quota-definition-base.component.scss', './quota-definition.component.scss'],
  providers: [
    getActiveRouteCfOrgSpaceProvider
  ]
})
export class QuotaDefinitionComponent extends QuotaDefinitionBaseComponent {
  breadcrumbs$: Observable<IHeaderBreadcrumb[]>;
  quotaDefinition$: Observable<APIResource<IQuotaDefinition>>;
  org$: Observable<APIResource<IOrganization>>;
  space$: Observable<APIResource<ISpace>>;
  cfGuid: string;
  orgGuid: string;
  spaceGuid: string;
  quotaGuid: string;
  editLink: string[];
  detailsLoading$: Observable<boolean>;
  orgSubscriber: Subscription;

  constructor(
    protected entityServiceFactory: EntityServiceFactory,
    protected store: Store<AppState>,
    activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
    activatedRoute: ActivatedRoute,
  ) {
    super(entityServiceFactory, store, activeRouteCfOrgSpace, activatedRoute);
    this.setupQuotaDefinitionObservable();
    this.editLink = [
      '/cloud-foundry',
      this.cfGuid,
      'quota-definitions',
      this.quotaGuid,
      'edit-quota'
    ];
  }

  setupQuotaDefinitionObservable() {
    const quotaGuid$ = this.quotaGuid ? of(this.quotaGuid) : this.org$.pipe(map(org => org.entity.quota_definition_guid));
    const entityInfo$ = quotaGuid$.pipe(
      first(),
      switchMap(quotaGuid => this.entityServiceFactory.create<APIResource<IQuotaDefinition>>(
        quotaDefinitionSchemaKey,
        entityFactory(quotaDefinitionSchemaKey),
        quotaGuid,
        new GetQuotaDefinition(quotaGuid, this.cfGuid),
      ).entityObs$)
    );

    this.quotaDefinition$ = entityInfo$.pipe(
      filter(definition => !!definition && !!definition.entity),
      map(definition => definition.entity)
    );
    this.detailsLoading$ = entityInfo$.pipe(
      filter(definition => !!definition),
      map(definition => definition.entityRequestInfo.fetching)
    );
  }

  protected getBreadcrumbs(
    endpoint: EndpointModel,
    org: APIResource<IOrganization>,
    space: APIResource<ISpace>
  ) {
    const baseCFUrl = `/cloud-foundry/${this.cfGuid}`;

    const breadcrumbs: IHeaderBreadcrumb[] = [{
      breadcrumbs: [
        { value: endpoint.name, routerLink: `${baseCFUrl}/quota-definitions` },
      ]
    }];

    if (org) {
      const baseOrgUrl = `${baseCFUrl}/organizations/${org.metadata.guid}`;

      breadcrumbs.push({
        key: 'org',
        breadcrumbs: [
          { value: endpoint.name, routerLink: `${baseCFUrl}/organizations` },
          { value: org.entity.name, routerLink: `${baseOrgUrl}/summary` },
        ]
      });

      if (space) {
        const baseSpaceUrl = `${baseCFUrl}/organizations/${org.metadata.guid}/spaces/${space.metadata.guid}`;

        breadcrumbs.push({
          key: 'space',
          breadcrumbs: [
            { value: endpoint.name, routerLink: `${baseCFUrl}/organizations` },
            { value: org.entity.name, routerLink: `${baseOrgUrl}/spaces` },
            { value: space.entity.name, routerLink: `${baseSpaceUrl}/summary` },
          ]
        });
      }
    }

    return breadcrumbs;
  }
}
