export function formatMessage(prefix, items) {
  let result = `======${prefix}======`;
  for (const item of items) {
    result += `\n\n`;
    for (const [key, value] of Object.entries(item)) {
      result += `${key}: ${value}\n`;
    }
  }
  return result.trim();
}
