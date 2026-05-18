export type ViewEnterParams = {
  threshold: number;
  inset?: string;
  effectId: string;
};

export type TriggerType = 'once' | 'repeat' | 'alternate' | 'state';

export interface InteractConfig {
  effects: Record<string, unknown>;
  interactions: unknown[];
  sequences?: Record<string, unknown>;
}
