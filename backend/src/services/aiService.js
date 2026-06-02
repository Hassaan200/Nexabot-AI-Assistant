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
`;

  if (mode === 'booking') {
    const collected = Object.keys(collectedData)
      .filter(k => collectedData[k])
      .map(k => `${k}: ${collectedData[k]}`)
      .join(', ');

    prompt += `

BOOKING MODE — YOUR ROLE IS CONVERSATION ONLY:
Already collected: ${collected || 'nothing yet'}

YOUR JOB:
1. Ask for missing information naturally — ONE question at a time
2. When user provides info, acknowledge it warmly
3. When you have collected info, include it in your reply as JSON:

\`\`\`json
{
  "name": "extracted name or null",
  "date": "date mentioned or null",
  "time": "time mentioned or null", 
  "phone": "phone if given or null",
  "service": "service if mentioned or null",
  "order": "order details if restaurant or null",
  "address": "address if delivery or null",
  "notes": "any extra info or null"
}
\`\`\`

IMPORTANT: Include JSON block whenever user provides ANY new information.
Our system will handle saving — you just collect and confirm.

4. For cancellation — ask for confirmation first:
   "Are you sure you want to cancel? Reply 'yes cancel' to confirm."
   
5. If user says 'yes cancel' or 'haan cancel karo' → include in reply: BOOKING_CANCELLED

6. Answer any questions briefly, then continue collecting info.
`;
  }

  if (mode === 'rescheduling' && lastBooking) {
    prompt += `

RESCHEDULING MODE:
Current booking: Name: ${lastBooking.customer_name}, Date: ${lastBooking.booking_date}, Time: ${lastBooking.booking_time}

Ask for new date and time. When user provides them, include in reply:

\`\`\`json
{
  "name": "${lastBooking.customer_name}",
  "date": "new date",
  "time": "new time"
}
\`\`\`

Also include: RESCHEDULE_COMPLETE

Then add confirmation message.
`;
  }

  return prompt;
};

export default getAIReply;