import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getModelForPlan = (plan) => {
  const models = {
    trial: 'gemini-2.5-flash',
    starter: 'gemini-2.5-flash',
    business: 'gemini-2.5-pro',
  };
  return models[plan] || 'gemini-2.5-flash';
};

export const getAIReply = async ({
  userMessage,
  systemPrompt,
  chatHistory = [],
  sessionMode = 'normal',
  collectedData = {},
  lastBooking = null,
  businessName = '',
  businessType = 'general',
  clientPlan = 'trial',
  missingFields = [],
  retries = 3,
}) => {
  try {
    const selectedModel = getModelForPlan(clientPlan);
    console.log(`Plan: ${clientPlan} | Model: ${selectedModel}`);

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: buildSystemPrompt(
        systemPrompt, sessionMode, collectedData,
        lastBooking, businessName, businessType, missingFields
      ),
    });

    let filteredHistory = chatHistory;
    if (filteredHistory.length > 0 && filteredHistory[0].role === 'assistant') {
      filteredHistory = filteredHistory.slice(1);
    }

    const formattedHistory = filteredHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({ history: formattedHistory });
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();

  } catch (error) {
    if ((error.status === 429 || error.status === 503) && retries > 0) {
      console.log(`Rate limit — retrying... (${retries} left)`);
      await sleep(5000);
      return getAIReply({
        userMessage, systemPrompt, chatHistory,
        sessionMode, collectedData, lastBooking,
        businessName, businessType, clientPlan,
        missingFields, retries: retries - 1,
      });
    }
    console.error('AI Error:', error.message);
    return "I'm sorry, I'm experiencing high demand. Please try again in a moment. 🙏";
  }
};

const buildSystemPrompt = (
  basePrompt, mode, collectedData, lastBooking,
  businessName, businessType, missingFields
) => {
  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let prompt = `IDENTITY RULES — NEVER BREAK:
- You are the AI Assistant for ${businessName}
- NEVER mention Gemini, Google, or any AI company
- If asked who you are: "I am ${businessName}'s AI assistant"

${basePrompt || ''}

TODAY: ${today}

LANGUAGE RULE: Always reply in the same language the user uses.

NAME EXTRACTION: Extract ONLY the actual name.
- "my name is Hassan" → "Hassan"
- "mera naam Hassan hai" → "Hassan"

CRITICAL RESPONSE FORMAT — ALWAYS include at end of EVERY reply:

---SYSTEM---
INTENT: [BOOKING/RESCHEDULE/CANCEL/NONE]
DATA: {"name": null, "date": null, "time": null, "phone": null, "service": null, "order": null, "address": null, "notes": null}
---END---

INTENT DETECTION — any phrasing:
- BOOKING: book, schedule, appointment, visit, order, milna, ana hai, chahiye, fix, set, reserve, come
- RESCHEDULE: change, move, shift, reschedule, update, aage, badlo, timing change
- CANCEL: cancel, nahi ana, band, remove, cancel kardo, nahi chahiye
- NONE: questions, greetings, general info

DATA RULES:
- Fill ALL fields user has mentioned in current message
- null for missing fields only
- Extract phone digits only
- Extract actual name only
`;

  if (mode === 'booking') {
    const collected = Object.entries(collectedData)
      .filter(([k, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const missing = missingFields.length > 0
      ? missingFields.join(', ')
      : 'none';

    prompt += `

BOOKING MODE — CRITICAL RULES:
Already collected: ${collected || 'nothing yet'}
Still needed: ${missing}

COLLECTION ORDER by business type:
- clinic/general: name → date → time → phone
- restaurant: name → order details → address → phone
- salon: name → service → date → time → phone

STRICT RULES:
1. Ask ONE missing field at a time
2. NEVER confirm booking complete unless our system confirms it
3. NEVER say "booking confirmed" unless you receive BOOKING_SAVED signal
4. If user provides multiple fields at once — extract all of them
5. Answer unrelated questions briefly then continue collecting
6. NEVER assume or make up data

CANCELLATION:
- User wants cancel → ask confirmation: "Are you sure? Reply 'yes cancel' to confirm."
- User confirms → add BOOKING_CANCELLED after ---END---
`;
  }

  if (mode === 'rescheduling' && lastBooking) {
    prompt += `

RESCHEDULING MODE:
Current booking:
- Name: ${lastBooking.customer_name}
- Date: ${lastBooking.booking_date}  
- Time: ${lastBooking.booking_time}

Ask for new date and time.
When user provides both → add RESCHEDULE_COMPLETE after ---END---
NEVER say rescheduled unless you receive RESCHEDULE_SAVED signal.
`;
  }

  if (mode === 'cancelling') {
    prompt += `

CANCELLATION CONFIRMATION MODE:
User has requested to cancel their booking.
Ask them to confirm with yes/no.
Once they confirm → simply say the booking is cancelled.
Do NOT add BOOKING_CANCELLED signal — system handles it automatically.
`;
  }

  return prompt;
};

export default getAIReply;