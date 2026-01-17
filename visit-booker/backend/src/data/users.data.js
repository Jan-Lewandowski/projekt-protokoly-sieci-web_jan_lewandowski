export const users = [];

let nextUserId = 1;

export function generateUserId() {
  return nextUserId++;
}
