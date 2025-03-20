export const attachListenersMouseMoveAndUpHandler = (
  moveHandler: (e: MouseEvent) => void,
  upHandler: (e: MouseEvent) => void,
) => {
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
};

export const detachListenersMouseMoveAndUpHandler = (
  moveHandler: (e: MouseEvent) => void,
  upHandler: (e: MouseEvent) => void,
) => {
  document.removeEventListener('mousemove', moveHandler);
  document.removeEventListener('mouseup', upHandler);
};
