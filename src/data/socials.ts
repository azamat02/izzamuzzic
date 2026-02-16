import { FaSpotify, FaYoutube, FaInstagram, FaSoundcloud, FaTelegram } from 'react-icons/fa';
import type { IconType } from 'react-icons';

export interface Social {
  name: string;
  url: string;
  icon: IconType;
}

export const socials: Social[] = [
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/artist/5EiDVD35ofoSKq1KE0jcs8',
    icon: FaSpotify,
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@izzamuzzic',
    icon: FaYoutube,
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/izzamuzzic',
    icon: FaInstagram,
  },
  {
    name: 'SoundCloud',
    url: 'https://soundcloud.com/izzamuzzic',
    icon: FaSoundcloud,
  },
  {
    name: 'Telegram',
    url: 'https://t.me/izzzzzzzzzzzzzzza',
    icon: FaTelegram,
  },
];
