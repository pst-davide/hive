import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function RequireMatch(arr: (string | null)[], required: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const id: string = control.value;
    if (required && !id) {
      return { required: true, requiredValue: id };
    }
    if (id && arr && !arr.find(x => x === id)) {
      return { requireMatch: true, requiredValue: id };
    }
    return null;
  };
}
