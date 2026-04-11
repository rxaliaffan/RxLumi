export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prescriptionText, patientDetails } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // Professional PharmD Clinical Prompt
  const prompt = `
    You are RxLumi, a specialized Clinical Pharmacist AI. 
    Review the following prescription text: "${prescriptionText}"
    
    PATIENT PROFILE:
    Age: ${patientDetails.age || 'Not specified'}
    Weight: ${patientDetails.weight || 'Not specified'}
    Gender: ${patientDetails.gender || 'Not specified'}
    Known Conditions: ${patientDetails.history || 'None reported'}

    TASK:
    1. List medications found.
    2. Identify Potential Drug-Drug Interactions.
    3. Check for Contraindications based on patient profile (especially age-related).
    4. Recommend Dose Adjustments if needed (Renal/Hepatic/Geriatric).
    5. Provide a summary in simple English AND a translated summary in Urdu.
    
    DISCLAIMER: State clearly that this is an AI tool and a human pharmacist must be consulted.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      const resultText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ analysis: resultText });
    } else {
      throw new Error('Invalid response from Gemini');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to connect to Gemini API" });
  }
}
