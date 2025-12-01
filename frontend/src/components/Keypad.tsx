interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}

export function Keypad({ value, onChange, maxLength }: KeypadProps) {
  const handleKeyPress = (key: string) => {
    if (key === 'clear') {
      onChange('');
    } else if (key === 'back') {
      onChange(value.slice(0, -1));
    } else if (value.length < maxLength) {
      onChange(value + key);
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'back'],
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
      {keys.flat().map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKeyPress(key)}
          className={`
            h-16 rounded-lg text-xl font-semibold transition-all duration-150
            ${key === 'clear'
              ? 'bg-[--color-gray-200] text-[--color-gray-700] hover:bg-[--color-gray-300] active:bg-[--color-gray-300]'
              : key === 'back'
              ? 'bg-[--color-gray-200] text-[--color-gray-700] hover:bg-[--color-gray-300] active:bg-[--color-gray-300]'
              : 'bg-white text-[--color-gray-900] border border-[--color-gray-300] hover:bg-[--color-gray-50] active:bg-[--color-gray-100]'
            }
            active:scale-95
          `}
        >
          {key === 'clear' ? 'C' : key === 'back' ? '←' : key}
        </button>
      ))}
    </div>
  );
}
