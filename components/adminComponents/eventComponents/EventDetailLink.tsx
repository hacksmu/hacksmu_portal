import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import Link from 'next/link';

interface EventDetailLinkProps {
  title: string;
  href: string;
}

export default function EventDetailLink({ title, href }: EventDetailLinkProps) {
  return (
    <Link href={href}>
      <a
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 14,
          textDecoration: 'none',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(100,160,255,0.07) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
          marginBottom: 10,
        }}
      >
        <h1
          className="text-lg font-bold hover:cursor-pointer"
          style={{ color: 'rgba(220,240,255,0.92)', margin: 0 }}
        >
          {title}
        </h1>
        <ArrowNarrowRightIcon className="w-5 h-5" style={{ color: '#80d8ff', flexShrink: 0 }} />
      </a>
    </Link>
  );
}
