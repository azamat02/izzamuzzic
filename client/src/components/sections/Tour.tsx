import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { Button } from '../ui/Button';
import { usePublicData } from '../../hooks/useApi';

interface TourDate {
  id: number;
  date: string;
  city: string;
  venue: string;
  country: string;
  ticketUrl: string | null;
  soldOut: boolean;
}

export function Tour() {
  const { data: tours } = usePublicData<TourDate[]>('tours', '/tours');
  const { data: settings } = usePublicData<Record<string, string>>('settings', '/settings');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  return (
    <section id="tour" className="py-24 bg-[#0a0a0a] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="TOUR"
          subtitle={settings?.tourSubtitle || 'Upcoming shows and events'}
        />

        <div className="space-y-4">
          {(tours || []).map((tour, index) => {
            const date = formatDate(tour.date);
            return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#141414] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1a1a1a] transition-colors duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[80px]">
                    <p className="text-4xl text-[--color-accent]" style={{ fontFamily: 'var(--font-heading)' }}>{date.day}</p>
                    <p className="text-[#a0a0a0] text-sm">{date.month} {date.year}</p>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-medium">{tour.city}, {tour.country}</h3>
                    <p className="text-[#a0a0a0]">{tour.venue}</p>
                  </div>
                </div>
                <div>
                  {tour.soldOut ? (
                    <span className="inline-block px-6 py-3 bg-[#1a1a1a] text-[#a0a0a0] font-medium rounded-lg uppercase text-sm">Sold Out</span>
                  ) : (
                    <Button href={tour.ticketUrl || '#'} variant="outline" size="sm">Get Tickets</Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {tours && tours.length === 0 && (
          <p className="text-center text-[#a0a0a0] text-lg">No upcoming shows at the moment. Check back soon!</p>
        )}
      </div>
    </section>
  );
}
