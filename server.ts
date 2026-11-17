import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const VALID_CATEGORIES = new Set([
  'Plastics',
  'Paper',
  'Food Waste',
  'Textiles',
  'Metals',
  'Glass',
  'Packaging',
  'Electronics',
]);

interface CatalogEntry {
  id: string;
  name: string;
  category: string;
}

interface IdentifyRequestBody {
  imageDataUrl?: string;
  catalogSummary?: CatalogEntry[];
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Allow cross-origin calls when Vercel frontend connects to Render backend
  app.use('/api', (req, res, next) => {
    const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/identify-product', async (req, res) => {
    try {
      const body = (req.body ?? {}) as IdentifyRequestBody;
      if (!body.imageDataUrl) {
        res.status(400).json({ error: 'No image frame was captured.' });
        return;
      }

      const parsed = parseDataUrl(body.imageDataUrl);
      if (!parsed) {
        res.status(400).json({ error: 'Invalid captured image format.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Image identification is not configured yet. Set GEMINI_API_KEY in Settings > Secrets, or choose a barcode below.',
        });
        return;
      }

      const catalogList = Array.isArray(body.catalogSummary)
        ? body.catalogSummary
            .slice(0, 60)
            .map((item) => `- ${item.id}: ${item.name} (${item.category})`)
            .join('\n')
        : '';

      const prompt = [
        'Inspect this camera photo of an everyday consumer product, packaging, or waste item.',
        'Identify the primary product/material shown.',
        'If there is no clear product or object (for example, completely dark, blank wall, or obscured lens), set detected=false.',
        catalogList
          ? `If the photographed item clearly matches an existing entry in this SmartDisposal catalog, set matchedCatalogId to its exact id:\n${catalogList}`
          : '',
        'Return accurate biodegradability metadata based on material science:',
        '- category must be one of: Plastics, Paper, Food Waste, Textiles, Metals, Glass, Packaging, Electronics.',
        '- timelinePercent is 0-100 on a log scale (days/weeks=4-20, months=20-35, 1-10 years=36-58, decades-century=60-80, centuries+=82-98).',
        '- Provide 2 to 4 items in breaksDownInto, a concise 2-sentence whyExplanation, and a realistic greener alternative.',
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detected: {
                type: Type.BOOLEAN,
                description: 'True if an identifiable object or product is visible in the photo.',
              },
              matchedCatalogId: {
                type: Type.STRING,
                description: 'Exact catalog id if matched, otherwise empty string.',
              },
              productName: {
                type: Type.STRING,
                description: 'Clear name of the photographed item (e.g. Ceramic coffee mug, Plastic water bottle).',
              },
              category: {
                type: Type.STRING,
                description:
                  'One of: Plastics, Paper, Food Waste, Textiles, Metals, Glass, Packaging, Electronics.',
              },
              subTopic: {
                type: Type.STRING,
                description: 'Short material sub-classification (e.g. PET #1, Unbleached Kraft).',
              },
              biodegradable: {
                type: Type.BOOLEAN,
              },
              decompositionTime: {
                type: Type.STRING,
                description: 'Human-readable timeframe e.g. 2 to 6 weeks or 450 years.',
              },
              decompositionDays: {
                type: Type.INTEGER,
              },
              timelinePercent: {
                type: Type.INTEGER,
              },
              breaksDownInto: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              whyExplanation: {
                type: Type.STRING,
              },
              alternativeName: {
                type: Type.STRING,
              },
              alternativeReason: {
                type: Type.STRING,
              },
              alternativeDecompositionTime: {
                type: Type.STRING,
              },
              barcode: {
                type: Type.STRING,
                description: 'Visible numeric UPC/EAN barcode digits if readable, otherwise empty string.',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Received an empty analysis response. Please retake the photo.' });
        return;
      }

      const data = JSON.parse(rawText) as Record<string, unknown>;
      const category =
        typeof data.category === 'string' && VALID_CATEGORIES.has(data.category)
          ? data.category
          : 'Packaging';

      res.json({
        ...data,
        category,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to analyze captured photo right now.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartDisposal server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
