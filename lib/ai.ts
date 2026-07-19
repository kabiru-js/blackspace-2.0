export async function generatePersonalStatement(
  user: {
    full_name: string;
    country: string;
    field_of_study: string;
    goals: string;
  },
  scholarship: {
    title: string;
    country: string;
    provider: string;
  }
): Promise<string> {
  const prompt = `Generate a compelling scholarship personal statement.

User:
- Name: ${user.full_name}
- Country: ${user.country}
- Field: ${user.field_of_study}
- Goals: ${user.goals}

Scholarship:
- Name: ${scholarship.title}
- Country: ${scholarship.country}
- Provider: ${scholarship.provider}

Requirements:
- 300-500 words
- Emotional but professional
- Show ambition and impact
- Tailored to the scholarship
- Start with "Dear Scholarship Committee,"
- End with a formal closing

Generate the personal statement:`;

  return generateWithAI(prompt);
}

export async function generateMotivationLetter(
  user: {
    full_name: string;
    country: string;
    field_of_study: string;
    goals: string;
  },
  scholarship: {
    title: string;
    country: string;
    provider: string;
  }
): Promise<string> {
  const prompt = `Write a strong motivation letter for this scholarship.

Include:
- Why this field of study (${user.field_of_study})
- Why this country (${scholarship.country})
- Career goals: ${user.goals}
- Why this scholarship (${scholarship.title} by ${scholarship.provider})

Tone:
- Confident
- Clear
- Persuasive

Format as a formal letter. Start with "Dear Selection Committee,".
Keep it between 300-500 words.

Generate the motivation letter:`;

  return generateWithAI(prompt);
}

async function generateWithAI(prompt: string): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Primary: DeepSeek
  if (deepseekKey) {
    try {
      return await generateWithDeepSeek(prompt, deepseekKey);
    } catch (error) {
      console.error("DeepSeek failed:", error);
      // Fall through to fallbacks
    }
  }

  // Fallback 1: Gemini
  if (geminiKey) {
    try {
      return await generateWithGemini(prompt, geminiKey);
    } catch (error) {
      console.error("Gemini failed:", error);
    }
  }

  // Fallback 2: OpenAI
  if (openaiKey) {
    try {
      return await generateWithOpenAI(prompt, openaiKey);
    } catch (error) {
      console.error("OpenAI failed:", error);
    }
  }

  // Fallback: return a template if no API keys are configured or all fail
  return getFallbackGeneratedContent(prompt);
}

async function generateWithDeepSeek(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    "https://api.deepseek.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an expert scholarship application writer. Write compelling, personalized essays and letters that are honest, ambitious, and impactful.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2048,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `DeepSeek API error (${response.status}): ${response.statusText}${errorBody ? " — " + errorBody : ""}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert scholarship application writer. Write compelling, personalized essays and letters.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function getFallbackGeneratedContent(prompt: string): string {
  const nameMatch = prompt.match(/Name: (.+)/);
  const fieldMatch = prompt.match(/Field: (.+)/);
  const scholarshipMatch = prompt.match(/Name: (.+?)(?:\n|$)/g)?.[1];
  const providerMatch = prompt.match(/Provider: (.+)/);
  const goalsMatch = prompt.match(/Goals: (.+)/);

  const name = nameMatch?.[1]?.trim() || "the applicant";
  const field = fieldMatch?.[1]?.trim() || "their field";
  const scholarship = scholarshipMatch?.trim() || "this scholarship";
  const provider = providerMatch?.[1]?.trim() || "the provider";
  const goals = goalsMatch?.[1]?.trim() || "making a positive impact";

  return `Dear Scholarship Committee,

I am writing to express my sincere interest in the ${scholarship} offered by ${provider}. As a dedicated student, I have always been passionate about ${field} and committed to using my education to drive meaningful change.

Throughout my academic journey, I have consistently sought opportunities to expand my knowledge and skills in ${field}. This scholarship represents an incredible opportunity to further my studies and gain exposure to international perspectives that will be invaluable in achieving my career goals.

My ultimate goal is ${goals}. I believe that studying abroad through this scholarship will provide me with the tools, networks, and knowledge necessary to make a significant impact in my community and beyond.

I am deeply committed to excellence and eager to contribute to the academic community at ${provider}. Thank you for considering my application. I look forward to the opportunity to demonstrate my potential and dedication.

Sincerely,
${name}`;
}
