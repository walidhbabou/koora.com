import { parseEditorJsToHtml } from './parseEditorJs';
import DOMPurify from 'dompurify';

// Interface pour les blocs Editor.js (version simplifiée)
interface EditorJsBlock {
  type: string;
  data: {
    file?: {
      url: string;
    };
    [key: string]: unknown;
  };
}

interface EditorJsContent {
  blocks: EditorJsBlock[];
  version?: string;
  time?: number;
}

/**
 * Parse and sanitize Editor.js content for display
 * @param content - Raw Editor.js JSON content as string
 * @returns Sanitized HTML string ready for dangerouslySetInnerHTML
 */
export const parseAndSanitizeContent = (content: string): string => {
  if (!content) return '';
  
  try {
    const htmlContent = parseEditorJsToHtml(content);
    return DOMPurify.sanitize(htmlContent);
  } catch (error) {
    console.error('Error parsing content:', error);
    return '<p>خطأ في تحميل المحتوى</p>';
  }
};

/**
 * Extract plain text from Editor.js content for SEO descriptions
 * @param content - Raw Editor.js JSON content as string
 * @param maxLength - Maximum length of extracted text (default: 150)
 * @returns Plain text without HTML tags
 */
export const extractPlainText = (content: string, maxLength = 150): string => {
  if (!content) return '';
  
  try {
    const htmlContent = parseEditorJsToHtml(content);
    const plainText = htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
};

/**
 * Extract images from Editor.js content
 * @param content - Raw Editor.js JSON content as string
 * @returns Array of image URLs found in the content
 */
export const extractImages = (content: string): string[] => {
  if (!content) return [];
  
  try {
    const parsed: EditorJsContent = JSON.parse(content);
    const images: string[] = [];
    
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      parsed.blocks.forEach((block: EditorJsBlock) => {
        if (block.type === 'image' && block.data?.file?.url) {
          images.push(block.data.file.url);
        }
      });
    }
    
    return images;
  } catch (error) {
    console.error('Error extracting images:', error);
    return [];
  }
};

/**
 * Get the first image from Editor.js content (useful for article thumbnails)
 * @param content - Raw Editor.js JSON content as string
 * @returns First image URL or null if no images found
 */
export const getFirstImage = (content: string): string | null => {
  const images = extractImages(content);
  return images.length > 0 ? images[0] : null;
};

/**
 * Count words in Editor.js content
 * @param content - Raw Editor.js JSON content as string
 * @returns Number of words in the content
 */
export const countWords = (content: string): number => {
  if (!content) return 0;
  
  try {
    const plainText = extractPlainText(content, Number.MAX_SAFE_INTEGER);
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  } catch (error) {
    console.error('Error counting words:', error);
    return 0;
  }
};

/**
 * Estimate reading time based on content
 * @param content - Raw Editor.js JSON content as string
 * @param wordsPerMinute - Average reading speed (default: 200 words per minute)
 * @returns Estimated reading time in minutes
 */
export const estimateReadingTime = (content: string, wordsPerMinute = 200): number => {
  const wordCount = countWords(content);
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Check if content contains specific block types
 * @param content - Raw Editor.js JSON content as string
 * @param blockTypes - Array of block types to check for
 * @returns Boolean indicating if any of the specified block types are present
 */
export const hasBlockTypes = (content: string, blockTypes: string[]): boolean => {
  if (!content) return false;
  
  try {
    const parsed: EditorJsContent = JSON.parse(content);
    
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks.some((block: EditorJsBlock) => 
        blockTypes.includes(block.type)
      );
    }
    
    return false;
  } catch (error) {
    console.error('Error checking block types:', error);
    return false;
  }
};