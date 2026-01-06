export interface TourDate {
  id: string;
  date: string;
  city: string;
  venue: string;
  country: string;
  ticketUrl?: string;
  soldOut?: boolean;
}

export const tourDates: TourDate[] = [
  {
    id: '1',
    date: '2026-02-15',
    city: 'Moscow',
    venue: 'Adrenaline Stadium',
    country: 'Russia',
    ticketUrl: '#',
  },
  {
    id: '2',
    date: '2026-02-22',
    city: 'Saint Petersburg',
    venue: 'A2 Green Concert',
    country: 'Russia',
    ticketUrl: '#',
  },
  {
    id: '3',
    date: '2026-03-01',
    city: 'Almaty',
    venue: 'Almaty Arena',
    country: 'Kazakhstan',
    ticketUrl: '#',
  },
  {
    id: '4',
    date: '2026-03-08',
    city: 'Dubai',
    venue: 'Dubai Opera',
    country: 'UAE',
    ticketUrl: '#',
    soldOut: true,
  },
];
