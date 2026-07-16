const RU = 'йцукенгшщзхъфывапролджэячсмитьбюЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ';
const EN = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,.QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>';

export function convertKeyboardLayout(input: string, from: 'ru' | 'en' = 'auto'): string {
  if (!input) return '';
  let result = '';
  for (const char of input) {
    const ruIndex = RU.indexOf(char);
    const enIndex = EN.indexOf(char);
    if (from === 'ru' && ruIndex !== -1) {
      result += EN[ruIndex];
    } else if (from === 'en' && enIndex !== -1) {
      result += RU[enIndex];
    } else if (from === 'auto') {
      if (ruIndex !== -1) result += EN[ruIndex];
      else if (enIndex !== -1) result += RU[enIndex];
      else result += char;
    } else {
      result += char;
    }
  }
  return result;
}
