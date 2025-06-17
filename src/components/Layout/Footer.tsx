import { MapPin, Phone, Mail } from 'lucide-react';

import { devplus } from '@app/assets/images';

const Footer = () => {
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=16.051297506653487, 108.24315289757041&zoom=15`;

  return (
    <footer className='bg-[#2A3990] text-white py-12'>
      <div className='max-w-7xl mx-auto px-4'>
        <div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-20
        '
        >
          <div>
            <h3 className='text-2xl font-bold text-orange-500 mb-4'>
              <img src={devplus} alt='DEV PLUS Logo' className='h-24 inline-block mr-2' />
            </h3>
            <p className='text-sm text-[#DADADA] mb-4 md:pr-10'>
              Dev Plus is a Sandbox Bootcamp with a variety of online and offline programs aimed at
              enhancing practical skills with the #Ready-To-Work model. With the goal of improving
              the quality of IT human resources, helping students after graduation meet the
              immediate requirements of businesses and gain the practical experience necessary to
              hit the ground running in your IT career.
            </p>
            <div className='flex space-x-4'>
              <a
                href='https://www.linkedin.com/company/devplusprogramme/'
                target='_blank'
                rel='noopener noreferrer'
                className='transition-colors hover:text-orange-500'
              >
                <div className='hover:text-orange-500 transition-colors'>
                  <span className='sr-only'>LinkedIn</span>
                  <div className='relative flex items-center justify-center w-10 h-10 bg-white rounded-full group'>
                    <svg
                      className='w-6 h-6 absolute fill-[#2d57b0] group-hover:fill-orange-500 transition-colors'
                      viewBox='0 0 24 24'
                    >
                      <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
                    </svg>
                  </div>
                </div>
              </a>
              <a
                href='https://www.facebook.com/Devplusprogramme/'
                target='_blank'
                rel='noopener noreferrer'
                className='transition-colors hover:text-orange-500'
              >
                <div className='hover:text-orange-500 transition-colors'>
                  <span className='sr-only'>Facebook</span>
                  <div className='relative flex items-center justify-center w-10 h-10 bg-white rounded-full group'>
                    <svg
                      className='w-6 h-6 absolute fill-[#2A3990] group-hover:fill-orange-500 transition-colors'
                      viewBox='0 0 24 24'
                    >
                      <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z' />
                    </svg>
                  </div>
                </div>
              </a>
              <a
                href='https://www.tiktok.com/@devplus.edu'
                target='_blank'
                rel='noopener noreferrer'
                className='transition-colors hover:text-orange-500'
              >
                <div className='hover:text-orange-500 transition-colors'>
                  <span className='sr-only'>Tiktok</span>
                  <div className='relative flex items-center justify-center w-10 h-10 bg-white rounded-full group'>
                    <svg
                      className='w-6 h-6 absolute] group-hover:fill-orange-500 transition-colors'
                      viewBox='0 0 24 24'
                    >
                      <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
          <div className='flex flex-col gap-4 w-full'>
            <div className='flex w-full'>
              <div>
                <h4 className='font-bold mb-4 text-white'>DEVPLUS ACTIVITIES</h4>
                <ul className='space-y-2 list-none pr-10'>
                  <li>
                    <a
                      href='https://devplus.edu.vn/#devplus-activities'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#DADADA] hover:text-orange-500 text-base'
                    >
                      Workshops
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://devplus.edu.vn/#devplus-activities'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#DADADA] hover:text-orange-500 text-base'
                    >
                      Events
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://devplus.edu.vn/#devplus-activities'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#DADADA] hover:text-orange-500 text-base'
                    >
                      Communities
                    </a>
                  </li>
                  <li>
                    <a
                      href='https://devplus.edu.vn/#devplus-activities'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#DADADA] hover:text-orange-500 text-base'
                    >
                      Extracurricular
                    </a>
                  </li>
                </ul>
              </div>
              <div className='class="ml-16 md:ml-20'>
                <h4 className='font-bold mb-4 text-white'>CONTACT</h4>
                <ul className='space-y-4'>
                  <li className='flex items-center'>
                    <Phone className='w-5 h-5 mr-2 flex-shrink-0' />
                    <span className='text-[#DADADA]'>(+84) 368492885</span>
                  </li>
                  <li className='flex items-center'>
                    <Mail className='w-5 h-5 mr-2 flex-shrink-0' />
                    <span className='text-[#DADADA]'>hello@devplus.edu.vn</span>
                  </li>
                  <li className='flex items-center'>
                    <MapPin className='w-5 h-5 mr-2 flex-shrink-0' />
                    <span className='text-[#DADADA]'>
                      112-118 Mai Thuc Lan, My An Ngu Hanh Son, Da Nang
                    </span>
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
