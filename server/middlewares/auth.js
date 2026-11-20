import { clerkClient, verifyToken } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    let userId = null;
    let authData = null;

    // 1. Try reading from clerkMiddleware
    if (typeof req.auth === 'function') {
      authData = req.auth();
      userId = authData?.userId;
    }

    // 2. If userId is not found, try direct JWT token verification from Authorization header
    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token !== 'null' && token !== 'undefined') {
          try {
            const verified = await verifyToken(token, {
              secretKey: process.env.CLERK_SECRET_KEY,
            });
            userId = verified.sub;
            console.log("[Auth] Token verified via verifyToken. User ID:", userId);
          } catch (err) {
            console.log("[Auth] verifyToken error:", err.message);
          }
        } else {
          console.log("[Auth] Bearer token is empty or null.");
        }
      } else {
        console.log("[Auth] No Authorization Bearer header provided.");
      }
    }

    if (!userId) {
      console.log("[Auth] Authentication failed: No valid userId could be determined.");
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Please sign out and sign back in to refresh your login session."
      });
    }

    // Check plan safely
    let hasPremiumPlan = false;
    try {
      if (typeof authData?.has === 'function') {
        hasPremiumPlan = await authData.has({ plan: 'premium' });
      }
    } catch {
      hasPremiumPlan = false;
    }

    // Fetch user metadata safely
    let user = null;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (err) {
      console.log("[Auth] Error fetching user from Clerk API:", err.message);
    }

    if (user && !hasPremiumPlan && typeof user.privateMetadata?.free_usage === 'number') {
      req.free_usage = user.privateMetadata.free_usage;
    } else if (user && !hasPremiumPlan) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: 0 }
        });
      } catch (err) {
        console.log("[Auth] Could not update user metadata:", err.message);
      }
      req.free_usage = 0;
    } else {
      req.free_usage = 0;
    }

    req.userId = userId;
    req.plan = hasPremiumPlan ? 'premium' : 'free';
    next();
  } catch (error) {
    console.log("[Auth Middleware] Unexpected error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message || "Authentication error"
    });
  }
};
