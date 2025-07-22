const { GoogleGenAI } = require("@google/genai");
const env = require('../../env-loader');

const GOOGLE_GEMINI_TEXT_KEY = env.GOOGLE_GEMENI_SPEECH_API_KEY;


if (!GOOGLE_GEMINI_TEXT_KEY) {
  console.error("ERROR: GOOGLE_GEMINI_TEXT_KEY environment variable is not defined. Gemini API calls will fail.");
}

// Initialize the Generative AI client
const ai = new GoogleGenAI({ apiKey: GOOGLE_GEMINI_TEXT_KEY });
/**
 * Performs AI text analysis on audio transcript data using the Gemini API.
 *
 * @param {string} fullTranscript - The complete transcribed text of the audio.
 * @param {Array<Object>} utterancesArray - An array of sentence-level objects from Deepgram,
 * each containing 'transcript', 'start', and 'end' timestamps.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of violation objects,
 * or an empty array if no violations are found or an error occurs.
 */
async function geminiTextAnalysis(fullTranscript, utterancesArray, jobId, userId) {

  // --- Gemini Prompt with Hyper-Explicit Moderation Guidelines ---
  const prompt = `
  You are an advanced audio content moderation AI for the Nova platform.
  Your critical task is to meticulously analyze the provided audio transcript using the YouTube community guideline and all general online platforms guidelines, for any violations of content policy.
  **Pay EXTREMELY close attention to the overall context, intent, implications, and the suggestive or instructional nature of the language used.**

  Content policies include, but are not limited to:
  1.  **Sexually Explicit, Suggestive, or Instructional Content (HIGH PRIORITY):**
      * **Direct or indirect references to sexual acts, sexual body parts, or sexual arousal.**
      * **Content that is sexually suggestive, lewd, indecent, or designed to elicit a sexual response.**
      * **CRITICALLY: This includes language that encourages, instructs, or guides a user through sexual acts, including masturbation or other forms of self-stimulation.**
      * **Look for phrases that describe or imply physical actions related to sexual activity (e.g., "stroke," "touch yourself," "come," "wet," "hard," "cock," "penis," "lick," "taste," "sliding into me," "ride you," "feel my big breasts," "massage them"), especially when combined with encouragement or instructional tone.**
      * **Identify content that attempts to simulate or describe sexual encounters or arousal, even if not using overtly vulgar terms.**
      * **Consider the overall tone and narrative if it's designed to be sexually stimulating or instructional.**
  2.  **Hate Speech (HIGH PRIORITY):** Attacks or incites hatred against individuals or groups based on attributes like race, ethnicity, national origin, religion, disability, gender, age, veteran status, sexual orientation, or gender identity.
      * **Look for derogatory terms, dehumanizing language, threats, or calls for violence against specific groups.**
      * **Consider the severity and directness of the attack.**
  3.  **Harassment:** Repeated or severe abusive content directed at an individual or group.
  4.  **Violence:** Threats of violence, promotion of violence, or glorification of violent acts.
  5.  **Illegal Activities:** Promotion, instruction, or facilitation of illegal acts.
  6.  **Self-Harm:** Promotion or glorification of self-harm, suicide, or eating disorders.

  Here is the FULL AUDIO TRANSCRIPT for comprehensive context. Understand the narrative flow, the speaker's intent, and any underlying suggestive meanings:
  ---
  ${fullTranscript}
  ---

  Here is the SENTENCE-LEVEL DATA, provided as a JSON array of objects. Each object contains the 'transcript' (text) of a sentence, its 'start' timestamp (in seconds), and 'end' timestamp (in seconds). Use this data to precisely identify the timing of any violations.
  The 'transcript' field within each object in the SENTENCE-LEVEL DATA should be considered the content of that specific segment.

  If one or more violations are detected based on the full transcript and sentence-level data, identify the exact sentences or phrases involved and their corresponding start and end timestamps. The timestamps MUST correspond to the provided sentence-level data.

  For each detected violation, provide the following information in a structured JSON array. If no violations are found, return an empty JSON array.

  Output Format (JSON Array of Objects):
  [
    {
      "violationType": "STRING", // e.g., "Sexually Explicit/Instructional", "Hate Speech", "Harassment", "Violence", "Illegal Activity", "Self-Harm"
      "violatingSegment": "STRING", // The exact text of the phrase or sentence that violates policy.
      "startTime": "NUMBER", // The start timestamp (in seconds) of the violating segment.
      "endTime": "NUMBER", // The end timestamp (in seconds) of the violating segment.
      "reason": "STRING", // A concise explanation of why this segment violates the policy, specifically referencing the policy violated and the nature of the violation (e.g., "Instructional sexual content," "Suggestive language").
      "remediationSuggestion": "STRING" // e.g., "Mute segment", "Remove content", "Review manually by human moderator", "Issue warning to user"
    },
    // ... additional violation objects if multiple are found
  ]
 `;
  
  // --- Configure Gemini's Response Schema ---
  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          violationType: { type: "STRING" },
          violatingSegment: { type: "STRING" },
          startTime: { type: "NUMBER" },
          endTime: { type: "NUMBER" },
          reason: { type: "STRING" },
          remediationSuggestion: { type: "STRING" }
        },
        required: ["violationType", "violatingSegment", "startTime", "endTime", "reason", "remediationSuggestion"]
      }
    }
  };

  try {
    // Stringify utterancesArray to embed it as a proper JSON string in the prompt
    const stringifiedUtterances = JSON.stringify(utterancesArray, null, 2);

    // Make the Gemini API call using the 'ai' instance (CONFIRMED CORRECT FOR LATEST SDK)
    const result = await ai.models.generateContent({ // Direct call on 'ai' instance
      model: 'gemini-2.0-flash', // Model specified here
      contents: [{ role: "user", parts: [{ text: prompt.replace('${utterancesArray}', stringifiedUtterances) }] }],
      generationConfig,
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    // Clean the response text: remove markdown fences if present
    const jsonString = responseText.replace(/```json\n|\n```/g, '').trim();

    let parsedOutput = [];
    if (jsonString) {
        try {
            parsedOutput = JSON.parse(jsonString); // UNCOMMENTED AND USED
            console.log('Gemini Parsed Output:', parsedOutput);
        } catch (parseError) {
            console.error('Error occurred during JSON parsing of Gemini response:', parseError);
            console.error('Raw Gemini response text that failed to parse:', responseText);
            // If parsing fails, return empty array as no valid violations could be extracted.
            return []; 
        }
    } else {
        console.warn('Gemini returned an empty response for text analysis.');
    }
    
    return parsedOutput;
    
  } catch (error) {
    console.error('Error occurred during Gemini text analysis API call:', error);
  }
}

module.exports = { geminiTextAnalysis };
