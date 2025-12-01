interface PinDisplayProps {
  length: number;
  filled: number;
}

export function PinDisplay({ length, filled }: PinDisplayProps) {
  return (
    <div className="flex gap-6 justify-center">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={`
            w-6 h-6 rounded-full transition-all duration-300 border-2 shadow-sm
            ${i < filled
              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] scale-125 shadow-md'
              : 'bg-[var(--color-gray-100)] border-[var(--color-gray-300)]'
            }
          `}
        />
      ))}
    </div>
  );
}
