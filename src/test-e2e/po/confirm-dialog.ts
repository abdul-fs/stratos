import { Component } from './component.po';

import { by, element, promise } from 'protractor';

export class DialogButton {
  index: number;
  label: string;
  class: string;
  click: Function;
  isWarning: boolean;
}

/**
 * Page Object for confirmation dialog component
 */
export class ConfirmDialogComponent extends Component {

  // Helper to wait for a dialog to be shown, check button, title then click confirm button and wait for dialog to close
  public static expectDialogAndConfirm(confirmButtonLabel, title = null) {
    const dialog = new ConfirmDialogComponent();
    dialog.waitUntilShown();
    dialog.getButtons().then(btns => {
      const confirmButton = btns[1];
      expect(confirmButton.label).toBe(confirmButtonLabel);
    });
    if (title) {
      expect(dialog.getTitle()).toBe(title);
    }

    dialog.confirm();
    // Wait until not shown
    dialog.waitUntilNotShown();
  }

  constructor(locator = element(by.css('app-dialog-confirm'))) {
    super(locator);
  }

  // Cancel
  cancel(): promise.Promise<void> {
    return this.getButtons().then(btns => btns[0].click());
  }

  // Confirm
  confirm(): promise.Promise<void> {
    return this.getButtons().then(btns => btns[1].click());
  }

  getTitle(): promise.Promise<string> {
    return this.locator.element(by.className('confirm-dialog__header-title')).getText();
  }

  getMessage(): promise.Promise<string> {
    return this.locator.element(by.className('confirm-dialog__message')).getText();
  }

  // Get metadata for all of the fields in the form
  getButtons(): promise.Promise<DialogButton[]> {
    return this.locator.all(by.tagName('button')).map((elm, index) => {
      return {
        index: index,
        label: elm.getText(),
        class: elm.getAttribute('class'),
        isWarning: elm.getAttribute('class').then(v => v.indexOf('mat-warn') >= 0),
        click: elm.click
      };
    });
  }

}
