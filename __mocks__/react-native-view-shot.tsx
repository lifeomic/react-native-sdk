import React from 'react';

const releaseCapture = jest.fn();
const capture = jest.fn().mockResolvedValue('mockImageData');
const ViewShotMock = React.forwardRef(({ children }: any, ref: any) => {
  ref.current = { capture };
  return <>{children}</>;
});

export { releaseCapture };

export default ViewShotMock;
