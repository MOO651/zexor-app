import { parseVideoSource } from '../lib/videoEmbed';

type Props = { url?: string; title: string; className?: string; autoPlay?: boolean };

export function MediaVideo({ url, title, className = 'h-full w-full', autoPlay = false }: Props) {
  const source = parseVideoSource(url);
  if (!source) return null;
  if (source.kind === 'embed') {
    return <iframe allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className={className} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={source.src} title={title} />;
  }
  return <video autoPlay={autoPlay} className={`${className} bg-black object-contain`} controls playsInline preload="metadata" src={source.src}>{title}</video>;
}
