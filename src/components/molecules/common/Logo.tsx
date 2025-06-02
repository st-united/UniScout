import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark';
}

const Logo = ({ variant = 'dark' }: LogoProps) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-primary';
  
  return (
    <Link to="/" className="flex items-center">
      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
        <GraduationCap size={24} />
      </div>
      <div className={`ml-2 font-bold text-xl ${textColor}`}>
        <span>UNI</span>
        <span className="ml-1 text-accent">SCOUT</span>
      </div>
    </Link>
  );
};

export default Logo;