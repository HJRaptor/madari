export interface AddonResource {
  name: string;
  types: string[];
  idPrefixes: string[];
}

export interface AddonConfig {
  id: string;
  version: string;
  name: string;
  description: string;
  resources: string[] | AddonResource[];
  logo?: string;
  background?: string;
  types: string[];
  idPrefixes: string[];
  catalogs: AddonCatalog[];
  url: string;
}

export interface AddonCatalog {
  type: string;
  id: string;
  genres: string[];
  extra: {
    name: string;
    options: string[];
  }[];
  extraSupported: string[];
  name: string;
}

export interface FetchAddonsParams {
  queryKey: [string, string]; // ['data', addonId]
}

export const fetchAddons = async (url: string): Promise<AddonConfig> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      ...(await response.json()),
      url: url.substring(0, url.length - 14),
    } as unknown as AddonConfig;
  } catch (error) {
    console.error(`Failed to fetch addon ${url}:`, error);
    throw error;
  }
};
