// Map emails to user names and IDs
const userEmailToIdMap = new Map<string, string>();

export function setUserMapping(email: string, userId: string) {
  userEmailToIdMap.set(email, userId);
}

export function getUserIdByEmail(email: string): string | undefined {
  return userEmailToIdMap.get(email);
}

export function getUserEmailById(userId: string): string | undefined {
  for (const [email, id] of userEmailToIdMap.entries()) {
    if (id === userId) return email;
  }
  return undefined;
}

export const AUTHORIZED_USERS = [
  "rohanmehra224466@gmail.com",
  "ashish.efslon@gmail.com",
];

// User display names mapping
export const USER_DISPLAY_NAMES: Record<string, string> = {
  "rohanmehra224466@gmail.com": "Himanshu",
  "ashish.efslon@gmail.com": "Ashish",
};

export function getUserDisplayName(email: string): string {
  return USER_DISPLAY_NAMES[email] || email;
}

export function getUserEmailByDisplayName(
  displayName: string
): string | undefined {
  for (const [email, name] of Object.entries(USER_DISPLAY_NAMES)) {
    if (name === displayName) return email;
  }
  return undefined;
}
