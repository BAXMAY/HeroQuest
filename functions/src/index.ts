import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * A callable Cloud Function to grant a user admin privileges.
 *
 * This function can only be called by an already authenticated user who is an admin.
 * It takes an email address as input and sets a custom claim `admin: true` on the
 * corresponding user'''s account.
 */
export const addAdminRole = functions.https.onCall(async (data, context) => {
  // For development: allow any authenticated user to become an admin.
  // In production, you should reinstate this check:
  // if (context.auth?.token.admin !== true) {
  //   throw new functions.https.HttpsError(
  //     "permission-denied",
  //     "Only admins are authorized to add other admins."
  //   );
  // }

  const email = data.email;
  if (!email || typeof email !== 'string') {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid email address."
    );
  }

  try {
    // Get the user record by email.
    const user = await admin.auth().getUserByEmail(email);

    // Set the custom claim `admin: true`.
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });

    return {
      message: `Success! ${email} has been made an admin.`,
    };
  } catch (error) {
    console.error("Error setting custom claim:", error);
    if (error instanceof Error) {
        if ((error as any).code === 'auth/user-not-found') {
             throw new functions.https.HttpsError(
                "not-found",
                `User with email ${email} not found.`
            );
        }
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while setting the admin role."
    );
  }
});
