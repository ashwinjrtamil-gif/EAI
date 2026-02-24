import { io } from "socket.io-client";

// In production, the socket connects to the same host that serves the page.
// In development, we use the current window origin.
const URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
