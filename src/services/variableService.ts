/**
 * Variable Service
 * Handles replacement of {{variable}} placeholders with values from environments.
 */

export const replaceVariables = (text: string, variables: { key: string; value: string; enabled?: boolean }[]): string => {
  if (!text) return text;
  
  let result = text;
  variables.forEach(v => {
    if (v.enabled !== false && v.key && v.key.trim()) {
      // Use regex to replace all occurrences of {{key}}
      // We escape the key for regex in case it has special characters
      const escapedKey = v.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`{{${escapedKey}}}`, 'g');
      result = result.replace(regex, v.value || '');
    }
  });
  
  return result;
};
