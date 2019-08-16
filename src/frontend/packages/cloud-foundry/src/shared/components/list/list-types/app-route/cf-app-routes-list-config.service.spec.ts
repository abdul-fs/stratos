import { DatePipe } from '@angular/common';
import { inject, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';

import { CoreModule } from '../../../../../../../core/src/core/core.module';
import { CurrentUserPermissionsService } from '../../../../../../../core/src/core/current-user-permissions.service';
import { ConfirmationDialogService } from '../../../../../../../core/src/shared/components/confirmation-dialog.service';
import { SharedModule } from '../../../../../../../core/src/shared/shared.module';
import { ApplicationServiceMock } from '../../../../../../../core/test-framework/application-service-helper';
import { getInitialTestStoreState } from '../../../../../../../core/test-framework/store-test-helper';
import { appReducers } from '../../../../../../../store/src/reducers.module';
import { CFAppState } from '../../../../../cf-app-state';
import { ApplicationService } from '../../../../../features/applications/application.service';
import { CfAppRoutesListConfigService } from './cf-app-routes-list-config.service';



describe('CfAppRoutesListConfigService', () => {

  const initialState = { ...getInitialTestStoreState() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ApplicationService, useClass: ApplicationServiceMock },
        {
          provide: CfAppRoutesListConfigService,
          useFactory: (
            store: Store<CFAppState>,
            appService: ApplicationService,
            confirmDialog: ConfirmationDialogService,
            datePipe: DatePipe,
            cups: CurrentUserPermissionsService) => {
            return new CfAppRoutesListConfigService(store, appService, confirmDialog, datePipe, cups);
          },
          deps: [Store, ApplicationService, ConfirmationDialogService, DatePipe, CurrentUserPermissionsService]
        },
        DatePipe
      ],
      imports: [
        SharedModule,
        CoreModule,
        StoreModule.forRoot(
          appReducers,
          {
            initialState
          }
        ),
        NoopAnimationsModule,
      ]
    });
  });

  it('should be created', inject([CfAppRoutesListConfigService], (service: CfAppRoutesListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
