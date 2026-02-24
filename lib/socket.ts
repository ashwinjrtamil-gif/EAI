import { io } from 'socket.io-client';

// In production, the socket connects to the same host
export const socket = io();
