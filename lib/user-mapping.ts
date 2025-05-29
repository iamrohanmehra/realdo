// Map emails to user IDs (we'll populate this as users sign in)
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
