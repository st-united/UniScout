import { Circle as CircleNotch } from 'lucide-react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const Loading = ({ size = 'medium', fullScreen = false }: LoadingProps) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64
  };

  const iconSize = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center">
      <CircleNotch size={iconSize} className="animate-spin text-primary" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;