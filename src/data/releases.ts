export interface Release {
  id: string;
  title: string;
  type: 'single' | 'ep' | 'album';
  year: number;
  cover: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

export const releases: Release[] = [
  {
    id: '1',
    title: 'Latest Release',
    type: 'single',
    year: 2024,
    cover: 'https://placehold.co/300x300/141414/e63946?text=Release+1',
    spotifyUrl: '#',
    youtubeUrl: '#',
  },
  {
    id: '2',
    title: 'Second Track',
    type: 'single',
    year: 2024,
    cover: 'https://placehold.co/300x300/141414/e63946?text=Release+2',
    spotifyUrl: '#',
    youtubeUrl: '#',
  },
  {
    id: '3',
    title: 'Third Track',
    type: 'ep',
    year: 2023,
    cover: 'https://placehold.co/300x300/141414/e63946?text=Release+3',
    spotifyUrl: '#',
    youtubeUrl: '#',
  },
  {
    id: '4',
    title: 'Fourth Track',
    type: 'album',
    year: 2023,
    cover: 'https://placehold.co/300x300/141414/e63946?text=Release+4',
    spotifyUrl: '#',
    youtubeUrl: '#',
  },
];

export const spotifyEmbedUrl = 'https://open.spotify.com/embed/artist/5EiDVD35ofoSKq1KE0jcs8?utm_source=generator&theme=0';
