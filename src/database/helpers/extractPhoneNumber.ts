export function extractPhoneNumber(text: string) {
    const match = text?.match(/(?:whatsapp:+)?(\+?\d{10,15})/);
    return match ? match[1].replace(/^\+/, '') : '';
}
  