export interface PressItem {
  id: string;
  source: string;
  quote: string;
  url?: string;
}

export const pressItems: PressItem[] = [
  {
    id: '1',
    source: 'Music Magazine',
    quote: '"IZZAMUZZIC delivers a unique blend of electronic music that captivates listeners from the first note."',
    url: '#',
  },
  {
    id: '2',
    source: 'Electronic Beats',
    quote: '"One of the most exciting artists to emerge from the electronic music scene in recent years."',
    url: '#',
  },
  {
    id: '3',
    source: 'DJ Mag',
    quote: '"A masterful producer with an unmistakable sound signature."',
    url: '#',
  },
];
