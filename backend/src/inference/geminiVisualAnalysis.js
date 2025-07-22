  const {
    GoogleGenAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/genai");
  const env = require('../../env-loader');
  const GOOGLE_GEMENI_VISUAL_KEY = env.GOOGLE_GEMENI_VISUAL_KEY;
  

  console.log('Gemeni Key', GOOGLE_GEMENI_VISUAL_KEY);
  // Ensure API key is available
  if (!GOOGLE_GEMENI_VISUAL_KEY) {
    throw new Error("GOOGLE_GEMENI_VISUAL_KEY environment variable is not set.");
  }

  // Initialize the Generative AI client
  const genAI = new GoogleGenAI({ apiKey: GOOGLE_GEMENI_VISUAL_KEY });


  /**
   * Prompt text for Gemini API to analyze image frames for YouTube Community Guideline violations.
   * Instructs the model to return ONLY flagged frames in a structured JSON array.
   */
  const promptText = `You are an AI assistant specialized in analyzing YouTube video content, focusing on visual content (image frames) for Community Guideline violations.

  Carefully examine EACH individual image frame provided.

  For each frame, assess if it contains any 'POTENTIAL_VIOLATION' or 'CLEAR_VIOLATION' based on the detailed guidelines below.

  **Return a JSON array named "flagged_frames" that ONLY contains objects for frames that are determined to have a 'POTENTIAL_VIOLATION' or 'CLEAR_VIOLATION'.**

  Each object in the "flagged_frames" array MUST contain:
  - "frame_index": The 0-based index of the frame as it was provided in this request.
  - "overall_assessment": The specific assessment for THIS frame, which MUST be either "POTENTIAL_VIOLATION" or "CLEAR_VIOLATION".
  - "violation_details": An array of objects for THIS specific frame, each with:
      - "violation_category_name": e.g., "HateSpeech", "Violence", "Nudity"
      - "violation_detected": true (always true for flagged frames)
      - "reason": A concise, specific visual description of the violation in THIS frame.
      - "suggested_action": A brief suggested action for THIS frame (e.g., "Review for removal", "Timestamp for manual review").

  **If NONE of the provided frames contain any 'POTENTIAL_VIOLATION' or 'CLEAR_VIOLATION', return an empty array for "flagged_frames".**

  ---
  **DETAILED GUIDELINES FOR VIOLATION ANALYSIS:**

  1.  **Hate Speech:**
      * **CLEAR_VIOLATION:** Explicit and unambiguous visual display of hate symbols, gestures (e.g., Nazi salute), or direct targeting of protected groups based on race, ethnicity, origin, religion, disability, gender, sexual orientation, or veteran status with visual incitement to hatred.
      * **POTENTIAL_VIOLATION:** Ambiguous symbols, implied gestures, or content that subtly promotes discrimination or denigration against protected groups without direct incitement.
  2.  **Violence:**
      * **CLEAR_VIOLATION:** Graphic, gratuitous violence (e.g., severe injury, dismemberment, extreme gore), realistic depiction of harm to humans or animals, encouragement of violent acts.
      * **POTENTIAL_VIOLATION:** Implied violence, non-graphic or stylized violence (e.g., cartoon violence without real-world implications), or content that could be interpreted as mild threat without clear intent.
  3.  **Nudity/Sexual Content:**
      * **CLEAR_VIOLATION:** Explicit nudity (genitals, exposed breasts), sexually explicit acts, child sexual abuse material (CSAM).
      * **POTENTIAL_VIOLATION:** Partial nudity, suggestive poses, sexually suggestive clothing without explicit exposure, content that could be interpreted as mildly erotic or implies sexual activity.
  4.  **Self-Harm:**
      * **CLEAR_VIOLATION:** Graphic depictions of self-mutilation, suicide attempts, or content directly promoting self-harm.
      * **POTENTIAL_VIOLATION:** Implied self-harm, discussion of self-harm methods without explicit depiction, or content that could be interpreted as glorifying self-harm.
  5.  **Illegal Activities:**
      * **CLEAR_VIOLATION:** Visual depiction of illegal drug manufacturing/use, illegal weapons (e.g., automatic firearms used in criminal context), or other criminal acts.
      * **POTENTIAL_VIOLATION:** Ambiguous drug paraphernalia, implied illegal activities, or content that could be interpreted as promoting minor criminal acts without clear depiction.
  6.  **Child Safety:**
      * **CLEAR_VIOLATION:** Any content depicting the exploitation, abuse, or endangerment of minors (CSAM, child abuse).
      * **POTENTIAL_VIOLATION:** Content showing minors in risky situations, or potentially exploitative contexts without clear abuse.
  7.  **Harmful/Dangerous Acts:**
      * **CLEAR_VIOLATION:** Content depicting or promoting extremely dangerous challenges (e.g., choking game), or acts that could result in severe bodily harm.
      * **POTENTIAL_VIOLATION:** Depictions of moderately dangerous acts, or content that could be interpreted as encouraging risky behavior without direct incitement.
  8.  **Harassment/Cyberbullying:**
      * **CLEAR_VIOLATION:** Visuals clearly designed to intimidate, harass, or cyberbully an individual or group (e.g., doxxing visuals, targeted threats).
      * **POTENTIAL_VIOLATION:** Subtle visual cues of harassment, non-explicit bullying.
  9.  **Misinformation/Disinformation (Visual):**
      * **CLEAR_VIOLATION:** Visual content presenting demonstrably false information that causes real-world harm (e.g., deepfakes used to incite violence, manipulated medical content).
      * **POTENTIAL_VIOLATION:** Misleading visuals, content that implies false narratives without clear intent to harm.

  ---
  `;

  /**
   * Configuration for Gemini's generation parameters.
   */
  const generationConfig = {
    temperature: 0.2, // Lower temperature for more deterministic/factual output
    topK: 0,
    topP: 0,
    maxOutputTokens: 2048, // Adjust as needed, but this is a good starting point
    responseMimeType: "application/json", // Crucial for JSON output
  };

  /**
   * Safety settings to block content that violates safety guidelines.
   */
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  /**
   * Sends an array of image parts to the Gemini API for visual violation analysis.
   * The prompt instructs the model to return only flagged frames.
   * @param {Array<Object>} fileToGenerativeArray - An array of Gemini API Part objects (inlineData).
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of flagged frame objects.
   */
  async function geminiVisualAnalysis(fileToGenerativeArray) {
    console.log('Gemini key:', GOOGLE_GEMENI_VISUAL_KEY ? 'Set' : 'Not Set');

    if (!Array.isArray(fileToGenerativeArray) || fileToGenerativeArray.length === 0) {
      console.warn("gemeniVisualAnalysis received an empty or invalid array of image parts.");
      return []; // Return empty array if no images to process
    }

    try {
      // Construct the contents array for the Gemini request.
      // The prompt text comes first, followed by all image parts.
      const contents = [
        { text: promptText },
        ...fileToGenerativeArray, // Spread the array of image parts
      ];

      // Make the generateContent API call using the 'model' instance
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        generationConfig,
        safetySettings,
      });
      // Extract the text response from the result
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Response:', responseText);
      // Clean the response text: remove markdown fences if present
      const jsonString = responseText.replace(/```json\n|\n```/g, '').trim();

      let parsedOutput = [];
      try {
        parsedOutput = await JSON.parse(jsonString);
        console.log('Parsed Gemini output:', parsedOutput);
        return parsedOutput;
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response. Raw text:", responseText, "Error:", parseError);
        // If parsing fails, it means the model didn't return valid JSON.
        // Treat this as no flagged frames or an error in the response.
        return [];
      }

    } catch (error) {
      console.error("Error calling Gemini API for visual analysis:", error);
    }
  }

  module.exports = { geminiVisualAnalysis };
