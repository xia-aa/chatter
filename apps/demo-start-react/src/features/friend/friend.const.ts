import z from 'zod';

export const friendStatuses = ['pending', 'accepted', 'rejected'] as const;
export type FriendStatus = (typeof friendStatuses)[number];
export const friendStatusZ = z.enum(friendStatuses);
