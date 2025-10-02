export function copyTextAreaToClipBoard(message: string) {
    const cleanText = message.replace(/<\/?[^>]+(>|$)/g, '');
    const x = document.createElement('TEXTAREA') as HTMLTextAreaElement;
    x.value = cleanText;
    document.body.appendChild(x);
    x.select();
    document.execCommand('copy');
    document.body.removeChild(x);
  }

// export function getFileExtension(filename:any) {
//   return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
// }

export function markAllDirty(form:any) {
  for (const key in form.controls) {
    if (Object.prototype.hasOwnProperty.call(form.controls, key)) {
      form.controls[key].markAsDirty(); 
    }
  }
}