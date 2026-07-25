import { branding } from "@/lib/branding";

export function BrandLogo({ size }: { size: keyof typeof branding.logos }) {
  const logo = branding.logos[size];

  // SVG local, servido estático — não passa pelo otimizador (next/image bloqueia SVG por padrão).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logo.src} alt={branding.name} width={logo.width} height={logo.height} />;
}
