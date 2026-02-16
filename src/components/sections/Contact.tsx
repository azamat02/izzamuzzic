import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { FaEnvelope } from 'react-icons/fa';

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-[#0a0a0a] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="CONTACT"
          subtitle="Get in touch"
        />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Booking Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-white text-xl font-medium mb-4 flex items-center gap-2">
                <FaEnvelope className="text-[#e63946]" />
                Booking Inquiries
              </h3>
              <a
                href="mailto:izzamuzzic.mgmt@gmail.com"
                className="text-[#a0a0a0] hover:text-[#e63946] transition-colors text-lg"
              >
                izzamuzzic.mgmt@gmail.com
              </a>
            </div>

            <div>
              <h3 className="text-white text-xl font-medium mb-4 flex items-center gap-2">
                <FaEnvelope className="text-[#e63946]" />
                Management
              </h3>
              <a
                href="mailto:izzamuzzic.mgmt@gmail.com"
                className="text-[#a0a0a0] hover:text-[#e63946] transition-colors text-lg"
              >
                izzamuzzic.mgmt@gmail.com
              </a>
            </div>

            <div>
              <h3 className="text-white text-xl font-medium mb-4 flex items-center gap-2">
                <FaEnvelope className="text-[#e63946]" />
                Press & Media
              </h3>
              <a
                href="mailto:izzamuzzic.mgmt@gmail.com"
                className="text-[#a0a0a0] hover:text-[#e63946] transition-colors text-lg"
              >
                izzamuzzic.mgmt@gmail.com
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-[#a0a0a0] text-sm mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#a0a0a0] text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e63946] transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#a0a0a0] text-sm mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e63946] transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#e63946] text-white py-3 rounded-lg font-medium hover:bg-[#ff6b6b] transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
