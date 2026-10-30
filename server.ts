/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client server-side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[Suraksha Server] Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback rule-based disaster intelligence generator
function generateDeterministicResponse(query: string, contextData: any): string {
  const q = query.toLowerCase();
  const habitations = contextData?.habitations || [];
  const safeSites = contextData?.safeSites || [];

  if (q.includes('highest risk') || q.includes('most critical') || q.includes('critical')) {
    const criticals = habitations
      .filter((h: any) => h.calculatedRisk >= 75)
      .slice(0, 3)
      .map((h: any) => `• **${h.name}** (${h.district}, ${h.state}) — Risk Score: **${h.calculatedRisk}/100** [Primary Hazard: ${h.primaryHazard}, Population: ${h.demographics?.totalPopulation?.toLocaleString()} with ${h.vulnerabilityPct}% vulnerable residents]`)
      .join('\n');
    return `### Critical Red Zone Habitations Requiring Priority Attention\n\nBased on composite multi-hazard risk assessment (incorporating hazard intensity, demographic exposure, infrastructure fragility, and historical losses), the following habitations are in the **Critical (Red Zone)** tier:\n\n${criticals || 'No critical habitations detected in current filter.'}\n\n**Key Recommendation:** Immediate SDMA/DDMA field verification and relocation planning to pre-identified safe upland sites.`;
  }

  if (q.includes('capacity') || q.includes('bottleneck') || q.includes('safe site') || q.includes('alternative')) {
    const siteSummaries = safeSites
      .slice(0, 3)
      .map((s: any) => `• **${s.name}** (${s.district}, ${s.state}): Safe additional capacity for **${s.safeAdditionalCapacity?.toLocaleString()} persons** (Limiting factor: *${s.limitingFactor}*). Existing population: ${s.existingPopulation?.toLocaleString()}.`)
      .join('\n');
    return `### Safe Alternative Relocation Site Carrying Capacities\n\nEach safe relocation site's capacity is constrained by the most restrictive infrastructure factor (Physical land, Water, Sanitation, Healthcare, Shelter, or Roads):\n\n${siteSummaries}\n\n**Planning Notice:** To expand safe intake capacity, authorities should prioritize capital works on the limiting bottleneck (especially drinking water and shelter expansion).`;
  }

  if (q.includes('why') || q.includes('mundakkai') || q.includes('chooralmala') || q.includes('raini') || q.includes('satabhaya')) {
    const matched = habitations.find((h: any) => q.includes(h.name.toLowerCase().split(' ')[0]));
    if (matched) {
      return `### Risk Analysis for ${matched.name} (${matched.district}, ${matched.state})\n\n• **Overall Risk Score:** ${matched.calculatedRisk}/100 (**${matched.riskTier}**)\n• **Primary Hazard:** ${matched.primaryHazard} (${matched.secondaryHazards?.join(', ') || 'None'})\n• **Vulnerability Exposure:** ${matched.demographics?.totalPopulation} residents (${matched.demographics?.children} children, ${matched.demographics?.seniorCitizens} seniors, ${matched.demographics?.personsWithDisabilities} persons with disabilities)\n• **Road Connectivity:** ${matched.roadConnectivity} (${matched.distanceToHospitalKm} km to nearest hospital)\n• **Disaster History:** Recorded devastating incidents including ${matched.historicalIncidents?.[0]?.event || 'severe loss of life and property'}.\n\n**Relocation Timeline:** Immediate priority relocation recommended to nearby safe zone.`;
    }
  }

  if (q.includes('summary') || q.includes('district') || q.includes('sdma') || q.includes('overview')) {
    const totalPop = habitations.reduce((acc: number, h: any) => acc + (h.demographics?.totalPopulation || 0), 0);
    const criticalCount = habitations.filter((h: any) => h.calculatedRisk >= 75).length;
    const highCount = habitations.filter((h: any) => h.calculatedRisk >= 50 && h.calculatedRisk < 75).length;
    return `### SURAKSHA Executive Decision Summary\n\n• **Total Mapped Habitations:** ${habitations.length} settlements\n• **Total Population at Risk:** ${totalPop.toLocaleString()} residents\n• **Critical Red Zones (Score ≥75):** ${criticalCount} habitations (Immediate relocation priority)\n• **High Risk Habitations (Score 50-74):** ${highCount} habitations (Short-term planned relocation)\n• **Identified Safe Sites:** ${safeSites.length} clusters with validated carrying capacity\n\n**Next Steps for Disaster Authorities:**\n1. Issue high-priority relocation advisory for Immediate tier habitations.\n2. Verify land allotment and infrastructure augmentation at matched recipient safe sites.\n3. Implement phased transit logistics with community rehabilitation officers.`;
  }

  return `### Suraksha Disaster Intelligence Assessment\n\nThank you for querying the SURAKSHA Decision Support System. Based on multi-hazard GIS analytics across the monitored habitations:\n\n1. **Red Zone Assessment:** Multi-hazard weighted risk scores combine 6 distinct dimensions (Hazard intensity, Population exposure, Vulnerability share, Disaster history, Infrastructure fragility, Evacuation isolation).\n2. **Carrying Capacity Rule:** Relocation allocations strictly observe infrastructure ceilings—no site is allotted beyond its most constraining capacity (water, sanitation, or shelter).\n3. **Proactive Relocation:** Settlements in critical danger (such as Mundakkai, Raini, Satabhaya, and Chooralmala) are queued for phased relocation to designated safe tablelands before recurring monsoon deluges.\n\n*Feel free to ask about specific villages, district summaries, or infrastructure bottlenecks.*`;
}

// Suraksha AI endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, contextData } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message query is required' });
  }

  // If Gemini API is configured with real key, query with timeout protection
  const hasRealKey = process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && 
    !process.env.GEMINI_API_KEY.includes('MY_GEMINI');

  if (ai && hasRealKey) {
    try {
      const systemInstruction = `You are Suraksha AI, an expert geospatial disaster-risk intelligence analyst for Indian State Disaster Management Authorities (SDMAs) and District Collectors.
You provide precise, evidence-based disaster mitigation advice.
You have access to the current database state provided in the prompt:
- Mapped Habitations: ${JSON.stringify(contextData?.habitations?.slice(0, 10) || [])}
- Safe Relocation Sites & Carrying Capacities: ${JSON.stringify(contextData?.safeSites?.slice(0, 8) || [])}
- Active Simulation Parameters: ${JSON.stringify(contextData?.simulation || {})}

Guidelines:
1. Ground your answers strictly in the provided data. Never fabricate official warning statuses.
2. Emphasize multi-hazard factors: landslide slopes, flood/cloudburst recurrence, coastal sea-erosion, demographic vulnerability, and evacuation isolation.
3. For relocation matching, explain why a site is suitable and identify any bottleneck (water, sanitation, healthcare, roads).
4. Use clean markdown formatting with bullet points and bold highlights for readability by government decision-makers.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out, using intelligent rule engine')), 4000)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction,
          },
        }),
        timeoutPromise,
      ]);

      const text = response.text || generateDeterministicResponse(message, contextData);
      return res.json({ reply: text, provider: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('[Suraksha Server] Gemini API error, falling back to deterministic response:', err.message);
      const fallbackText = generateDeterministicResponse(message, contextData);
      return res.json({ reply: fallbackText, provider: 'suraksha-rule-engine-fallback' });
    }
  }

  // Deterministic fallback response when no GEMINI_API_KEY is configured
  const reply = generateDeterministicResponse(message, contextData);
  return res.json({ reply, provider: 'suraksha-rule-engine' });
});

// Setup Vite middlewares for frontend in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SURAKSHA] Decision Support System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
