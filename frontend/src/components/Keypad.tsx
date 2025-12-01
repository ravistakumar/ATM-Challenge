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
    <div className="grid grid-cols-3 gap-4 w-full max-w-[320px]">
      {keys.flat().map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKeyPress(key)}
          className={`
            h-[72px] rounded-xl text-2xl font-semibold transition-all duration-150 shadow-sm
            ${key === 'clear'
              ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-700)] hover:bg-[var(--color-gray-300)] active:bg-[var(--color-gray-300)]'
              : key === 'back'
              ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-700)] hover:bg-[var(--color-gray-300)] active:bg-[var(--color-gray-300)]'
              : 'bg-white text-[var(--color-gray-900)] border-2 border-[var(--color-gray-300)] hover:bg-[var(--color-gray-50)] hover:border-[var(--color-primary)] active:bg-[var(--color-gray-100)]'
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
