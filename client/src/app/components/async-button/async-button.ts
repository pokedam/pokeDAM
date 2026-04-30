import { Component, Input, ContentChild, Directive, TemplateRef, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';

export type AsyncButtonState = 'init' | 'done' | 'loading';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-async-button',
  imports: [NgClass],
  templateUrl: './async-button.html',
})
export class AsyncButton {

  //@Input() controller: AsyncButtonController | null = null;
  @Input() disabled: boolean = false;
  @Input() state: AsyncButtonState = 'init';
  @Input() buttonClass: string = '';
  @Input() type: ButtonType = 'button';
  @Input() callback: (() => Observable<boolean>) | null = null;

  _cdr = inject(ChangeDetectorRef);


  get done(): boolean {
    return this.state == 'done';
  }

  get loading(): boolean {
    return this.state == 'loading';
  }

  async click() {
    if (this.disabled) {
      return;
    }

    this.state = 'loading';
    this._cdr.markForCheck();

    try {
      this.state = (await firstValueFrom(this.callback!())) ? 'done' : 'init';
      this._cdr.markForCheck();
    } catch (e) {
      this.state = 'init';
      this._cdr.markForCheck();
      throw e;
    }
  }
}