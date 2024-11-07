// Custom error types for better error handling
class RealDebridError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: never,
  ) {
    super(message);
    this.name = 'RealDebridError';
  }
}

interface RealDebridFile {
  filename: string;
  id: string;
}

export interface AudioStreamInfo {
  id: string;
  stream: string;
  lang: string;
  lang_iso: string;
  codec: string;
}

export interface SubtitlesInfo {
  id: string;
  stream: string;
  lang: string;
  lang_iso: string;
  type: string;
}

export async function getStreamUrl(
  apiToken: string,
  url: string,
  _options = {
    maxRetries: 3,
    retryDelay: 1000,
    limit: 100,
    pageSize: 100,
  },
): Promise<{
  audios: AudioStreamInfo[];
  subtitles: SubtitlesInfo[];
  formats: Record<string, string>;
  qualities: Record<string, string>;
  url: string;
} | null> {
  if (!url || !apiToken) {
    throw new RealDebridError('URL and API token are required');
  }

  await fetch(url, {
    method: 'HEAD',
  }).catch((_e: unknown) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log('ignoring ' + _e);
  });

  const fileName = decodeURIComponent(url.split('/').at(-1) || '');
  if (!fileName) {
    throw new RealDebridError('Invalid URL format - cannot extract filename');
  }

  // Helper function for making API requests with retries
  async function makeRequest<T>(
    url: string,
    options: RequestInit,
    retries = 0,
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Get total count from headers for pagination
      const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorBody = await response.json().catch(() => ({}));
        throw new RealDebridError(
          `API request failed: ${response.statusText}`,
          response.status,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          errorBody,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { data, totalCount } as T;
    } catch (error) {
      if (retries < _options.maxRetries && error instanceof Error) {
        // Exponential backoff
        const delay = _options.retryDelay * Math.pow(2, retries);
        console.log(
          `Retrying request after ${delay}ms (${retries + 1}/${_options.maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return makeRequest(url, options, retries + 1);
      }
      throw error;
    }
  }

  // Search for file in downloads
  async function findFileId(): Promise<string | null> {
    let page = 1;
    let matchingId = null;

    while (true) {
      try {
        const { data: files, totalCount } = await makeRequest<{
          data: RealDebridFile[];
          totalCount: number;
        }>(
          `https://api.real-debrid.com/rest/1.0/downloads?page=${page}&limit=${_options.pageSize}`,
          { method: 'GET' },
        );

        const match = files.find((file) => file.filename === fileName);
        if (match) {
          matchingId = match.id;
          break;
        }

        // Check if we've reached the end of the results
        if (
          files.length < _options.pageSize ||
          page * _options.pageSize >= totalCount
        ) {
          break;
        }

        page++;
      } catch (error) {
        if (error instanceof RealDebridError) {
          throw error;
        }
        throw new RealDebridError('Failed to search downloads', undefined);
      }
    }

    return matchingId;
  }

  try {
    // Find the file ID
    const fileId = await findFileId();
    if (!fileId) {
      return null;
    }

    const [meta] = await Promise.all([
      makeRequest<{
        data: {
          modelUrl: string;
          availableFormats: Record<string, string>;
          availableQualities: Record<string, string>;
          details: {
            audio: Record<
              string,
              {
                stream: string;
                lang: string;
                lang_iso: string;
                codec: string;
                sampling: number;
                channels: number;
              }
            >;
            subtitles: Record<
              string,
              {
                stream: string;
                lang: string;
                lang_iso: string;
                type: string;
              }
            >;
          };
        };
      }>(
        `https://api.real-debrid.com/rest/1.0/streaming/mediaInfos/${fileId}`,
        { method: 'GET' },
      ),
    ]);

    return {
      audios: Object.entries(meta.data.details?.audio ?? {}).map(
        ([id, audio]) => {
          return {
            id,
            stream: audio.stream,
            codec: audio.codec,
            lang: audio.lang,
            lang_iso: audio.lang_iso,
          };
        },
      ),
      formats: meta.data.availableFormats,
      qualities: meta.data.availableQualities,
      url: meta.data.modelUrl,
      subtitles: Object.entries(meta.data.details?.subtitles ?? {}).map(
        ([id, item]) => ({
          id,
          stream: item.stream,
          lang_iso: item.lang_iso,
          lang: item.lang,
          type: item.type,
        }),
      ),
    };
  } catch (error) {
    console.log(error);
    if (error instanceof RealDebridError) {
      throw error;
    }
    throw new RealDebridError('Failed to get streaming URL', undefined);
  }
}
