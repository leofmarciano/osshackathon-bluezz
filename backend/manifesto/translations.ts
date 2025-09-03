import { api, APIError } from "encore.dev/api";
import { manifestoDB } from "./db";
import { ManifestoVersionWithTranslations, ProposalWithTranslations } from "./types";
import Anthropic from "@anthropic-ai/sdk";
import { secret } from "encore.dev/config";

const anthropicApiKey = secret("AnthropicAPIKey");

// Claude client for translations
const getClaudeClient = () => {
  const apiKey = anthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }
  return new Anthropic({ apiKey });
};

interface TranslationResult {
  language: string;
  title?: string;
  description?: string;
  content: string;
}

// Translate manifesto content to multiple languages
export async function translateManifestoContent(
  content: string,
  title?: string,
  description?: string
): Promise<TranslationResult[]> {
  const claude = getClaudeClient();
  const supportedLanguages = ['en', 'es', 'fr']; // Portuguese is the original, add English, Spanish, French
  const translations: TranslationResult[] = [];

  for (const lang of supportedLanguages) {
    try {
      const systemPrompt = `You are a professional translator. Translate the following content from Portuguese to ${getLanguageName(lang)}. 
      Maintain the markdown formatting exactly as it is. Only translate the text content, not the markdown syntax.
      Return only the translated content without any additional explanation, and the full content, not just the translated part.`;

      const contentToTranslate = title && description 
        ? `TITLE: ${title}\n\nDESCRIPTION: ${description}\n\nCONTENT:\n${content}`
        : content;

      const response = await claude.messages.create({
        model: "claude-4-sonnet",
        max_tokens: 128000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: contentToTranslate
          }
        ]
      });

      const translatedText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      if (title && description) {
        // Parse the translated title, description, and content
        const lines = translatedText.split('\n');
        const titleLine = lines.find(line => line.startsWith('TITLE:'));
        const descLine = lines.find(line => line.startsWith('DESCRIPTION:'));
        const contentStart = translatedText.indexOf('CONTENT:');
        
        translations.push({
          language: lang,
          title: titleLine ? titleLine.replace('TITLE:', '').trim() : title,
          description: descLine ? descLine.replace('DESCRIPTION:', '').trim() : description,
          content: contentStart !== -1 ? translatedText.substring(contentStart + 8).trim() : translatedText
        });
      } else {
        translations.push({
          language: lang,
          content: translatedText
        });
      }
    } catch (error) {
      console.error(`Failed to translate to ${lang}:`, error);
      // Continue with other translations even if one fails
    }
  }

  return translations;
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French'
  };
  return languages[code] || code;
}

// Create translations for a manifesto version
export const createManifestoTranslations = api(
  { expose: false },
  async ({ versionId, content }: { versionId: number; content: string }): Promise<{ success: boolean }> => {
    const translations = await translateManifestoContent(content);

    for (const translation of translations) {
      try {
        await manifestoDB.exec`
          INSERT INTO manifesto_translations (version_id, language, content)
          VALUES (${versionId}, ${translation.language}, ${translation.content})
          ON CONFLICT (version_id, language) 
          DO UPDATE SET content = ${translation.content}, created_at = NOW()
        `;
      } catch (error) {
        console.error(`Failed to save translation for ${translation.language}:`, error);
      }
    }

    return { success: true };
  }
);

// Create translations for a proposal
export const createProposalTranslations = api(
  { expose: false },
  async ({ 
    proposalId, 
    title, 
    description, 
    newContent 
  }: { 
    proposalId: number; 
    title: string; 
    description: string; 
    newContent: string; 
  }): Promise<{ success: boolean }> => {
    const translations = await translateManifestoContent(newContent, title, description);

    for (const translation of translations) {
      try {
        await manifestoDB.exec`
          INSERT INTO proposal_translations (
            proposal_id, language, title, description, new_content
          ) VALUES (
            ${proposalId}, 
            ${translation.language}, 
            ${translation.title || title}, 
            ${translation.description || description}, 
            ${translation.content}
          )
          ON CONFLICT (proposal_id, language) 
          DO UPDATE SET 
            title = ${translation.title || title},
            description = ${translation.description || description},
            new_content = ${translation.content},
            created_at = NOW()
        `;
      } catch (error) {
        console.error(`Failed to save proposal translation for ${translation.language}:`, error);
      }
    }

    return { success: true };
  }
);

// Get manifesto version with translations
export const getManifestoWithTranslations = api(
  { expose: true, method: "GET", path: "/manifesto/:id/translations" },
  async ({ id, language }: { id: string; language?: string }): Promise<{ manifesto: ManifestoVersionWithTranslations }> => {
    const versionId = parseInt(id);
    
    // Get the base version
    const version = await manifestoDB.queryRow<{
      id: number;
      version_number: number;
      content: string;
      author_id: string;
      author_name: string;
      created_at: Date;
      is_current: boolean;
    }>`
      SELECT id, version_number, content, author_id, author_name, created_at, is_current
      FROM manifesto_versions
      WHERE id = ${versionId}
    `;

    if (!version) {
      throw APIError.notFound("Version not found");
    }

    // Get translations
    if (language && language !== 'pt') {
      const translation = await manifestoDB.queryRow<{ content: string }>`
        SELECT content FROM manifesto_translations
        WHERE version_id = ${versionId} AND language = ${language}
      `;

      return {
        manifesto: {
          ...version,
          content: translation?.content || version.content,
          language: translation ? language : 'pt'
        }
      };
    }

    // Get all translations
    const translations: Record<string, string> = { pt: version.content };
    const translationRows = await manifestoDB.query<{ language: string; content: string }>`
      SELECT language, content FROM manifesto_translations
      WHERE version_id = ${versionId}
    `;

    for await (const row of translationRows) {
      translations[row.language] = row.content;
    }

    return {
      manifesto: {
        ...version,
        translations
      }
    };
  }
);

// Get proposal with translations
export const getProposalWithTranslations = api(
  { expose: true, method: "GET", path: "/manifesto/proposal/:id/translations" },
  async ({ id, language }: { id: string; language?: string }): Promise<{ proposal: ProposalWithTranslations }> => {
    const proposalId = parseInt(id);
    
    // Get the base proposal
    const proposal = await manifestoDB.queryRow<{
      id: number;
      title: string;
      description: string;
      new_content: string;
      author_id: string;
      author_name: string;
      status: string;
      votes_yes: number;
      votes_no: number;
      votes_abstain: number;
      created_at: Date;
      expires_at: Date;
    }>`
      SELECT id, title, description, new_content, author_id, author_name,
             status, votes_yes, votes_no, votes_abstain, created_at, expires_at
      FROM manifesto_proposals
      WHERE id = ${proposalId}
    `;

    if (!proposal) {
      throw APIError.notFound("Proposal not found");
    }

    // Get specific language translation
    if (language && language !== 'pt') {
      const translation = await manifestoDB.queryRow<{
        title: string;
        description: string;
        new_content: string;
      }>`
        SELECT title, description, new_content FROM proposal_translations
        WHERE proposal_id = ${proposalId} AND language = ${language}
      `;

      if (translation) {
        return {
          proposal: {
            ...proposal,
            title: translation.title,
            description: translation.description,
            new_content: translation.new_content,
            language
          }
        };
      }
    }

    // Return original Portuguese version
    return {
      proposal: {
        ...proposal,
        language: 'pt'
      }
    };
  }
);