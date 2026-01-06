import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { Button } from '../ui/Button';
import { tourDates } from '../../data/tours';

export function Tour() {
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
          subtitle="Upcoming shows and events"
        />

        <div className="space-y-4">
          {tourDates.map((tour, index) => {
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
                {/* Date */}
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[80px]">
                    <p className="text-4xl text-[#e63946]" style={{ fontFamily: 'var(--font-heading)' }}>{date.day}</p>
                    <p className="text-[#a0a0a0] text-sm">{date.month} {date.year}</p>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-white text-xl font-medium">
                      {tour.city}, {tour.country}
                    </h3>
                    <p className="text-[#a0a0a0]">{tour.venue}</p>
                  </div>
                </div>

                {/* Ticket Button */}
                <div>
                  {tour.soldOut ? (
                    <span className="inline-block px-6 py-3 bg-[#1a1a1a] text-[#a0a0a0] font-medium rounded-lg uppercase text-sm">
                      Sold Out
                    </span>
                  ) : (
                    <Button href={tour.ticketUrl} variant="outline" size="sm">
                      Get Tickets
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {tourDates.length === 0 && (
          <p className="text-center text-[#a0a0a0] text-lg">
            No upcoming shows at the moment. Check back soon!
          </p>
        )}
      </div>
    </section>
  );
}
