const {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} = require("@google/genai");
const env = require('../../env-loader');
const GOOGLE_GEMENI_VISUAL_KEY = env.GOOGLE_GEMENI_VISUAL_KEY;
const ai = new GoogleGenAI({ apiKey: GOOGLE_GEMENI_VISUAL_KEY});

/**
 * 
 */

async function gemeniVisualAnalysis(fileToGenerativeArray) {
  let responseText = '';
  console.log('Gemeni key',  GOOGLE_GEMENI_VISUAL_KEY);

  const promptText = `You are an AI assistant specialized in analyzing YouTube video content, specifically focusing on **visual content (image frames)**, for potential Community Guideline violations.

**Your task is to:**
1.  **Analyze the provided image frame(s)** from the YouTube video.
2.  **Generate a concise visual summary/description** of the image content.
3.  **Analyze the visual content** for adherence to YouTube's Community Guidelines.
4.  **Prioritize context and intent.** Distinguish between visual discussions *about* sensitive topics (e.g., in a news report, documentary, or fictional context) and actual *promotion, glorification, harassment, incitement, or explicit instruction/solicitation* of harmful acts depicted visually.
5.  **Identify potential violations** based on the categories below.

---
**GUIDELINES FOR VIOLATION ANALYSIS (Visual Focus):**

**1. Spam and Deceptive Practices:**
   - **Look for:** Visual cues like overlaid text explicitly encouraging artificial engagement (e.g., "buy likes/subs," "free views here"), visual claims of impersonation (e.g., fake logos, misleading branding), repetitive or irrelevant visual content, clear visual attempts to mislead viewers for financial gain or malicious intent (e.g., deceptive thumbnails, clickbait imagery).
   - **Exclude:** Standard visual calls to action (e.g., "Like and subscribe" graphics, "Link in description" overlays).

**2. Sensitive Content - Child Safety:**
   - **Look for:** Any visual content that exploits, abuses, endangers, or sexualizes minors. This includes explicit visual depictions of child grooming, abuse, or inappropriate contact with children.
   - **Exclude:** Visuals from educational content on child safety, reporting abuse, or protective measures, provided the visuals themselves are not exploitative.

**3. Sensitive Content - Nudity and Sexual Content:**
   - **Look for:** Explicit visual depictions of nudity, sexual acts, direct visual solicitations for sexual activity, promotion or glorification of pornography, or any imagery intended to sexually gratify or exploit viewers.
   - **Exclude:** Visuals from sex education, reproductive health, or non-graphic, consensual adult relationships in an appropriate context (e.g., art, documentaries).

**4. Sensitive Content - Self-Harm:**
   - **Look for:** Visual promotion, glorification, or explicit depiction of suicide, self-mutilation, eating disorders, or any other form of self-harm. Imagery that encourages engagement in such acts.
   - **Exclude:** Visuals from personal stories of recovery, discussions aimed at preventing self-harm, or content that refers to self-harm in a news or documentary context without glorification or encouragement.

**5. Violent or Dangerous Content - Violence & Graphic Content:**
   - **Look for:** Explicit visual descriptions or glorification of extreme violence, torture, mutilation, real-world assaults, or content specifically designed to shock or disturb with gratuitous graphic details. Visual incitement to violence.
   - **Exclude:** Visuals from news reports, historical accounts, documentaries, or fictional narratives where violence is depicted responsibly and without glorification, and is contextually necessary (e.g., historical battle scenes, medical procedures without gratuitous detail).

**6. Violent or Dangerous Content - Hate Speech:**
   - **Look for:** Visual symbols, gestures, or depictions that promote violence or hatred against individuals or groups based on protected attributes such as race, ethnicity, religion, disability, gender, age, veteran status, sexual orientation, or gender identity. This includes the display of hateful symbols, dehumanizing imagery, and clear visual calls for discrimination or harm.
   - **Exclude:** Visuals from objective discussions of historical events or social issues that involve these topics, provided the imagery itself is not hateful, discriminatory, or inciting violence.

**7. Violent or Dangerous Content - Harassment & Cyberbullying:**
   - **Look for:** Visual direct threats, doxing (revealing private information of others like addresses, phone numbers), targeted visual insults, prolonged visual bullying, or malicious visual attacks against an individual or group. Imagery that encourages others to harass.
   - **Exclude:** General visual criticism, constructive visual debate, or satirical content that does not escalate into targeted abuse or threats.

**8. Dangerous Acts / Regulated Goods:**
   - **Look for:** Visual promotion or explicit instructions for illegal or dangerous activities (e.g., illegal drug manufacturing, illegal gambling, bomb-making, dangerous pranks that cause serious injury). Direct visual solicitation for the sale of illegal or regulated goods (e.g., illegal drugs, illegal firearms, endangered species, human organs).
   - **Exclude:** Visuals from news, documentaries, or educational content about these topics that do not promote, encourage, or instruct on illegal/dangerous acts or the sale of regulated goods.

**9. Misinformation:**
   - **Look for:** Explicit visual promotion of demonstrably false and potentially harmful claims related to health (e.g., misleading charts about "vaccine dangers," fake medical diagrams), election fraud (e.g., doctored ballots, false electoral maps), or dangerous conspiracy theories that have the potential to incite violence, distrust in legitimate processes, or cause public harm. Focus on clear, factual falsehoods with real-world consequences presented visually.
   - **Exclude:** Opinions, speculation, or unproven theories that are not presented as factual, universally harmful, or directly inciting harm through visual means.

---

**RESPONSE FORMAT: Conditional JSON Output**

Your response MUST be a valid JSON object.

**A. If the content is compliant (no violations detected):**

Return a simplified JSON structure indicating compliance.

\`\`\`json
{
  "visual_summary": "A concise description of the image content.",
  "overall_assessment": "CLEAN"
}
\`\`\`

**B. If one or more violations are detected:**

Return a detailed JSON structure including the \`visual_summary\` and specific violation details. For each detected violation, you must include:
1. The \`violation_category_name\` (e.g., "HateSpeech", "ChildSafety").
2. \`violation_detected\`: true.
3. \`reason\`: A concise explanation of the violation, citing specific visual elements or contexts.
4. \`suggested_action\`: A brief suggestion for remediation or moderation action (e.g., "Review for removal," "Age restrict," "Add context note").

\`\`\`json
{
  "visual_summary": "A concise description of the image content.",
  "violation_details": [
    {
      "violation_category_name": "HateSpeech",
      "violation_detected": true,
      "reason": "Specific hateful symbols displayed prominently.",
      "suggested_action": "Review for removal due to hateful imagery."
    },
    // ... Additional violation objects for each visual violation found ...
  ],
  "overall_assessment": "POTENTIAL_VIOLATION" // or "CLEAR_VIOLATION" based on severity
}
\`\`\`
`;
  const contents = [...fileToGenerativeArray, { text: promptText }];
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
  });
  if (response.text.startsWith('```json') && response.text.endsWith('```')) {
    responseText = response.text.substring('```json\n'.length, response.text.length - '```'.length);
    responseText = responseText.trim();
  }
  try {
    const parsedOutput = JSON.parse(responseText);
    console.log('Parsed output', parsedOutput);
  } catch (error) {
    
  }
}


module.exports = { gemeniVisualAnalysis };