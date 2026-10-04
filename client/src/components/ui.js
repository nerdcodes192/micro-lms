// Legacy class strings for not-yet-restyled pages. Prefer <Button> and Field.jsx.
import { buttonClass } from './Button.jsx';
import { inputClass } from './Field.jsx';

export const input = inputClass;
export const button = buttonClass({ variant: 'primary' });
export const buttonLight = buttonClass({ variant: 'secondary', size: 'sm' });
