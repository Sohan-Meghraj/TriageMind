// In-memory mock data backing the function tools. No real systems (§4.4).
// Real/expanded data is a later step; this is enough to make tools return
// believable values during the skeleton demo.

import type { Order } from "./types";

export const MOCK_ORDERS: Order[] = [
  {
    orderId: "ORD-1001",
    customerEmail: "alex@example.com",
    status: "DELIVERED",
    amount: 89.99,
    currency: "USD",
    placedAt: "2026-05-20",
    billingHistory: [
      { date: "2026-05-20", description: "Order charge", amount: 89.99 },
    ],
  },
  {
    orderId: "ORD-1002",
    customerEmail: "jordan@example.com",
    status: "REFUND_PENDING",
    amount: 42.0,
    currency: "USD",
    placedAt: "2026-05-28",
    billingHistory: [
      { date: "2026-05-28", description: "Order charge", amount: 42.0 },
      { date: "2026-06-02", description: "Partial refund", amount: -10.0 },
    ],
  },
  {
    orderId: "ORD-1003",
    customerEmail: "sam@example.com",
    status: "SHIPPED",
    amount: 256.5,
    currency: "USD",
    placedAt: "2026-06-01",
    billingHistory: [
      { date: "2026-06-01", description: "Order charge", amount: 256.5 },
    ],
  },
];
