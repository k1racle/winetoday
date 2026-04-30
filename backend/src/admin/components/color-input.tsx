import * as React from 'react';
import { Field, Flex, TextInput } from '@strapi/design-system';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseColor(value?: string | null) {
  if (!value) {
    return { hex: '#ffffff', alpha: 100 };
  }

  const normalized = value.trim();

  const hexMatch = normalized.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    return { hex: `#${hexMatch[1]}`, alpha: 100 };
  }

  const rgbaMatch = normalized.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|0?\.\d+|1)\s*\)$/i);
  if (rgbaMatch) {
    const red = clamp(Number.parseInt(rgbaMatch[1], 10), 0, 255);
    const green = clamp(Number.parseInt(rgbaMatch[2], 10), 0, 255);
    const blue = clamp(Number.parseInt(rgbaMatch[3], 10), 0, 255);
    const alpha = clamp(Math.round(Number.parseFloat(rgbaMatch[4]) * 100), 0, 100);
    const hex = `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    return { hex, alpha };
  }

  return { hex: '#ffffff', alpha: 100 };
}

function formatColor(hex: string, alpha: number) {
  if (alpha >= 100) {
    return hex;
  }

  const normalizedAlpha = clamp(alpha, 0, 100) / 100;
  const expandedHex = hex.replace('#', '');
  const red = Number.parseInt(expandedHex.slice(0, 2), 16);
  const green = Number.parseInt(expandedHex.slice(2, 4), 16);
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')})`;
}

function isRussianAdminLocale() {
  if (typeof document !== 'undefined') {
    const documentLang = document.documentElement.lang?.toLowerCase();

    if (documentLang) {
      return documentLang.startsWith('ru');
    }
  }

  if (typeof navigator !== 'undefined') {
    return navigator.language.toLowerCase().startsWith('ru');
  }

  return false;
}

function prettifyFieldName(name: string) {
  const fieldName = name.split('.').pop() ?? name;
  const ru = isRussianAdminLocale();

  switch (fieldName) {
    case 'backgroundColor':
      return ru ? 'Цвет фона' : 'Background color';
    case 'textColor':
      return ru ? 'Цвет текста' : 'Text color';
    case 'borderColor':
      return ru ? 'Цвет рамки' : 'Border color';
    case 'topBackgroundColor':
      return ru ? 'Фон верхней строки' : 'Top row background';
    case 'middleBackgroundColor':
      return ru ? 'Фон средней строки' : 'Middle row background';
    case 'bottomBackgroundColor':
      return ru ? 'Фон нижней строки' : 'Bottom row background';
    case 'titleColor':
      return ru ? 'Цвет заголовка группы' : 'Group title color';
    case 'activeTextColor':
      return ru ? 'Цвет текста активного элемента' : 'Active item text color';
    case 'activeBackgroundColor':
      return ru ? 'Фон активного элемента' : 'Active item background';
    default:
      return ru ? 'Цвет' : 'Color';
  }
}

type ColorInputProps = {
  attribute: {
    type: string;
  };
  disabled?: boolean;
  error?: string;
  hint?: string | { defaultMessage?: string; id?: string };
  intlLabel?: {
    defaultMessage: string;
    id: string;
  } | null;
  labelAction?: React.ReactNode;
  name: string;
  onChange: (event: { target: { name: string; type: string; value: string } }) => void;
  placeholder?: string;
  required?: boolean;
  value?: string | null;
};

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ attribute, disabled, error, hint, intlLabel, labelAction, name, onChange, placeholder, required, value }, ref) => {
    const parsedColor = parseColor(value);
    const colorValue = parsedColor.hex;
    const label = intlLabel?.defaultMessage ?? prettifyFieldName(name);
    const hintText = typeof hint === 'string' ? hint : hint?.defaultMessage;

    const handleValueChange = (nextValue: string) => {
      onChange({
        target: {
          name,
          type: attribute.type,
          value: nextValue,
        },
      });
    };

    return (
      <Field.Root error={error} hint={hintText} name={name} required={required}>
        <Field.Label action={labelAction}>{label}</Field.Label>
        <Flex alignItems="center" gap={3}>
          <input
            ref={ref}
            type="color"
            disabled={disabled}
            value={/^#([0-9A-Fa-f]{6})$/.test(colorValue) ? colorValue : '#ffffff'}
            onChange={(event) => handleValueChange(formatColor(event.currentTarget.value, parsedColor.alpha))}
            style={{
              width: 56,
              height: 40,
              padding: 0,
              border: '1px solid #dcdce4',
              borderRadius: 4,
              background: 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          <TextInput
            name={name}
            disabled={disabled}
            value={value ?? ''}
            placeholder={placeholder ?? '#10351d'}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleValueChange(event.currentTarget.value)}
          />
          <TextInput
            name={`${name}__alpha`}
            disabled={disabled}
            value={String(parsedColor.alpha)}
            placeholder="100"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const nextAlpha = clamp(Number.parseInt(event.currentTarget.value || '100', 10) || 0, 0, 100);
              handleValueChange(formatColor(parsedColor.hex, nextAlpha));
            }}
          />
        </Flex>
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  },
);

ColorInput.displayName = 'ColorInput';

export default ColorInput;
