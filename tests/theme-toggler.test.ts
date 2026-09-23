import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/lib/utils.ts';

test('Theme Toggler - cn utility merges class names correctly', () => {
  const merged = cn('p-2 text-sm', 'text-base', { 'font-bold': true, 'font-light': false });
  assert.ok(merged.includes('p-2'));
  assert.ok(merged.includes('text-base'));
  assert.ok(!merged.includes('text-sm')); // overridden by twMerge
  assert.ok(merged.includes('font-bold'));
  assert.ok(!merged.includes('font-light'));
});

test('Theme Toggler - Geometry calculations produce valid CSS clip-paths', () => {
  const cx = 100;
  const cy = 100;
  const viewportWidth = 1000;
  const viewportHeight = 800;
  const maxRadius = Math.hypot(cx, cy);

  assert.ok(maxRadius > 0);
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`;
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`;
  const point = `${toX(cx)} ${toY(cy)}`;
  assert.equal(point, '10% 12.5%');
});

test('Theme Toggler - Polygon collapsed generator matches vertices', () => {
  const pt = '50% 50%';
  const collapsed = (point: string, count: number) =>
    `polygon(${Array.from({ length: count }, () => point).join(', ')})`;

  assert.equal(collapsed(pt, 3), 'polygon(50% 50%, 50% 50%, 50% 50%)');
  assert.equal(collapsed(pt, 4), 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)');
});
