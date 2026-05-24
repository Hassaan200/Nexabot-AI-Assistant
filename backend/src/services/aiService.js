import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ← ADDITION 1: sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Plan ke hisaab se model select karo
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
    businessName = '', // ← ADDITION 2: businessName parameter
    clientPlan = 'trial', // ← plan pass hoga
    retries = 3,       // ← ADDITION 3: retry counter
}) => {
  // ← ADDITION 4: try/catch wrap kiya — andar sab same hai
  try {
    const selectedModel = getModelForPlan(clientPlan);

    const model = genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: buildSystemPrompt(systemPrompt, sessionMode, collectedData, lastBooking, businessName),
    });

    const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({ history: formattedHistory });
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();

  } catch (error) {
    // ← ADDITION 5: retry logic
    if (error.status === 429 && retries > 0) {
      console.log(`Rate limit — retrying... (${retries} left)`);
      await sleep(4000);
      return getAIReply({
        userMessage, systemPrompt, chatHistory,
        sessionMode, collectedData, lastBooking,
        businessName, retries: retries - 1,
      });
    }
    console.error('AI Error:', error.message);
    return "I'm sorry, I'm experiencing high demand right now. Please try again in a moment. 🙏";
  }
};

// ← businessName parameter add kiya — baaki sab SAME hai
const buildSystemPrompt = (basePrompt, mode, collectedData, lastBooking, businessName) => {
    const today = new Date().toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // ← ADDITION 6: Identity rules sabse upar — basePrompt safe hai
    let prompt = `CRITICAL IDENTITY RULES — NEVER BREAK THESE:
- You are the AI Assistant for ${businessName}
- NEVER say "Main Google dwara train kiya gaya"
- NEVER mention Gemini, Google, Bard, or any AI company
- If asked "who are you" → say "Main ${businessName} ka AI assistant hun"
- If asked "which AI" → say "Main ek custom AI assistant hun"

${basePrompt}

TODAY: ${today}

LANGUAGE RULE: Detect the language of the user's message and always reply in the SAME language. If user writes in English, reply in English. If in Urdu/Roman Urdu, reply in that same style.

CRITICAL NAME EXTRACTION RULE: When user provides their name, extract ONLY the actual name. 
Examples:
- "my name is Hassan" → name is "Hassan"
- "mera naam Hassan hai" → name is "Hassan"  
- "Hassan" → name is "Hassan"
- "name: Hassan Khan" → name is "Hassan Khan"
Always extract just the name, never store the full sentence.
`;

    // ← Tera original booking mode — BILKUL SAME
    if (mode === 'booking') {
        prompt += `

BOOKING MODE: You are currently collecting booking information step by step.
Already collected: ${JSON.stringify(collectedData)}

BOOKING RULES:
1. If user asks any question unrelated to booking — answer it briefly FIRST, then gently continue booking.
2. Collect information in this order: name → date → time → phone (optional)
3. Extract name carefully — only the actual name, not the full sentence
4. When all required info collected (name, date, time), respond with EXACTLY this format:

BOOKING_COMPLETE
\`\`\`json
{
  "name": "extracted name only",
  "date": "date mentioned",
  "time": "time mentioned", 
  "phone": "phone if given or null",
  "notes": "order details / address / any extra info"
}
\`\`\`
Then add a confirmation message for the user.

5. If user says cancel/band karo/nahi chahiye → respond with exactly: BOOKING_CANCELLED
6. Never make up or assume data — always ask if not provided

Business type context:
- Clinic/Hospital: collect name, date, time, phone
- Restaurant: collect name, order details, delivery address, phone
- Salon: collect name, service, date, time, phone
- General: collect name, requirement, date/time, phone
`;
    }

    // ← Tera original rescheduling mode — BILKUL SAME
    if (mode === 'rescheduling' && lastBooking) {
        prompt += `

RESCHEDULING MODE: User wants to change their existing booking.
Current booking: Name: ${lastBooking.customer_name}, Date: ${lastBooking.booking_date}, Time: ${lastBooking.booking_time}

STRICT RULE: When user gives new date and time, you MUST respond with EXACTLY this format — no exceptions:

RESCHEDULE_COMPLETE
\`\`\`json
{
  "name": "${lastBooking.customer_name}",
  "date": "new date here",
  "time": "new time here"
}
\`\`\`

Then add your confirmation message AFTER the json block.
Do NOT skip RESCHEDULE_COMPLETE word. Do NOT change the format.
`;
    }

    return prompt;
};

export default getAIReply;