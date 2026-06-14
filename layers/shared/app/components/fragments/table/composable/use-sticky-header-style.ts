import type { Header } from '@tanstack/vue-table';
import type { CSSProperties } from 'vue';

/**
 * HOOK Style for HEADER CELL (sticky vertical - freeze header row)
 */
export const useCreateStickyHeaderStyle = <TData, TValue>(freezeIds: string[], scrollTop: number) => {
  const createStyle = (header: Header<TData, TValue>, scrollLeft: number): CSSProperties => {
    const id = header.column.id;
    const isFrozenColumn = freezeIds.includes(id);
    if (!isFrozenColumn)
      return {
        position: 'sticky',
        top: 0,
        zIndex: 30, // Higher than body cells
        backgroundColor: 'var(--sidebar)',
      };

    const stuck = scrollTop > 0;
    const width = header.getSize();

    const baseStyle: CSSProperties = {
      width,
      minWidth: width,
      maxWidth: width,
      position: 'sticky',
      top: 0,
      zIndex: 30, // Higher than body cells
      backgroundColor: 'var(--sidebar)',
      boxSizing: 'border-box',
      transform: 'translateZ(0)',
      // Shadow bawah saat scroll vertical
      ...(stuck && {
        boxShadow: '0 2px 8px var(--sticky-shadow)',
      }),
    };

    // Jika header cell ini juga frozen column
    if (isFrozenColumn) {
      const headerGroup = header.headerGroup.headers;
      const orderedFreeze = headerGroup.filter((h) => freezeIds.includes(h.column.id)).map((h) => h.column.id);
      const left = header.getStart();
      const isLastFrozen = orderedFreeze[orderedFreeze.length - 1] === id;
      const stuckHorizontal = scrollLeft > left - 1;

      return {
        ...baseStyle,
        left: stuckHorizontal ? left : 0,
        zIndex: 50, // Highest: header + frozen column
        transition: 'left 0.2s linear',
        // Kombinasi shadow jika stuck both directions
        ...(stuck &&
          isLastFrozen &&
          stuckHorizontal && {
            boxShadow: '2px 2px 8px var(--sticky-shadow)',
          }),
      };
    }

    return baseStyle;
  };

  return createStyle;
};
