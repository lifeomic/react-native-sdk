import React, { useState, createContext, useContext } from 'react';
import { CircleTile } from '..';

type CircleContextProps = {
  circleTile?: CircleTile | null;
  setCircleTile?: (circleTile: CircleTile) => void;
};

const CircleTileContext = createContext<CircleContextProps>({});

export const CircleTileContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [circleTile, setCircleTile] = useState<CircleTile | null>(null);
  return (
    <CircleTileContext.Provider value={{ circleTile, setCircleTile }}>
      {children}
    </CircleTileContext.Provider>
  );
};

export const useActiveCircleTile = () => useContext(CircleTileContext);
