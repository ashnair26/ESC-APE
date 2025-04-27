import { useEffect } from 'react';

export function useDebugSortableItems(blocks) {
  useEffect(() => {
    if (!Array.isArray(blocks)) {
      console.error('Blocks is not an array', blocks);
      return;
    }

    const invalidBlocks = blocks.filter(
      (block) => !block || typeof block.id !== 'string' || block.id.trim() === ''
    );

    if (invalidBlocks.length > 0) {
      console.error('Invalid blocks detected:', invalidBlocks);
    } else {
      console.log('All blocks have valid IDs:', blocks.map(b => b.id));
    }
  }, [blocks]);
}
