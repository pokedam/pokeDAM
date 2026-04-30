import { Component, Input, ContentChild, Directive, TemplateRef, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';

export type AsyncButtonState = 'init' | 'done' | 'loading';
export type ButtonType = 'button' | 'submit' | 'reset';

// export class AsyncButtonController {
//   _component: AsyncButton | null = null;

//   callback: (() => Observable<boolean>) | null = null;

//   _disabled = false;
//   _state: AsyncButtonState = 'init';

//   get state(): AsyncButtonState {
//     return this._state;
//   }

//   set state(value: AsyncButtonState) {
//     this._state = value;
//     this._component?._cdr.markForCheck();
//   }

//   set disabled(value: boolean) {
//     if (this._disabled === value) return;

//     this._disabled = value;
//     this._component?._cdr.markForCheck();
//   }

//   get disabled(): boolean {
//     return this._state == 'loading' || !this.callback || this._disabled;
//   }

//   async click(): Promise<void> {
//     if (this.disabled) {
//       return;
//     }

//     this._state = 'loading';
//     this._component?._cdr.markForCheck();

//     try {
//       this._state = (await firstValueFrom(this.callback!())) ? 'done' : 'init';
//       this._component?._cdr.markForCheck();
//     } catch (e) {
//       this._state = 'init';
//       this._component?._cdr.markForCheck();
//       throw e;
//     }
//   }
// }

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

  // ngOnInit(): void {
  //   if (!this.controller) this.controller = new AsyncButtonController();

  //   if (this.controller._component) {
  //     throw new Error('AsyncButtonController is already assigned to another AsyncButton');
  //   }

  //   this.controller._component = this;
  // }

  // ngOnDestroy(): void {
  //   if (!this.controller) throw new Error('AsyncButtonController is not assigned to the disposing AsyncButton');

  //   if (this.controller._component !== this) throw new Error('AsyncButtonController is assigned to another AsyncButton');

  //   this.controller._component = null;
  // }

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
    //this._component?._cdr.markForCheck();

    try {
      this.state = (await firstValueFrom(this.callback!())) ? 'done' : 'init';
      //this._state = (await firstValueFrom(this.callback!())) ? 'done' : 'init';
      //this._component?._cdr.markForCheck();
    } catch (e) {
      //this._state = 'init';
      this.state = 'init';
      //this._component?._cdr.markForCheck();
      throw e;
    }
  }
}