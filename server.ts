import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Real Gemini API endpoint for simulating payment failure recovery
  app.post("/api/recover/simulate", async (req, res) => {
    try {
      const { amount, failureReason, customerName, paymentMethod, customerTier } = req.body;

      if (!amount || !failureReason) {
        return res.status(400).json({ error: "Missing required fields: amount and failureReason" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "AI analysis temporarily unavailable",
          message: "GEMINI_API_KEY is not configured in server environment."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const formattedAmount = Number(amount).toLocaleString("en-IN");
      const prompt = `You are RecoverAI, an autonomous agent built for Indian merchants using Razorpay to recover failed e-commerce and subscription payments.

Analyze this failed transaction and determine the best recovery action:
- Customer Name: ${customerName || "Customer"}
- Payment Amount: ₹${formattedAmount}
- Failure Reason: "${failureReason}" (e.g. "insufficient_funds", "card_expired", "bank_server_timeout", "risk_declined", "otp_timeout", "network_error")
- Payment Method: ${paymentMethod || "UPI / Card"}
- Customer Tier: ${customerTier || "Regular"}

You must return:
1. "reasoning": A short reasoning explanation (2-3 sentences) for why this specific recovery action was chosen based on the gateway failure reason and amount.
2. "recommendedAction": The recommended action. Must choose one of: "Smart Retry", "Payment Link", "Incentivized Retry", or "Escalation" (you can add brief details such as delivery channel or delay time, e.g. "Payment Link via WhatsApp", "Smart Retry (15m delay)", "Incentivized Retry (5% off coupon)", "Escalation to VIP Ops").
3. "customerMessage": A draft customer-facing recovery message (SMS/WhatsApp style, short, in a friendly tone). Include a dynamic checkout link placeholder like https://rzp.io/i/rec_xxxx.
4. "confidenceScore": Confidence score as an integer from 70 to 99 representing the model's confidence in this recovery strategy.`;

      const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
      let responseText: string | undefined;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                "You are the autonomous decision engine of RecoverAI, a fintech payment recovery dashboard for Razorpay merchants. Output valid structured JSON according to the schema.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reasoning: {
                    type: Type.STRING,
                    description:
                      "A short reasoning explanation (2-3 sentences) for why it chose a specific recovery action.",
                  },
                  recommendedAction: {
                    type: Type.STRING,
                    description:
                      "The recommended action (Smart Retry / Payment Link / Incentivized Retry / Escalation).",
                  },
                  customerMessage: {
                    type: Type.STRING,
                    description:
                      "A draft customer-facing recovery message (SMS/WhatsApp style, short, in a friendly tone).",
                  },
                  confidenceScore: {
                    type: Type.INTEGER,
                    description: "A confidence score out of 100.",
                  },
                },
                required: ["reasoning", "recommendedAction", "customerMessage", "confidenceScore"],
              },
            },
          });

          if (response.text?.trim()) {
            responseText = response.text.trim();
            break;
          }
        } catch (callError: any) {
          console.warn(`Model ${modelName} failed or busy, trying next:`, callError.message);
        }
      }

      if (!responseText) {
        throw new Error("Unable to obtain response from Gemini models");
      }

      const parsed = JSON.parse(responseText);

      return res.json({
        reasoning: parsed.reasoning,
        recommendedAction: parsed.recommendedAction,
        customerMessage: parsed.customerMessage,
        confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 88,
      });
    } catch (err: any) {
      console.error("Gemini recovery simulation error:", err);
      return res.status(500).json({
        error: "AI analysis temporarily unavailable",
        message: err.message || "An unexpected error occurred while communicating with Gemini API.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RecoverAI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
