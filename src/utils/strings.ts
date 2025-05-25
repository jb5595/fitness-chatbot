export const containsWhiteSpace = (text: string) => /\s/.test(text);
export const containsUpperCaseLetter = (text: string) => /[A-Z]/.test(text);
export const containsLowerCaseLetter = (text: string) => /[a-z]/.test(text);
export const containsNumeric = (text: string) => /\d/.test(text);
export const containsSpecialCharacter = (text: string) =>
    /[!@#$%^&*]/.test(text);