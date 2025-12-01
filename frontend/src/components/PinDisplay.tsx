interface PinDisplayProps {
  length: number;
  filled: number;
}

export function PinDisplay({ length, filled }: PinDisplayProps) {
  return (
    <div className="flex gap-4 justify-center">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={`
            w-4 h-4 rounded-full transition-all duration-200 border-2
            ${i < filled
              ? 'bg-[--color-primary] border-[--color-primary]'
              : 'bg-white border-[--color-gray-300]'
            }
          `}
        />
      ))}
    </div>
  );
}
