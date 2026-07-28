/**
 * Gera `public/favicon.ico` a partir da mesma geometria de `src/app/icon.svg`.
 *
 * Por que existe (ver PROJECT.md ADR-020): o App Router serve `icon.svg` e é
 * o que todo navegador atual usa, mas Safari antigo, atalhos do Windows e
 * ferramentas que pedem `/favicon.ico` direto (sem ler o HTML) precisam de um
 * ICO. Nenhuma dependência nova entra no projeto por causa disso — a arte é
 * geométrica (uma placa de cantos arredondados e seis anéis concêntricos em
 * arranjo hexagonal), então o rasterizador cabe aqui e o PNG sai do `zlib` do
 * próprio Node.
 *
 * Rodar depois de qualquer mudança em `src/app/icon.svg`:
 *   node scripts/generate-favicon.mjs
 *
 * O resultado é commitado — o build não depende deste script.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/** Cores do manual — PROJECT.md §2. */
const NAVY = [0x2e, 0x46, 0x6f];
const GREEN = [0x99, 0xc7, 0x6b];

/**
 * Geometria em fração do lado do canvas, derivada de `src/app/icon.svg`:
 * símbolo (1582.88×1742.56) centralizado e escalado por 0.220365 num quadrado
 * de 512. Fração em vez de px para que qualquer tamanho de saída use a mesma
 * definição.
 */
const CORNER_RADIUS = 96 / 512;
const RING_DISTANCE = 131.27 / 512; // centro da composição → centro de cada anel
const RING_OUTER = 60.72 / 512;
const RING_INNER = 29.38 / 512;
const RING_COUNT = 6;

const RING_CENTERS = Array.from({ length: RING_COUNT }, (_, i) => {
  // Arranjo hexagonal: primeiro anel no topo, os outros a cada 60°.
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / RING_COUNT;
  return [0.5 + RING_DISTANCE * Math.cos(angle), 0.5 + RING_DISTANCE * Math.sin(angle)];
});

/** Ponto dentro do quadrado de cantos arredondados (coordenadas em fração). */
function inRoundedSquare(x, y) {
  const r = CORNER_RADIUS;
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/** Ponto dentro da coroa circular de algum dos seis anéis. */
function inRing(x, y) {
  for (const [cx, cy] of RING_CENTERS) {
    const d = Math.hypot(x - cx, y - cy);
    if (d <= RING_OUTER && d >= RING_INNER) return true;
  }
  return false;
}

/** Rasteriza em RGBA8 com supersampling 4×4 por pixel (antialiasing). */
function rasterize(size) {
  const SS = 4;
  const pixels = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let covered = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          if (!inRoundedSquare(x, y)) continue;
          const color = inRing(x, y) ? GREEN : NAVY;
          covered += 1;
          r += color[0];
          g += color[1];
          b += color[2];
        }
      }
      if (covered > 0) {
        const alpha = (covered / (SS * SS)) * 255;
        // `.set()` em vez de atribuição indexada: mesmo resultado, sem
        // disparar `security/detect-object-injection` num índice calculado.
        pixels.set(
          [r / covered, g / covered, b / covered, alpha].map(Math.round),
          (py * size + px) * 4,
        );
      }
    }
  }
  return pixels;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  // O índice é mascarado com 0xff — sempre 0..255, dentro da tabela.
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** PNG RGBA8 sem filtro (tipo 0 por scanline) — suficiente para arte chapada. */
function encodePng(size, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Container ICO com payload PNG (suportado desde o Windows Vista). */
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: ícone
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0; // paleta
    entry[3] = 0; // reservado
    entry.writeUInt16LE(1, 4); // planos
    entry.writeUInt16LE(32, 6); // bits por pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const images = [16, 32, 48].map((size) => ({ size, png: encodePng(size, rasterize(size)) }));
const ico = encodeIco(images);
writeFileSync(resolve(root, 'public/favicon.ico'), ico);
console.log(
  `public/favicon.ico — ${images.map((i) => `${i.size}px`).join(', ')}, ${ico.length} bytes`,
);

// `--preview <arquivo.png>`: PNG grande para conferir a arte a olho nu.
const previewIndex = process.argv.indexOf('--preview');
if (previewIndex !== -1) {
  const target = process.argv[previewIndex + 1];
  if (!target) throw new Error('--preview exige um caminho de arquivo');
  writeFileSync(target, encodePng(256, rasterize(256)));
  console.log(`preview: ${target}`);
}
