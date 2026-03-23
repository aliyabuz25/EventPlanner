declare module 'react-icons/lib/iconBase' {
  import * as React from 'react';

  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
  }
}
