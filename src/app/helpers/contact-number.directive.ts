import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appContactNumberOnly]',
  standalone:false
})
export class ContactNumberOnlyDirective {
  private maxLength = 10;

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const current = input.value || '';
    const next = current + event.key;
    if (!/^[0-9]$/.test(event.key) || next.length > this.maxLength) {
      event.preventDefault();
    }
  }

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
