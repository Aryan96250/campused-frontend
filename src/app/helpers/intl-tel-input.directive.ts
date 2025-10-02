import {
  Directive,
  ElementRef,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as intlTelInput from 'intl-tel-input';

@Directive({
  selector: '[intlTelInput]',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IntlTelInputDirective),
      multi: true,
    },
  ],
})
export class IntlTelInputDirective
  implements ControlValueAccessor, OnInit, OnDestroy
{
  private iti: any; // fixed typing
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  @Output() phoneValidityChange = new EventEmitter<boolean>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const input = this.el.nativeElement;
    this.iti = intlTelInput(input, {
      separateDialCode: true,
      initialCountry: 'us',
      utilsScript: 'assets/utils.js', // ✅ safe way
    });

    input.addEventListener('countrychange', () => {
      this.onChange(this.getValue());
    });

    input.addEventListener('input', () => {
      this.onChange(this.getValue());
      this.emitValidityState();
    });

    input.addEventListener('blur', () => {
      this.onTouched();
      this.emitValidityState();
    });
  }

  writeValue(value: any): void {
    if (value && this.iti) {
      this.iti.setNumber(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  getValue(): any {
    if (!this.iti) return null;

    const selectedCountryData = this.iti.getSelectedCountryData();
    return {
      number: this.iti.getNumber(),
      isValid: this.iti.isValidNumber(),
      countryCode: selectedCountryData?.iso2 ?? null,
      dialCode: selectedCountryData
        ? `+${selectedCountryData.dialCode}`
        : null, // ✅ only country code
    };
  }

  emitValidityState(): void {
    if (this.iti) {
      this.phoneValidityChange.emit(this.iti.isValidNumber() || false);
    }
  }

  ngOnDestroy() {
    if (this.iti) {
      this.iti.destroy();
    }
  }
}
