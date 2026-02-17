import {
  FaSpotify,
  FaYoutube,
  FaInstagram,
  FaSoundcloud,
  FaTelegram,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaApple,
  FaBandcamp,
  FaDeezer,
  FaYandex,
  FaGlobe,
} from 'react-icons/fa';
import { SiTidal, SiApplemusic } from 'react-icons/si';
import type { IconType } from 'react-icons';

export const iconMap: Record<string, IconType> = {
  FaSpotify,
  FaYoutube,
  FaInstagram,
  FaSoundcloud,
  FaTelegram,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaApple,
  FaBandcamp,
  FaDeezer,
  FaYandex,
  FaGlobe,
  SiTidal,
  SiApplemusic,
};

export function getIcon(key: string): IconType {
  return iconMap[key] || FaGlobe;
}

export const platformOptions = [
  { key: 'FaSpotify', label: 'Spotify' },
  { key: 'FaYoutube', label: 'YouTube' },
  { key: 'SiApplemusic', label: 'Apple Music' },
  { key: 'FaSoundcloud', label: 'SoundCloud' },
  { key: 'FaDeezer', label: 'Deezer' },
  { key: 'SiTidal', label: 'Tidal' },
  { key: 'FaBandcamp', label: 'Bandcamp' },
  { key: 'FaYandex', label: 'Yandex Music' },
  { key: 'FaGlobe', label: 'Other' },
];
