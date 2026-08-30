import logoMain from '@/assets/logos/dna/logo-main.png';

export function BrandLogo() {
  return (
    <div className="flex size-18 items-center justify-center rounded-xl bg-logo-background p-3">
      <img
        src={logoMain}
        className="block max-h-full max-w-full object-contain object-center"
        alt="DNA"
      />
    </div>
  );
}
