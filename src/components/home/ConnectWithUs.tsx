import React, { useEffect, useState } from 'react';

const ConnectWithUs = () => {
  const [selectedUniversity, setSelectedUniversity] = useState(1);

  useEffect(() => {
    console.log(selectedUniversity);
  }, [selectedUniversity]);

  function onClickFunction() {
    setSelectedUniversity(selectedUniversity + 1);
  }

  // console.log(selectedUniversity, '1')

  // setSelectedUniversity("hello 1234")

  // console.log(selectedUniversity, '2')
  return (
    <section className='bg-orange-50 py-12'>
      <button onClick={onClickFunction}>On CLick</button>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-2xl font-bold text-center mb-8'>Connect with us</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Select University</label>
              <select className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'>
                <option>Choose University</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>University Name</label>
              <input
                type='text'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Phone Number</label>
              <input
                type='tel'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Email</label>
              <input
                type='email'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              />
            </div>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Representative Name</label>
              <input
                type='text'
                className='w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Your message</label>
              <textarea className='w-full p-2 border rounded-md h-32 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'></textarea>
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
