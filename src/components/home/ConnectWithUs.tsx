import React from 'react';

const ConnectWithUs = () => {
  return (
    <section className='bg-orange-50 py-12'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-2xl font-bold text-center mb-8'>Connect with us</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1' htmlFor='select-university'>
                Select University
              </label>
              <select
                id='select-university'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              >
                <option>Choose University</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1' htmlFor='university-name'>
                University Name
              </label>
              <input
                type='text'
                id='university-name'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1' htmlFor='phone-number'>
                Phone Number
              </label>
              <input
                type='tel'
                id='phone-number'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:focus:border-orange-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1' htmlFor='email'>
                Email
              </label>
              <input
                type='email'
                id='email'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:focus:border-orange-500'
              />
            </div>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1' htmlFor='representative-name'>
                Representative Name
              </label>
              <input
                type='text'
                id='representative-name'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1' htmlFor='your-message'>
                Your message
              </label>
              <textarea
                id='your-message'
                className='w-full p-2 border rounded-md h-32 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              ></textarea>
            </div>
            <button className='w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors'>
              Send message
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectWithUs;
