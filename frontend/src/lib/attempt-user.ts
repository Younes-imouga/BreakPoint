export type AttemptUserRef =
  | string
  | {
      _id?: string;
      username?: string;
      email?: string;
    };

export function formatAttemptUser(userRef: AttemptUserRef) {
  if (typeof userRef === 'string') {
    return `${userRef.slice(0, 8)}...`;
  }

  if (userRef && typeof userRef.username === 'string' && userRef.username) {
    return userRef.username;
  }

  if (userRef && typeof userRef.email === 'string' && userRef.email) {
    return userRef.email;
  }

  if (userRef && typeof userRef._id === 'string' && userRef._id) {
    return `${userRef._id.slice(0, 8)}...`;
  }

  return 'Unknown user';
}
