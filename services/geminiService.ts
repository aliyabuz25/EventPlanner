const API_KEY = process.env.API_KEY || "";

const getGoogleGenAI = async () => {
  const module = await import('@google/genai');
  return module.GoogleGenAI;
};

// Standard Chat Widget Service (3ILINE Brand Persona)
export const getGeminiConsultantResponse = async (userMessage: string) => {
  if (!API_KEY) return "The consultant is currently offline. Please try again later.";

  const GoogleGenAI = await getGoogleGenAI();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `You are an expert SAP Consultant for 3ILINE. 
        3ILINE is the premier SAP Gold Partner in Azerbaijan.
        You specialize in digital transformation, ERP implementation (SAP S/4HANA), HCM (SuccessFactors), Procurement (ARIBA), and Information Management (OpenText).
        Your tone is professional, technical yet accessible, and helpful. 
        Always link business challenges to 3ILINE's proven solutions in the region.
        Mention that 3ILINE serves major industries like Oil & Gas, Public Sector, and Retail in Azerbaijan.
        If users ask for details not in your training data, use Google Search grounding to find the latest info about 3ILINE's projects.`,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    let text = response.text || "I'm sorry, I couldn't process that request at the moment.";
    
    // Clean up response text if it includes raw grounding data
    if (citations.length > 0) {
      const links = citations
        .map((c: any) => c.web?.uri)
        .filter((uri: string, index: number, self: string[]) => uri && self.indexOf(uri) === index);
      
      if (links.length > 0) {
        text += "\n\nSources:\n" + links.map(link => `- ${link}`).join('\n');
      }
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our AI consultant is currently synchronizing with the central business intelligence hub. Please try again in a moment.";
  }
};

// ERP Selection Advisor Service (Vendor-Agnostic Persona)
export const getErpAdvisorResponse = async (history: { role: string; parts: { text: string }[] }[], userMessage: string) => {
  if (!API_KEY) return "The advisor is currently offline.";

  const GoogleGenAI = await getGoogleGenAI();
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // We construct the chat history for context
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: history,
      config: {
        temperature: 0.5, // Lower temperature for more analytical/consistent responses
        systemInstruction: `You are a specialized ERP Selection Advisor. 
        
        **ROLE & BOUNDARIES:**
        1. You act as a neutral, vendor-agnostic consultant.
        2. Do NOT promote specific vendors (like SAP, Oracle, Microsoft) unless explicitly asked by the user.
        3. Do NOT use marketing fluff or buzzwords. Use clear, corporate, executive-level language.
        4. Do NOT behave like a sales chatbot. Your goal is decision support.

        **PROCESS:**
        You must guide the user through a selection interview. 
        Ask ONE question at a time. Wait for the answer.
        
        **EVALUATION CRITERIA (Collect this data sequentially):**
        1. **Company Size:** Revenue and Employee count.
        2. **Industry:** Sector and specific regulatory needs.
        3. **Process Complexity:** Multi-entity, multi-currency, manufacturing depth, supply chain complexity.
        4. **IT Maturity:** Current systems (Legacy/Excel?), internal IT team size.
        5. **Budget/Timeline:** Capex vs Opex preference, urgency.

        **OUTPUT STAGE:**
        Once you have sufficient information (usually after 4-5 turns), stop asking questions and provide a "Strategic Recommendation".
        
        The Recommendation must follow this format:
        *   **Recommended ERP Tier:** (Tier 1, Tier 2, or Tier 3).
        *   **Rationale:** Why this tier fits their complexity/size.
        *   **Key Risks:** What could go wrong (e.g., "Over-customization", "Insufficient change management").
        *   **Suggested Next Step:** A practical next move (e.g., "Draft an RFP", "Audit current processes").
        
        **TIER DEFINITIONS (Internal Reference):**
        *   *Tier 1:* Global, highly complex (e.g., SAP S/4HANA, Oracle Fusion). For large enterprises ($500M+ rev).
        *   *Tier 2:* Mid-market, robust but less heavy (e.g., SAP ByDesign, NetSuite, Microsoft D365 BC).
        *   *Tier 3:* Small business, out-of-box (e.g., SAP Business One, Odoo, Xero).
        
        Start the conversation by introducing yourself as an independent advisor and asking the first question about their organization's size.`,
      },
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;

  } catch (error) {
    console.error("Gemini Advisor Error:", error);
    return "I apologize, but I am unable to process your specific inputs right now. Please verify your connection.";
  }
};
