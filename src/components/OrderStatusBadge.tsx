import React from 'react';
import { CheckCheck, CheckCircle2, Clock, Flame } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    bg: string;
    text: string;
    border: string;
    icon: React.FC<{ className?: string }>;
    animated?: boolean;
  }
> = {
  Pending: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    border: 'border-[#FCD34D]',
    icon: Clock,
    animated: true,
  },
  Preparing: {
    bg: 'bg-[#FFEDD5]',
    text: 'text-[#C2410C]',
    border: 'border-[#FDBA74]',
    icon: Flame,
    animated: true,
  },
  Ready: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#166534]',
    border: 'border-[#86EFAC]',
    icon: CheckCircle2,
  },
  Completed: {
    bg: 'bg-[#F5E8EB]',
    text: 'text-[#5C1422]',
    border: 'border-[#E2C2C9]',
    icon: CheckCheck,
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, compact = false }) => {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon
        className={`w-3.5 h-3.5 shrink-0 ${cfg.animated ? 'animate-pulse' : ''}`}
      />
      <span>{status}</span>
    </span>
  );
};
