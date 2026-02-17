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
  FaGlobe,
} from 'react-icons/fa';
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
  FaGlobe,
};

export function getIcon(key: string): IconType {
  return iconMap[key] || FaGlobe;
}
