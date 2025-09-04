// UniversityDetail.tsx
import { BookOutlined } from '@ant-design/icons';
import { Spin, ConfigProvider } from 'antd';
import { ArrowLeft, MapPin, Users, Building2, Contact, Star, Image } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import SubjectsModal from './Subjectsmodal';
import { type FieldConfig } from '../../../constants/universityDetail';
import { useUniversityDetail, type University } from '../../../hooks/universityDetail';
import { toStudentSize } from '../../../utils/universityDetail';

/* Centered stat card */
const StatCard = ({
  icon,
  label,
  value,
  subtext,
}: {
  icon: JSX.Element;
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
}) => (
  <article
    className='relative rounded-xl p-6 text-white flex items-center justify-center'
    style={{ background: 'rgb(251 146 60 / var(--tw-bg-opacity, 1))' }}
  >
    <div className='flex flex-col items-center justify-center text-center gap-2'>
      <div className='flex items-center gap-2 text-white/90 text-[11px] font-semibold uppercase tracking-[.08em]'>
        {icon}
        <span className='leading-none text-sm'>{label}</span>
      </div>

      <div className='text-2xl font-bold leading-none tabular-nums'>{value}</div>

      {subtext ? (
        <span className='px-2 py-0.5 text-[11px] whitespace-nowrap'>{subtext}</span>
      ) : null}
    </div>

    <div
      className='pointer-events-none absolute inset-0 rounded-2xl'
      style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,.25)' }}
    />
  </article>
);

const UniversityDetail: React.FC = () => {
  const { university, mappedFields, readyFields } = useUniversityDetail() as {
    university: University | null;
    mappedFields: FieldConfig[];
    readyFields: string[];
  };
  const [logoError, setLogoError] = useState(false);
  const studentSize = useMemo(
    () => toStudentSize(university?.studentPopulation),
    [university?.studentPopulation],
  );
  const mapSrc = useMemo(
    () =>
      `https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${university?.latitude},${university?.longitude}&zoom=15`,
    [university?.latitude, university?.longitude],
  );

  const [selectedField, setSelectedField] = useState<FieldConfig | null>(null);
  const [open, setOpen] = useState(false);
  const openField = useCallback((config: FieldConfig) => {
    setSelectedField(config);
    setOpen(true);
  }, []);

  if (!university) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: '#FF6600' } }}>
        <div className='p-8 h-screen'>
          <Spin size='large' className='absolute left-1/2 top-[calc(50%-10vh)] -translate-x-1/2' />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <div className='min-h-screen w-full px-4 py-6' style={{ background: '#F4F4F8' }}>
      <div className='mx-auto max-w-7xl'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 text-[#595858] font-[500] hover:text-gray-600 mb-4 relative top-1 text-lg'
        >
          <ArrowLeft className='w-5 h-5' /> Home
        </Link>

        {/* Top row */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
          {/* About */}
          <div
            className='rounded-xl shadow-sm p-6 lg:col-span-2 relative flex items-center pb-16 bg-white'
            style={{ minHeight: 180 }}
          >
            <div className='w-full'>
              <div className='flex items-start gap-4'>
                {university.logo && !logoError ? (
                  <img
                    src={university.logo}
                    alt={`${university.university} logo`}
                    className='rounded-lg object-contain bg-white p-1'
                    style={{ width: 100, height: 100 }}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div
                    className='rounded-lg bg-blue-50 flex items-center justify-center p-1'
                    style={{ width: 100, height: 100 }}
                    aria-label='Logo indisponible'
                    role='img'
                  >
                    <Image className='w-10 h-10 text-blue-900 stroke-2' />
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <h1 className='mt-2 text-3xl md:text-4xl font-bold text-blue-900 leading-tight'>
                    About {university.university}
                    {university.abbreviation && ` (${university.abbreviation})`}
                  </h1>

                  <div className='mt-3'>
                    <span
                      className='inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'
                      style={{
                        border: '1px solid #FED7AA',
                        background: '#FFF7ED',
                        color: '#F97316',
                      }}
                    >
                      <MapPin className='w-3.5 h-3.5' />
                      {university.country && university.location
                        ? `${university.country}, ${university.location}`
                        : university.country || university.location}
                    </span>
                  </div>

                  <p className='mt-4 leading-relaxed' style={{ color: '#787878', fontSize: 14 }}>
                    {university.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className='rounded-xl shadow-sm p-5 lg:justify-self-end grid-cols-1 w-full bg-white'>
            <div
              className='w-full h-full rounded-xl overflow-hidden'
              style={{ background: '#F3F4F6', boxShadow: 'inset 0 0 0 1px #EAEAEA' }}
            >
              <iframe
                src={mapSrc}
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='University Location'
              />
            </div>
          </div>
        </div>

        {/* Stats (centered) */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6'>
          <StatCard
            icon={<Star className='w-4 h-4' />}
            label='Ranking'
            value={university.rank ?? 'N/A'}
          />
          <StatCard
            icon={<Users className='w-4 h-4' />}
            label='Size'
            value={studentSize.size}
            subtext={`${studentSize.population} students`}
          />
          <StatCard
            icon={<Building2 className='w-4 h-4' />}
            label='Type'
            value={
              university.type
                ? university.type[0].toUpperCase() + university.type.slice(1).toLowerCase()
                : 'N/A'
            }
          />
        </div>

        {/* Broad Fields */}
        <div className='rounded-xl shadow-sm p-6 mb-6 bg-white'>
          <div className='inline-flex items-center gap-2 mb-6'>
            <BookOutlined className='text-blue-900 text-[18px]' />
            <h3 className='text-lg font-semibold text-blue-900 leading-none'>Broad Fields</h3>
          </div>

          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            {mappedFields
              .filter((cfg) => readyFields.includes(cfg.apiFieldName))
              .map((config, i) => {
                const hasSubjects = readyFields.includes(config.apiFieldName);
                const open = () => openField(config);

                return (
                  <div
                    key={`${config.apiFieldName}-${i}`}
                    role={hasSubjects ? 'button' : undefined}
                    tabIndex={hasSubjects ? 0 : -1}
                    onClick={hasSubjects ? open : undefined}
                    onKeyDown={
                      hasSubjects
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              open();
                            }
                          }
                        : undefined
                    }
                    aria-disabled={!hasSubjects}
                    aria-hidden={!hasSubjects}
                    className={`text-center p-4 rounded-xl transition-all shadow-sm h-28 flex flex-col justify-center ${
                      hasSubjects
                        ? 'group cursor-pointer'
                        : 'opacity-60 pointer-events-none select-none'
                    }`}
                    style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
                  >
                    <div className='text-3xl mb-2 transform transition-transform duration-200 group-hover:scale-110'>
                      {config.icon}
                    </div>
                    <h4 className='font-medium text-sm leading-tight text-blue-900 transition-colors duration-200 group-hover:text-[#FF842B]'>
                      {config.name}
                    </h4>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Contact */}
        <div className='rounded-xl shadow-sm p-6 bg-white'>
          <div className='inline-flex items-center gap-2 mb-4'>
            <Contact className='w-5 h-5 text-blue-900' />
            <h3 className='text-lg font-semibold text-blue-900 leading-none'>Contact</h3>
          </div>
          <div className='flex justify-between flex-wrap gap-6 pl-[38px]'>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <span className='text-sm font-bold text-blue-900'>Website:</span>
              <a
                href={university.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-900 hover:text-blue-300 text-sm break-all'
              >
                {university.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <span className='text-sm font-bold text-blue-900'>Email:</span>
              <a
                href={`mailto:${university.email}`}
                className='text-blue-900 hover:text-blue-300 text-sm'
              >
                {university.email}
              </a>
            </div>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <span className='text-sm font-bold text-blue-900'>Phone:</span>
              <a
                href={`tel:${university.contact}`}
                className='text-blue-900 hover:text-blue-300 text-sm'
              >
                {university.contact}
              </a>
            </div>
          </div>
        </div>

        {selectedField && (
          <SubjectsModal
            field={selectedField}
            open={open}
            onClose={() => setOpen(false)}
            universitySubjects={university.subjectsList || ''}
          />
        )}
      </div>
    </div>
  );
};

export default UniversityDetail;
