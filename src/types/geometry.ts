export interface Point {
  x: number;
  y: number;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AlignAxis = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';
export type DistributeAxis = 'horizontal' | 'vertical';
export type ArrangePattern =
  | 'diagonal-tl'
  | 'diagonal-tr'
  | 'diagonal-bl'
  | 'diagonal-br'
  | 'grid'
  | 'circle';
