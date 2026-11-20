import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import OpenAI from "openai";
import { v2 as cloudinary } from 'cloudinary';
import FormData from 'form-data';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// High-performance Gemini generator optimized for active models
const PRIMARY_MODEL = "gemini-3.5-flash";

const generateGeminiContent = async (prompt, maxTokens = 2000) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in server/.env");
  }

  // Active models verified with user's Google AI Studio project
  const activeModels = [
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  let lastError = null;

  for (const model of activeModels) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          timeout: 15000
        }
      );
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      lastError = err.response?.data?.error?.message || err.message;
      console.log(`[Gemini API] ${model} attempt failed:`, lastError);
    }
  }

  // Fallback to OpenAI SDK with active 3.5 model
  try {
    const AI = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      defaultHeaders: {
        'x-goog-api-key': apiKey
      }
    });

    const response = await AI.chat.completions.create({
      model: PRIMARY_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens
    });

    if (response?.choices?.[0]?.message?.content) {
      return response.choices[0].message.content;
    }
  } catch (err) {
    console.log("[Gemini OpenAI SDK error]:", err.message);
  }

  throw new Error(lastError || "Failed to generate content from Gemini API");
};

export const generateArticle = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 100) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const content = await generateGeminiContent(prompt, length || 2000);

    // Send response immediately to eliminate UI wait time
    res.json({ success: true, content });

    // Save to database asynchronously in the background
    sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`
      .catch(err => console.log("DB Insert error:", err.message));

    // Update Clerk metadata asynchronously in the background
    if (plan !== 'premium') {
      clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      }).catch(err => console.log("Clerk metadata error:", err.message));
    }
  } catch (error) {
    console.log("generateArticle error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 100) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const content = await generateGeminiContent(prompt, 150);

    // Send response immediately to eliminate UI wait time
    res.json({ success: true, content });

    // Save to database asynchronously in the background
    sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`
      .catch(err => console.log("DB Insert error:", err.message));

    // Update Clerk metadata asynchronously in the background
    if (plan !== 'premium') {
      clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      }).catch(err => console.log("Clerk metadata error:", err.message));
    }
  } catch (error) {
    console.log("generateBlogTitle error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage > 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }
    const formData = new FormData();
    formData.append('prompt', prompt);
    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    if (plan !== 'premium') {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1
          }
        });
      } catch (err) {
        console.log("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("generateImage error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    if (plan !== 'premium') {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1
          }
        });
      } catch (err) {
        console.log("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("removeImageBackground error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: 'image'
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    if (plan !== 'premium') {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            free_usage: free_usage + 1
          }
        });
      } catch (err) {
        console.log("Could not update metadata:", err.message);
      }
    }

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log("removeImageObject error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const userId = req.userId || req.auth?.()?.userId;
    const resume = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." });
    }
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses and areas for improvements. Resume Content:\n\n ${pdfData.text}`;

    const content = await generateGeminiContent(prompt, 1000);

    // Send response immediately
    res.json({ success: true, content });

    // Background operations
    sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`
      .catch(err => console.log("DB Insert error:", err.message));

    if (plan !== 'premium') {
      clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      }).catch(err => console.log("Clerk metadata error:", err.message));
    }
  } catch (error) {
    console.log("resumeReview error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
