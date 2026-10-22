import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/generate-music', async (req, res) => {
    try {
      const {
        model = 'lyria-3-clip-preview',
        prompt,
        useArtistImage = true,
      } = req.body || {};

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({ error: 'A musical prompt is required.' });
        return;
      }

      const selectedModel =
        model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(402).json({
          error:
            'Lyria music generation requires a valid paid GEMINI_API_KEY configured in AI Studio Secrets.',
          code: 'MISSING_API_KEY',
          modelUsed: selectedModel,
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      let contents:
        | string
        | {
            parts: Array<
              | { text: string }
              | { inlineData: { data: string; mimeType: string } }
            >;
          } = prompt.trim();

      if (useArtistImage) {
        const imagePath = path.resolve(
          process.cwd(),
          'public/assets/aistudio/IMG_20260527_055206691_HDR_a7a84a98.jpg'
        );
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const base64ImageData = imageBuffer.toString('base64');
          contents = {
            parts: [
              { text: prompt.trim() },
              {
                inlineData: {
                  data: base64ImageData,
                  mimeType: 'image/jpeg',
                },
              },
            ],
          };
        }
      }

      const response = await ai.models.generateContentStream({
        model: selectedModel,
        contents,
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        res.status(200).json({
          ok: false,
          error: 'Lyria stream completed without returning audio bytes.',
          code: 'EMPTY_AUDIO_STREAM',
          modelUsed: selectedModel,
        });
        return;
      }

      res.json({
        ok: true,
        audioBase64,
        mimeType,
        generatedLyrics: lyrics,
        modelUsed: selectedModel,
      });
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error ? err.message : 'Failed to generate music with Lyria.';
      const isQuotaOrBilling =
        rawMessage.includes('429') ||
        rawMessage.includes('RESOURCE_EXHAUSTED') ||
        rawMessage.includes('free_tier') ||
        rawMessage.includes('billing') ||
        rawMessage.includes('quota');

      const cleanError = isQuotaOrBilling
        ? `Google Lyria (${req.body?.model || 'lyria-3-clip-preview'}) requires a paid Gemini API key with billing enabled.`
        : 'Lyria cloud generation is currently unavailable for the active API key.';

      res.status(200).json({
        ok: false,
        error: cleanError,
        code: isQuotaOrBilling ? 'PAID_KEY_REQUIRED' : 'LYRIA_GENERATION_FAILED',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
