/**
 * Busca da home — ver PROJECT.md §1 (escopo) e ADR-021.
 *
 * Funções puras, sem dependência nova e sem estado: recebem o registry já
 * validado e uma string, devolvem os links ordenados por proximidade. Toda a
 * heurística vive aqui, fora do componente, porque é o que precisa de teste
 * unitário — o `<LinkSearch>` só desenha o resultado.
 *
 * Ranking (do mais forte para o mais fraco), por token da busca:
 *   palavra idêntica > começa com > contém > erro de digitação > subsequência
 *
 * Todo token da busca precisa achar *algum* casamento, senão a entrada sai do
 * resultado: sem isso, "cotacao xyz" traria as cotações como se `xyz` não
 * tivesse sido digitado.
 */

import type { Sector, SectorLink } from '@/content/links';

export interface SearchHit {
  readonly link: SectorLink;
  /** Setor de origem — exibido junto do resultado, já que a busca é global. */
  readonly sector: Pick<Sector, 'slug' | 'name'>;
  /** 0 (excluído) a 1 (casamento perfeito). Exposto para teste e depuração. */
  readonly score: number;
}

/** Peso de cada campo: bater no título vale mais do que bater no setor. */
const WEIGHT_TITLE = 1;
const WEIGHT_DESCRIPTION = 0.75;
const WEIGHT_SECTOR = 0.6;

const SCORE_EXACT_WORD = 1;
const SCORE_PREFIX = 0.9;
const SCORE_SUBSTRING = 0.7;
const SCORE_TYPO = 0.55;
const SCORE_SUBSEQUENCE = 0.4;

/** Abaixo disso o casamento é fraco demais para ser mostrado como sugestão. */
const MIN_SCORE = 0.2;
/** Tokens curtos casam com qualquer coisa por subsequência — não vale a pena. */
const MIN_LENGTH_FOR_SUBSEQUENCE = 3;
/**
 * A subsequência só vale se couber em até 2× o tamanho do token: abreviação
 * ("dshbrd" → "dashboard") passa, letras espalhadas por uma frase inteira não.
 */
const MAX_SUBSEQUENCE_SPREAD = 2;
const DEFAULT_LIMIT = 6;

/**
 * Minúsculas, sem acento e sem pontuação: "FB029/00" vira "fb029 00" e
 * "Solicitação" vira "solicitacao". É o que faz "cotacao" achar "Cotação".
 */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Quantos erros de digitação tolerar num token — proporcional ao tamanho. */
function maxTypoDistance(token: string): number {
  if (token.length >= 7) return 2;
  if (token.length >= 4) return 1;
  return 0;
}

interface DistanceCell {
  /** Caractere de `b` que esta coluna representa. */
  readonly char: string;
  readonly value: number;
}

/**
 * Distância de Levenshtein com duas linhas.
 *
 * A linha anterior é uma lista de células que já carregam o caractere de `b`
 * correspondente, e as vizinhas (esquerda e diagonal) andam em variáveis. Sem
 * nenhum acesso indexado por variável: `security/detect-object-injection`
 * reprovaria, e `noUncheckedIndexedAccess` obrigaria a um fallback que nenhum
 * teste consegue exercitar — código morto disfarçado de defesa.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow: readonly DistanceCell[] = [...b].map((char, index) => ({
    char,
    value: index + 1,
  }));
  let previousFirst = 0;
  let row = 1;
  let last = 0;

  for (const charA of a) {
    const currentRow: DistanceCell[] = [];
    // Coluna 0 da linha atual é `row`; a diagonal parte da coluna 0 anterior.
    let left = row;
    let diagonal = previousFirst;

    for (const cell of previousRow) {
      const substitution = diagonal + (charA === cell.char ? 0 : 1);
      const value = Math.min(substitution, left + 1, cell.value + 1);
      currentRow.push({ char: cell.char, value });
      diagonal = cell.value;
      left = value;
    }

    previousRow = currentRow;
    previousFirst = row;
    row += 1;
    last = left;
  }

  return last;
}

/**
 * Menor trecho de `text` que contém todos os caracteres de `token` na ordem,
 * ou `-1` se não houver — é o que faz "dshbrd" achar "dashboard".
 *
 * Devolve o tamanho do trecho, não um booleano, porque subsequência sozinha é
 * frouxa demais: "cotacao" é subsequência de "solicitação de alteração de
 * campanha" espalhada por 20 caracteres, o que não é um casamento, é acaso.
 * Quem decide o que é compacto o bastante é `scoreToken`.
 */
export function subsequenceSpan(token: string, text: string): number {
  const firstChar = token.slice(0, 1);
  let best = -1;

  // Uma tentativa por ocorrência do primeiro caractere: começar sempre pela
  // primeira acharia trechos maiores do que o necessário.
  let start = text.indexOf(firstChar);
  while (start !== -1) {
    let position = start;
    let matched = true;

    for (const char of token.slice(1)) {
      const found = text.indexOf(char, position + 1);
      if (found === -1) {
        matched = false;
        break;
      }
      position = found;
    }

    if (matched) {
      const span = position - start + 1;
      if (best === -1 || span < best) best = span;
    }

    start = text.indexOf(firstChar, start + 1);
  }

  return best;
}

function scoreToken(token: string, text: string, words: readonly string[]): number {
  if (words.includes(token)) return SCORE_EXACT_WORD;
  if (words.some((word) => word.startsWith(token))) return SCORE_PREFIX;
  if (text.includes(token)) return SCORE_SUBSTRING;

  const tolerance = maxTypoDistance(token);
  if (tolerance > 0 && words.some((word) => editDistance(token, word) <= tolerance)) {
    return SCORE_TYPO;
  }

  if (token.length >= MIN_LENGTH_FOR_SUBSEQUENCE) {
    const span = subsequenceSpan(token, text);
    if (span !== -1 && span <= token.length * MAX_SUBSEQUENCE_SPREAD) {
      return SCORE_SUBSEQUENCE;
    }
  }

  return 0;
}

interface WeightedField {
  readonly text: string;
  readonly words: readonly string[];
  readonly weight: number;
}

function toField(source: string, weight: number): WeightedField {
  const text = normalize(source);
  return { text, words: text.split(' ').filter(Boolean), weight };
}

/** Média dos tokens; 0 se algum token não casar em campo nenhum. */
function scoreEntry(tokens: readonly string[], fields: readonly WeightedField[]): number {
  let total = 0;

  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      best = Math.max(best, field.weight * scoreToken(token, field.text, field.words));
    }
    if (best === 0) return 0;
    total += best;
  }

  return total / tokens.length;
}

/**
 * Links de todos os setores ordenados por proximidade da busca.
 *
 * Links cross-listados (Portal de Chamados, Dashboard Comercial — ver §6)
 * aparecem uma única vez, no setor que pontuou mais alto: repetir a mesma URL
 * no resultado se lê como defeito, não como informação.
 */
export function searchLinks(
  sectors: readonly Sector[],
  query: string,
  limit: number = DEFAULT_LIMIT,
): readonly SearchHit[] {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { readonly hit: SearchHit; readonly order: number }[] = [];
  let order = 0;

  for (const sector of sectors) {
    const sectorField = toField(sector.name, WEIGHT_SECTOR);

    for (const link of sector.links) {
      const fields = [toField(link.title, WEIGHT_TITLE), sectorField];
      if (link.description !== undefined) {
        fields.push(toField(link.description, WEIGHT_DESCRIPTION));
      }

      const score = scoreEntry(tokens, fields);
      if (score >= MIN_SCORE) {
        scored.push({
          hit: { link, sector: { slug: sector.slug, name: sector.name }, score },
          order,
        });
      }
      order += 1;
    }
  }

  // Empate resolvido pela ordem do registry — resultado estável, nunca
  // dependente da ordem de iteração do motor.
  scored.sort((a, b) => b.hit.score - a.hit.score || a.order - b.order);

  const seenHrefs = new Set<string>();
  const hits: SearchHit[] = [];
  for (const { hit } of scored) {
    if (seenHrefs.has(hit.link.href)) continue;
    seenHrefs.add(hit.link.href);
    hits.push(hit);
    if (hits.length === limit) break;
  }

  return hits;
}
