import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAIReply = async ({
  userMessage,
  systemPrompt,
  chatHistory = [],
  sessionMode = 'normal',
  collectedData = {},
  lastBooking = null,
}) => {

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(systemPrompt, sessionMode, collectedData, lastBooking),
  });

  const formattedHistory = chatHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({ history: formattedHistory });

  const result = await chatSession.sendMessage(userMessage);
  return result.response.text();
};

const buildSystemPrompt = (basePrompt, mode, collectedData, lastBooking) => {
  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let prompt = `${basePrompt}

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

  if (mode === 'booking') {
    prompt += `

BOOKING MODE: You are currently collecting booking information step by step.
Already collected: ${JSON.stringify(collectedData)}

BOOKING RULES:
1. If user asks any question unrelated to booking — answer it briefly FIRST, then gently continue booking.
   Example: User asks "kya aap Sunday open hain?" during booking → Answer the question, then say "Ab appointment ke liye..."
2. Collect information in this order: name → date → time → phone (optional)
3. Extract name carefully — only the actual name, not the full sentence
4. When all required info collected (name, date, time), respond with EXACTLY this format:

BOOKING_COMPLETE
\`\`\`json
{
  "name": "extracted name only",
  "date": "date mentioned",
  "time": "time mentioned", 
  "phone": "phone if given or null"
}
\`\`\`
Then add a confirmation message for the user.

5. If user says cancel/band karo/nahi chahiye → respond with exactly: BOOKING_CANCELLED
6. Never make up or assume data — always ask if not provided
`;
  }

  if (mode === 'rescheduling' && lastBooking) {
    prompt += `

RESCHEDULING MODE: User wants to change their existing booking.
Current booking: Name: ${lastBooking.customer_name}, Date: ${lastBooking.booking_date}, Time: ${lastBooking.booking_time}

STRICT RULE: When user gives new date and time, you MUST respond with EXACTLY this format — no exceptions:

Ask for new date and time. When collected, respond with EXACTLY:
RESCHEDULE_COMPLETE
\`\`\`json
{
  "name": "${lastBooking.customer_name}",
  "date": "new date",
  "time": "new time"
}
\`\`\`

Then add your confirmation message AFTER the json block.
Do NOT skip RESCHEDULE_COMPLETE word. Do NOT change the format.
`;
  }

  return prompt;
};

export default getAIReply;