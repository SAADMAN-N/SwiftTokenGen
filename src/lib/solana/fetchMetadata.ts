export async function fetchTokenMetadata(uri: string) {
  try {
    console.log('Fetching metadata from:', uri);
    
    // Add CORS proxy if needed
    const proxyUrl = uri.startsWith('https://') 
      ? uri 
      : `https://cors-anywhere.herokuapp.com/${uri}`;

    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();
    console.log('Fetched metadata:', metadata);

    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
}