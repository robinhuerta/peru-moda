import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ''}`}>
      <Image
        src="/logo.png"
        alt="Perú & Moda"
        width={160}
        height={160}
        className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
        priority
      />
    </span>
  );
}
