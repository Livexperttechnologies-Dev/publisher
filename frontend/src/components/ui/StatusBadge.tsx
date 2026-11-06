import React from 'react';
import { Badge, BadgeProps } from './Badge';

export type EntityStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'POSTED'
  | 'DRAFT'
  | 'PENDING'
  | 'CANCELLED'
  | 'REVERSED'
  | 'SETTLED'
  | 'LOW_STOCK';

interface StatusBadgeProps {
  status: EntityStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase();

  let variant: BadgeProps['variant'] = 'slate';

  switch (normalized) {
    case 'ACTIVE':
    case 'POSTED':
    case 'SETTLED':
      variant = 'success';
      break;
    case 'PENDING':
    case 'DRAFT':
      variant = 'purple';
      break;
    case 'LOW_STOCK':
    case 'CANCELLED':
      variant = 'coral';
      break;
    case 'REVERSED':
      variant = 'magenta';
      break;
    default:
      variant = 'slate';
  }

  return (
    <Badge variant={variant} size={size}>
      <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {normalized.replace('_', ' ')}
    </Badge>
  );
};
