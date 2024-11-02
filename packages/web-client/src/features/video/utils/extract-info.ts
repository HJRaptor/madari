export interface StreamMetadata {
  url: string;
  name: string;
  description: string;
  behaviorHints: {
    bingeGroup: string;
    filename: string;
  };
}

export interface ParsedStreamingData {
  metadata: StreamMetadata;
  decodedUrl: string;
  quality: {
    resolution: string;
    format: string;
    codec: string;
    size: string;
  };
  media: {
    title: string;
    year: string;
    releaseGroup: string;
  };
  manifestUrl: string | null;
  imdbId: string | null;
}

export class StreamingUrlParser {
  private static extractJSON(input: string): string {
    // Find the first '{' character
    const jsonStart = input.indexOf('{');
    if (jsonStart === -1) throw new Error('No JSON object found in string');

    // Find the matching closing brace
    let braceCount = 1;
    let jsonEnd = jsonStart + 1;

    while (braceCount > 0 && jsonEnd < input.length) {
      if (input[jsonEnd] === '{') braceCount++;
      if (input[jsonEnd] === '}') braceCount--;
      jsonEnd++;
    }

    return input.slice(jsonStart, jsonEnd);
  }

  public static parse(encodedUrl: string): ParsedStreamingData {
    try {
      // First decode the URL encoding
      const urlDecoded = decodeURIComponent(encodedUrl);

      // Convert from base64
      const rawDecoded = atob(urlDecoded);

      // Extract the JSON part
      const jsonString = this.extractJSON(rawDecoded);

      // Parse the JSON
      const metadata: StreamMetadata = JSON.parse(jsonString);

      // Parse filename parts
      const filename = metadata.behaviorHints.filename;
      const parts = filename.split('.');

      // Extract quality information
      const quality = {
        resolution: parts.find((p) => p.includes('p')) || 'unknown',
        format:
          parts.find((p) => p.includes('WEB') || p.includes('Rip')) ||
          'unknown',
        codec:
          parts.find((p) => p.includes('x264') || p.includes('x265')) ||
          'unknown',
        size: parts.find((p) => p.includes('MB')) || 'unknown',
      };

      // Extract media information
      const media = {
        title: parts[0],
        year: parts.find((p) => /^\d{4}$/.test(p)) || 'unknown',
        releaseGroup:
          filename.split('-').pop()?.replace('.mkv', '') || 'unknown',
      };

      // Extract manifest URL and IMDB ID
      const urlParts = encodedUrl.split('/');
      const manifestUrl =
        urlParts.length > 1 ? decodeURIComponent(urlParts[1]) : null;
      const imdbId =
        urlParts.find((part) => part.includes('tt'))?.match(/tt\d+/)?.[0] ||
        null;

      return {
        metadata,
        decodedUrl: metadata.url,
        quality,
        media,
        manifestUrl,
        imdbId,
      };
    } catch (error) {
      console.error('Parsing error:', error);
      throw error;
    }
  }
}

// Safe wrapper function
export const safeParse = (url: string): ParsedStreamingData | null => {
  try {
    return StreamingUrlParser.parse(url);
  } catch (error) {
    console.error('Failed to parse streaming URL:', error);
    return null;
  }
};

// Example usage:
/*
const result = safeParse(encodedUrl);
if (result) {
  console.log('Title:', result.media.title);
  console.log('Quality:', result.quality.resolution);
  console.log('URL:', result.decodedUrl);
}
*/
