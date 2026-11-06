import React from 'react';
import { Card } from './Card';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  height = 280,
}) => {
  return (
    <Card
      header={
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-normal mt-0.5">{subtitle}</p>}
        </div>
      }
      actions={actions}
    >
      <div style={{ height, width: '100%' }}>{children}</div>
    </Card>
  );
};
