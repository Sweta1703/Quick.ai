import sql from "../configs/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    if (!userId) {
      return res.json({ success: true, creations: [] });
    }

    const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (error) {
    console.log("getUserCreations error:", error.message);
    if (error.message && error.message.includes('does not exist')) {
      return res.json({ success: true, creations: [] });
    }
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (error) {
    console.log("getPublishedCreations error:", error.message);
    if (error.message && error.message.includes('does not exist')) {
      return res.json({ success: true, creations: [] });
    }
    res.json({ success: false, message: error.message });
  }
};
