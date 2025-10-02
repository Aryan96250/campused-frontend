import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appContactNumberOnly]',
  standalone:false
})
export class ContactNumberOnlyDirective {
  private maxLength = 10;

  /** Block non-digits and prevent going past 10 chars */
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const current = input.value || '';
    const next = current + event.key;
    // allow only a single digit key, and max up to 10
    if (!/^[0-9]$/.test(event.key) || next.length > this.maxLength) {
      event.preventDefault();
    }
  }

  /** Sanitize pasted text down to digits only, capped at 10 */
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text/plain') || '';
    const digits = pasted.replace(/\D+/g, '').substring(0, this.maxLength);
    const input = event.target as HTMLInputElement;
    input.value = digits;
    input.dispatchEvent(new Event('input'));
  }
}
