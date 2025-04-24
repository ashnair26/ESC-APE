'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { Popover } from '@headlessui/react';
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/react-dom';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (color: string) => void;
  colorName: string;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  color,
  onChange,
  colorName,
  isOpen,
  onClose,
  triggerRef
}) => {
  const arrowRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Set up floating UI for positioning
  const {
    x,
    y,
    strategy,
    refs,
    middlewareData
  } = useFloating({
    placement: 'right',
    middleware: [
      offset(20), // Increase offset to move it further to the right
      shift({ padding: 5 }),
      arrow({ element: arrowRef })
    ]
  });

  // Position the popover when it opens
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !refs.setReference) return;

    refs.setReference(triggerRef.current);
    setMounted(true);
  }, [isOpen, triggerRef, refs]);

  // Handle clicks outside to close the popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, refs.floating, triggerRef]);

  // Handle color change
  const handleColorChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
  };

  if (!isOpen || !mounted) return null;

  // Calculate arrow position
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }['right'];

  return (
    <div
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 50,
        width: 'auto',
        animation: 'fadeInRight 0.3s ease-out forwards'
      }}
      className="color-picker-popover"
    >
      <div
        ref={arrowRef}
        className="absolute w-2 h-2 bg-[#111111] rotate-45"
        style={{
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          [staticSide]: '-4px'
        }}
      />

      <div className="p-3 bg-[#111111] rounded-lg shadow-lg border-[0.5px] border-white/30">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: color || '#ffffff' }}
            />
            <div className="text-white text-xs">{colorName}</div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <SketchPicker
          color={color || '#ffffff'}
          onChangeComplete={handleColorChange}
          disableAlpha={true}
          presetColors={[]}
          width="220px"
          styles={{
            default: {
              picker: {
                background: '#111111',
                boxShadow: 'none',
                width: '100%',
                paddingBottom: '0',
                borderRadius: '0'
              },
              saturation: {
                paddingBottom: '50%',
                marginBottom: '8px'
              },
              hue: {
                height: '10px',
                marginBottom: '8px'
              },
              controls: {
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: '0'
              },
              color: {
                width: '20px',
                height: '20px',
                marginBottom: '0'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default ColorPickerPopover;
