import React from 'react';
import { InviteContext } from '../components/Invitations/InviteProvider';

export const usePendingInvite = () => React.useContext(InviteContext);
