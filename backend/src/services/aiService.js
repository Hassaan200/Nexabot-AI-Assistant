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
  retries = 3,
}) => {
  try {
    const selectedModel = getModelForPlan(clientPlan);

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: buildSystemPrompt(
        systemPrompt, sessionMode, collectedData, 
        lastBooking, businessName, businessType
      ),
    });

    // History filter — pehla message user ka hona chahiye
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
      console.log(`Rate limit/overload — retrying... (${retries} left)`);
      await sleep(5000);
      return getAIReply({
        userMessage, systemPrompt, chatHistory,
        sessionMode, collectedData, lastBooking,
        businessName, businessType, clientPlan,
        retries: retries - 1,
      });
    }
    console.error('AI Error:', error.message);
    return "I'm sorry, I'm experiencing high demand. Please try again in a moment. 🙏";
  }
};

const buildSystemPrompt = (basePrompt, mode, collectedData, lastBooking, businessName, businessType) => {
  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let prompt = `IDENTITY RULES:
- You are the AI Assistant for ${businessName}
- NEVER mention Gemini, Google, or any AI company
- If asked who you are: "I am ${businessName}'s AI assistant"

${basePrompt || ''}

TODAY: ${today}

LANGUAGE RULE: Always reply in the same language the user uses.

NAME EXTRACTION: Extract ONLY the actual name.
- "my name is Hassan" → "Hassan"
- "mera naam Hassan hai" → "Hassan"

RESPONSE FORMAT — ALWAYS follow this exactly:
[Your natural conversational reply]

---SYSTEM---
INTENT: [BOOKING/RESCHEDULE/CANCEL/NONE]
DATA: {"name": null, "date": null, "time": null, "phone": null, "service": null, "order": null, "address": null, "notes": null}
---END---

INTENT RULES — detect from ANY phrasing:
BOOKING when user wants to: book, schedule, visit, come, order, meet, ana hai, milna hai, appointment chahiye, fix kardo, set kardo, reserve
RESCHEDULE when user wants to: change, move, shift, reschedule, update booking, aage karo, badlo, timing change
CANCEL when user wants to: cancel, remove, nahi ana, band karo, cancel kardo
NONE for: questions, greetings, general info

DATA RULES:
- Extract ANY info user provides in their message
- null for missing fields
- Phone: extract digits only
- Name: extract actual name only, not full sentence
`;

  if (mode === 'booking') {
    const collected = Object.entries(collectedData)
      .filter(([k, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    prompt += `

BOOKING MODE:
Already collected: ${collected || 'nothing yet'}

Business type: ${businessType}
Collect in order based on business:
- Clinic/General: name → date → time → phone
- Restaurant: name → order details → delivery address → phone  
- Salon: name → service → date → time → phone

ONE question at a time.
NEVER save/confirm without phone number.
If user asks unrelated question — answer briefly, then continue.

CANCELLATION:
If user wants to cancel → ask confirmation first:
"Are you sure you want to cancel? Reply 'yes cancel' to confirm."
If confirmed → add BOOKING_CANCELLED after ---END---
`;
  }

  if (mode === 'rescheduling' && lastBooking) {
    prompt += `

RESCHEDULING MODE:
Current: Name: ${lastBooking.customer_name}, Date: ${lastBooking.booking_date}, Time: ${lastBooking.booking_time}

Ask for new date and time.
When collected → add RESCHEDULE_COMPLETE after ---END---
And include new date/time in DATA field.
`;
  }

  return prompt;
};

export default getAIReply;