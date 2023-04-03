import React from 'react';
import { Colors } from '../defaultTheme';
import Info from './Info';

const Issue = ({ stroke = Colors.issue }) => {
  return <Info stroke={stroke} />;
};

export default Issue;
