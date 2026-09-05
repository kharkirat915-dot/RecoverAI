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
      const numericAmount = Number(amount);
      const isHighValue = numericAmount > 20000;
      const isRiskDeclined = failureReason === "risk_declined";

      const prompt = `You are Nabbit, an autonomous AI payment failure recovery agent built for Razorpay merchants.

Analyze this failed transaction and generate an autonomous recovery strategy:
- Customer Name: ${customerName || "Customer"}
- Failed Payment Amount: ₹${formattedAmount}
- Gateway Failure Reason: "${failureReason}" (e.g. "insufficient_funds", "card_expired", "bank_server_timeout", "risk_declined", "otp_timeout", "network_error")
- Payment Method: ${paymentMethod || "UPI / Card"}
- Customer Tier: ${customerTier || "Regular"}

CRITICAL RULES YOU MUST ENFORCE:
1. "recommendedAction": Must be exactly one of:
   - "Smart Retry"
   - "Payment Link"
   - "Incentivized Retry"
   - "Escalate for Manual Review"
2. ESCALATION RULE:
   - If failure reason is "risk_declined" OR the amount is unusually high (above ₹20,000), you MUST set "escalate" to true AND "recommendedAction" to "Escalate for Manual Review". Do NOT auto-retry high-risk or high-value cases.
   - For all other standard failures, set "escalate" to false.
3. "whyThisWasSelected":
   - "failurePattern": 1 short sentence (under 20 words) identifying what caused this failure.
   - "recoveryLikelihood": 1 short sentence (under 20 words) estimating probability of recovery with this action.
   - "costBenefit": 1 short sentence (under 20 words) comparing cost/effort of this action vs the revenue at stake.
4. "constraintChecks": Return exactly these 4 constraint objects. Base their "Passed" or "Failed" status on the actual failure reason and amount:
   - "Recovery cost below transaction value": "Passed" or "Failed" (Failed if amount is negligible or recovery cost/discount erodes unit economics).
   - "Customer risk score acceptable": "Passed" or "Failed" (Must be "Failed" if risk_declined or fraud velocity spike).
   - "Retry attempts within policy limit": "Passed" or "Failed" (Failed if hard decline like card_expired where auto-retrying violates card network rules).
   - "Within optimal retry time window": "Passed" or "Failed" (Passed if within safe recovery window; Failed if card expired or window expired).
5. "customerMessage":
   - If escalate is true, set this to empty string "" (since customer message must not be sent for escalated manual reviews).
   - If escalate is false, provide a short friendly SMS/WhatsApp recovery message under 25 words with a placeholder link like https://rzp.io/i/rec_XXXX.
6. "confidenceScore": Integer between 75 and 99.`;

      const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
      let responseText: string | undefined;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                "You are the autonomous decision engine of Nabbit, a fintech payment recovery dashboard for Razorpay merchants. Output valid structured JSON according to the schema. Keep each explanation sentence strictly under 20 words.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendedAction: {
                    type: Type.STRING,
                    description:
                      "Must be exactly: 'Smart Retry', 'Payment Link', 'Incentivized Retry', or 'Escalate for Manual Review'.",
                  },
                  confidenceScore: {
                    type: Type.INTEGER,
                    description: "Confidence score integer from 75 to 99.",
                  },
                  whyThisWasSelected: {
                    type: Type.OBJECT,
                    properties: {
                      failurePattern: {
                        type: Type.STRING,
                        description:
                          "1 short sentence under 20 words identifying what likely caused this failure.",
                      },
                      recoveryLikelihood: {
                        type: Type.STRING,
                        description:
                          "1 short sentence under 20 words estimating likelihood this action recovers payment.",
                      },
                      costBenefit: {
                        type: Type.STRING,
                        description:
                          "1 short sentence under 20 words comparing cost/effort vs revenue at stake.",
                      },
                    },
                    required: ["failurePattern", "recoveryLikelihood", "costBenefit"],
                  },
                  constraintChecks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        constraint: {
                          type: Type.STRING,
                          description: "Name of the constraint being verified.",
                        },
                        status: {
                          type: Type.STRING,
                          description: "'Passed' or 'Failed'",
                        },
                      },
                      required: ["constraint", "status"],
                    },
                    description:
                      "Array of 4 policy constraints with Passed or Failed status.",
                  },
                  customerMessage: {
                    type: Type.STRING,
                    description:
                      "Short friendly SMS/WhatsApp recovery message, or empty if escalated.",
                  },
                  escalate: {
                    type: Type.BOOLEAN,
                    description:
                      "True if failureReason is risk_declined or amount > ₹20,000, else false.",
                  },
                },
                required: [
                  "recommendedAction",
                  "confidenceScore",
                  "whyThisWasSelected",
                  "constraintChecks",
                  "customerMessage",
                  "escalate",
                ],
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

      // Enforce business rules deterministically
      const shouldEscalate = Boolean(parsed.escalate || isRiskDeclined || isHighValue);
      const action = shouldEscalate ? "Escalate for Manual Review" : (parsed.recommendedAction || "Payment Link");

      // Ensure constraint checks have all 4 items
      const expectedConstraints = [
        "Recovery cost below transaction value",
        "Customer risk score acceptable",
        "Retry attempts within policy limit",
        "Within optimal retry time window",
      ];

      const rawChecks = Array.isArray(parsed.constraintChecks) ? parsed.constraintChecks : [];
      const constraintMap: Record<string, "Passed" | "Failed"> = {};
      rawChecks.forEach((c: any) => {
        if (c?.constraint && (c.status === "Passed" || c.status === "Failed")) {
          constraintMap[c.constraint] = c.status;
        }
      });

      const normalizedConstraintChecks = expectedConstraints.map((constraint) => {
        let status: "Passed" | "Failed" = constraintMap[constraint] || "Passed";
        if (constraint === "Customer risk score acceptable" && isRiskDeclined) {
          status = "Failed";
        }
        if (constraint === "Retry attempts within policy limit" && failureReason === "card_expired") {
          status = "Failed";
        }
        if (constraint === "Within optimal retry time window" && failureReason === "card_expired") {
          status = "Failed";
        }
        return { constraint, status };
      });

      return res.json({
        recommendedAction: action,
        confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 91,
        whyThisWasSelected: {
          failurePattern: parsed.whyThisWasSelected?.failurePattern || `Gateway decline occurred due to ${failureReason.replace(/_/g, ' ')}.`,
          recoveryLikelihood: parsed.whyThisWasSelected?.recoveryLikelihood || `Targeted action maximizes recovery probability for this transaction profile.`,
          costBenefit: parsed.whyThisWasSelected?.costBenefit || `Recovery effort is highly positive compared to ₹${formattedAmount} value.`
        },
        constraintChecks: normalizedConstraintChecks,
        customerMessage: shouldEscalate ? "" : (parsed.customerMessage || `Hi ${customerName || 'Customer'}, please complete your payment of ₹${formattedAmount}: https://rzp.io/i/rec_xxxx`),
        escalate: shouldEscalate,
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
    console.log(`Nabbit full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
