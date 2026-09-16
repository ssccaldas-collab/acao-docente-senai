export const UNIDADES = ['CFP 1.22', 'CFP 1.28'] as const;
export type Unidade = typeof UNIDADES[number];

export function isValidUnidade(value: unknown): value is Unidade {
  return typeof value === 'string' && (UNIDADES as readonly string[]).includes(value);
}