import React, { useState } from 'react';
import { Button } from './Button';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onPinSubmit: (pin: string) => void;
  pinLength?: number;
}

export const PinPad: React.FC<PinPadProps> = ({ onPinSubmit, pinLength = 4 }) => {
  const [pin, setPin] = useState<string>('');

  const handleNumberClick = (num: number) => {
    if (pin.length < pinLength) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === pinLength) {
        onPinSubmit(newPin);
        // Optional: clear pin after submit or wait for parent
        setTimeout(() => setPin(''), 500); 
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="flex flex-col items-center max-w-xs mx-auto">
      {/* PIN Display */}
      <div className="flex gap-4 mb-8">
        {Array.from({ length: pinLength }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < pin.length ? 'bg-blue-500 border-blue-500' : 'border-gray-500 bg-transparent'
            } transition-colors duration-200`}
          />
        ))}
      </div>

      {/* Number Pad Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            className="h-16 text-2xl font-semibold rounded-2xl active:scale-95 transition-transform"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </Button>
        ))}
        
        <Button
          variant="outline"
          className="h-16 text-lg font-semibold rounded-2xl text-red-400 border-red-500/30 hover:bg-red-500/10 active:scale-95 transition-transform"
          onClick={handleClear}
        >
          Clear
        </Button>
        
        <Button
          variant="outline"
          className="h-16 text-2xl font-semibold rounded-2xl active:scale-95 transition-transform"
          onClick={() => handleNumberClick(0)}
        >
          0
        </Button>
        
        <Button
          variant="outline"
          className="h-16 text-2xl font-semibold rounded-2xl flex items-center justify-center text-gray-400 active:scale-95 transition-transform"
          onClick={handleDelete}
        >
          <Delete size={28} />
        </Button>
      </div>
    </div>
  );
};
