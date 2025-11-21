import { useRef, useEffect } from 'react';

export const useDragScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      // Prevent drag on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea')) {
        return;
      }
      
      isDragging.current = true;
      startX.current = e.pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      e.preventDefault();
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      element.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      element.style.cursor = 'grab';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX.current) * 2;
      element.scrollLeft = scrollLeft.current - walk;
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      startX.current = e.touches[0].pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const x = e.touches[0].pageX - element.offsetLeft;
      const walk = (x - startX.current) * 2;
      element.scrollLeft = scrollLeft.current - walk;
    };

    element.style.cursor = 'grab';
    
    // Add mouse event listeners
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);
    
    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return ref;
};
