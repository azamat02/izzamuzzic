export interface MerchItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  url?: string;
}

export const merchItems: MerchItem[] = [
  {
    id: '1',
    name: 'Classic T-Shirt Black',
    price: 35,
    currency: 'USD',
    image: 'https://placehold.co/300x300/141414/ffffff?text=T-Shirt',
    url: '#',
  },
  {
    id: '2',
    name: 'Hoodie Limited Edition',
    price: 75,
    currency: 'USD',
    image: 'https://placehold.co/300x300/141414/ffffff?text=Hoodie',
    url: '#',
  },
  {
    id: '3',
    name: 'Vinyl LP',
    price: 45,
    currency: 'USD',
    image: 'https://placehold.co/300x300/141414/e63946?text=Vinyl',
    url: '#',
  },
  {
    id: '4',
    name: 'Poster Collection',
    price: 25,
    currency: 'USD',
    image: 'https://placehold.co/300x300/141414/ffffff?text=Poster',
    url: '#',
  },
];
