const {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} = require("@google/genai");
const env = require('../../env-loader');
const GOOGLE_GEMENI = env.GOOGLE_GEMENI_BLIP_API_KEY;
const ai = new GoogleGenAI({ apiKey: GOOGLE_GEMENI});

/**
 * 
 */

async function geminiSpeechAnalysis() {
  let responseText = '';
  console.log('Gemeni key',  GOOGLE_GEMENI);

  const promptText = `You are an AI assistant specialized in analyzing YouTube video content for potential Community Guideline violations.

**Your task is to:**
1.  **Transcribe the provided audio content** from the YouTube video.
2.  **Analyze the transcribed content** for adherence to YouTube's Community Guidelines.
3.  **Prioritize context and intent.** Distinguish between discussions *about* sensitive topics (e.g., in a news report, documentary, or fictional context) and actual *promotion, glorification, harassment, incitement, or explicit instruction/solicitation* of harmful acts.
4.  **Identify potential violations** based on the categories below.

---
**GUIDELINES FOR VIOLATION ANALYSIS:**

**1. Spam and Deceptive Practices:**
   - **Look for:** Explicit encouragement of artificial engagement (e.g., "buy likes/subs," "click this link for free views"), claims of impersonation (claiming to be another person or entity), repetitive or off-topic content, clear attempts to mislead viewers for financial gain or malicious intent.
   - **Exclude:** Standard calls to action (e.g., "Like and subscribe," "Check the link in the description for more").

**2. Sensitive Content - Child Safety:**
   - **Look for:** Any spoken content that exploits, abuses, engenders, or sexualizes minors. This includes direct mentions of child grooming, abuse, or inappropriate contact with children.
   - **Exclude:** Educational discussions on child safety, reporting abuse, or protective measures.

**3. Sensitive Content - Nudity and Sexual Content:**
   - **Look for:** Explicit spoken descriptions of sexual acts, direct sexual solicitations, promotion or glorification of pornography, or any language intended to sexually gratify or exploit listeners.
   - **Exclude:** Discussions of sex education, reproductive health, or non-graphic, consensual adult relationships in an appropriate context.

**4. Sensitive Content - Self-Harm:**
   - **Look for:** Promotion, glorification, or explicit instructions related to suicide, self-mutilation, eating disorders, or any other form of self-harm. Encouragement to engage in such acts.
   - **Exclude:** Personal stories of recovery, discussions aimed at preventing self-harm, or content that refers to self-harm in a news or documentary context without glorification or encouragement.

**5. Violent or Dangerous Content - Violence & Graphic Content:**
   - **Look for:** Explicit spoken descriptions or glorification of extreme violence, torture, mutilation, real-world assaults, or content specifically designed to shock or disturb with gratuitous graphic details. Incitement to violence.
   - **Exclude:** News reports, historical accounts, documentaries, or fictional narratives where violence is depicted responsibly and without glorification, and is contextually necessary.

**6. Violent or Dangerous Content - Hate Speech:**
   - **Look for:** Speech that promotes violence or hatred against individuals or groups based on protected attributes such as race, ethnicity, religion, disability, gender, age, veteran status, sexual orientation, or gender identity. This includes the use of slurs, dehumanizing language, and clear calls for discrimination or harm.
   - **Exclude:** Objective discussions of historical events or social issues that involve these topics, provided the language itself is not hateful, discriminatory, or inciting violence.

**7. Violent or Dangerous Content - Harassment & Cyberbullying:**
   - **Look for:** Direct threats, doxing (revealing private information of others), targeted insults, prolonged bullying, or malicious attacks against an individual or group. Encouragement of others to harass.
   - **Exclude:** General criticism, constructive debate, or satirical content that does not escalate into targeted abuse or threats.

**8. Dangerous Acts / Regulated Goods:**
   - **Look for:** Promotion or explicit instructions for illegal or dangerous activities (e.g., illegal drug manufacturing, illegal gambling, bomb-making, dangerous pranks that cause serious injury). Direct solicitation for the sale of illegal or regulated goods (e.g., illegal drugs, illegal firearms, endangered species, human organs).
   - **Exclude:** News, documentaries, or educational content about these topics that do not promote, encourage, or instruct on illegal/dangerous acts or the sale of regulated goods.

**9. Misinformation:**
   - **Look for:** Explicit promotion of demonstrably false and potentially harmful claims related to health (e.g., "vaccines are deadly," "unproven cures for diseases"), election fraud, or dangerous conspiracy theories that have the potential to incite violence, distrust in legitimate processes, or cause public harm. Focus on clear, factual falsehoods with real-world consequences.
   - **Exclude:** Opinions, speculation, or unproven theories that are not presented as factual, universally harmful, or directly inciting harm.

---

**RESPONSE FORMAT: Conditional JSON Output**

Your response MUST be a valid JSON object.

**A. If the content is compliant (no violations detected):**

Return a simplified JSON structure indicating compliance.

\`\`\`json
{
  "transcription": "The full transcribed text of the audio.",
  "overall_assessment": "CLEAN" 
}
\`\`\`

**B. If one or more violations are detected:**

Return a detailed JSON structure including the \`transcription\` and specific violation details. For each detected violation, you must include:
1. The \`violation_category_name\` (e.g., "HateSpeech", "ChildSafety").
2. \`violation_detected\`: true.
3. \`reason\`: A concise explanation of the violation, citing specific quotes or contexts.
4. \`suggested_action\`: A brief suggestion for remediation or moderation action (e.g., "Review for removal," "Age restrict," "Add context note").

\`\`\`json
{
  "transcription": "The full transcribed text of the audio.",
  "violation_details": [
    {
      "violation_category_name": "HateSpeech",
      "violation_detected": true,
      "reason": "Specific hateful phrases used against [group].",
      "suggested_action": "Review for removal due to targeted hatred."
    },
    // ... Additional violation objects for each violation found ...
  ],
  "overall_assessment": "POTENTIAL_VIOLATION" // or "CLEAR_VIOLATION" based on severity
}
\`\`\`
`;

  const myfile = await ai.files.upload({
    file: '/home/krazygenus/Desktop/blip/backend/src/audio/user_9/c192445c-a9c3-4a08-9a2e-bacdd1b538c6/audio_9_Ayatul_Kursi_Full_-_Beautiful_Recitation.wav',
    config: { mimeType: "audio/wav"},
  });
  console.log('Upload URL', myfile.uri);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      promptText,
    ],
  ),
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

geminiSpeechAnalysis()