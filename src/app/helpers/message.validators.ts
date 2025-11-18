import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noOnlySpaces(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  return value.trim().length === 0 ? { onlySpaces: true } : null;
}
