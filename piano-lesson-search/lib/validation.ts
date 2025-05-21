export type ValidationMessage = {
  field: string;
  message: string;
};

export const validationMessages = {
  required: (fieldName: string) => `${fieldName}は必須項目です`,
  email: 'メールアドレスの形式が正しくありません',
  minLength: (fieldName: string, length: number) => `${fieldName}は${length}文字以上で入力してください`,
  maxLength: (fieldName: string, length: number) => `${fieldName}は${length}文字以内で入力してください`,
  pattern: (fieldName: string) => `${fieldName}の形式が正しくありません`,
  phone: '電話番号の形式が正しくありません',
  postcode: '郵便番号の形式が正しくありません',
  passwordMatch: 'パスワードが一致しません',
  passwordStrength: 'パスワードは英数字を含む8文字以上で入力してください',
  url: 'URLの形式が正しくありません',
};

export function validateRequired(value: string, fieldName: string): ValidationMessage | null {
  if (!value || value.trim() === '') {
    return {
      field: fieldName,
      message: validationMessages.required(fieldName),
    };
  }
  return null;
}

export function validateEmail(value: string): ValidationMessage | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return {
      field: 'email',
      message: validationMessages.email,
    };
  }
  return null;
}

export function validateMinLength(value: string, fieldName: string, minLength: number): ValidationMessage | null {
  if (value && value.length < minLength) {
    return {
      field: fieldName,
      message: validationMessages.minLength(fieldName, minLength),
    };
  }
  return null;
}

export function validateMaxLength(value: string, fieldName: string, maxLength: number): ValidationMessage | null {
  if (value && value.length > maxLength) {
    return {
      field: fieldName,
      message: validationMessages.maxLength(fieldName, maxLength),
    };
  }
  return null;
}

export function validatePhone(value: string): ValidationMessage | null {
  const phoneRegex = /^[0-9-+() ]{10,15}$/;
  if (value && !phoneRegex.test(value)) {
    return {
      field: 'phone',
      message: validationMessages.phone,
    };
  }
  return null;
}

export function validateUrl(value: string): ValidationMessage | null {
  try {
    if (value) {
      const urlString = value.startsWith('http') ? value : `https://${value}`;
      new URL(urlString);
    }
    return null;
  } catch (e) {
    return {
      field: 'url',
      message: validationMessages.url,
    };
  }
}
