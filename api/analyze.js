// RxLumi Backend: AI Analysis Logic
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prescriptionText, patientDetails } = req.body;

  // AI Prompt: Yahan hum AI ko "Doctor/Pharmacist" banatay hain
  const systemPrompt = `
    You are RxLumi AI, a High-Level Clinical Pharmacist. 
    Analyze the following prescription: ${prescriptionText}.
    Patient Details: ${JSON.stringify(patientDetails)}.
    
    Provide:
    1. Medication Names & Purpose.
    2. Contraindications (Especially for ${patientDetails.age} years old).
    3. Drug-Drug Interactions.
    4. Dose Adjustments (Renal/Hepatic focus).
    5. Multilingual Summary (Urdu/English).
  `;

  try {
    // Ye hissa OpenAI ya Gemini AI se connect hoga
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: systemPrompt }]
      })
    });

    const data = await response.json();
    res.status(200).json({ analysis: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
}
