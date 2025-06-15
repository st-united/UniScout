import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=16.051297506653487, 108.24315289757041&zoom=15`;

  return (
    <footer className='bg-[#2A3990] text-white py-12'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8'>
          <div>
            <h3 className='text-2xl font-bold text-orange-500 mb-4'>DEV PLUS</h3>
            <p className='text-sm opacity-80 mb-4'>
              Dev Plus is a platform designed to help connect global universities with potential
              students, offering comprehensive information about educational programs worldwide.
            </p>
            <div className='flex space-x-4'>
              <div className='hover:text-orange-500 transition-colors'>
                <span className='sr-only'>LinkedIn</span>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
                </svg>
              </div>
              <div className='hover:text-orange-500 transition-colors'>
                <span className='sr-only'>Facebook</span>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z' />
                </svg>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-row justify-between'>
              <div>
                <h4 className='font-bold mb-4 text-white'>DEVPLUS ACTIVITIES</h4>
                <ul className='space-y-2'>
                  <li>
                    <span className='hover:text-orange-500 transition-colors'>Overview</span>
                  </li>
                  <li>
                    <span className='hover:text-orange-500 transition-colors'>Events</span>
                  </li>
                  <li>
                    <span className='hover:text-orange-500 transition-colors'>Documentation</span>
                  </li>
                  <li>
                    <span className='hover:text-orange-500 transition-colors'>
                      For universities
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className='font-bold mb-4 text-white'>CONTACT</h4>
                <ul className='space-y-4'>
                  <li className='flex items-center'>
                    <MapPin className='w-5 h-5 mr-2 flex-shrink-0' />
                    <span>123 Example St, City, Country</span>
                  </li>
                  <li className='flex items-center'>
                    <Phone className='w-5 h-5 mr-2 flex-shrink-0' />
                    <span>+1 234 567 890</span>
                  </li>
                  <li className='flex items-center'>
                    <Mail className='w-5 h-5 mr-2 flex-shrink-0' />
                    <span>contact@devplus.edu</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className='w-full h-64 bg-gray-100 rounded-lg overflow-hidden'>
              <iframe
                src={googleMapsUrl}
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title={`DevPlus Location`}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
