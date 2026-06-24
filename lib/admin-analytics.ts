import { prisma } from "@/lib/prisma";

export type AdminAnalyticsSummary = {
  visitors: number;
  pageViews: number;
  productViews: number;
  searches: number;
  cartEvents: number;
  whatsappOrders: number;
};

export async function getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  const [visitors, pageViews, productViews, searches, cartEvents, whatsappOrders] = await Promise.all([
    prisma.visitor.count(),
    prisma.pageView.count(),
    prisma.productView.count(),
    prisma.searchEvent.count(),
    prisma.cartEvent.count(),
    prisma.whatsAppOrder.count(),
  ]);

  return { visitors, pageViews, productViews, searches, cartEvents, whatsappOrders };
}

export async function listAdminVisitors() {
  return prisma.visitor.findMany({
    orderBy: { lastVisitAt: "desc" },
    take: 100,
    include: {
      _count: {
        select: {
          pageViews: true,
          productViews: true,
          searchEvents: true,
          cartEvents: true,
          orders: true,
        },
      },
    },
  });
}

export async function listAdminWhatsAppOrders() {
  return prisma.whatsAppOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      visitor: {
        select: {
          sessionId: true,
          browser: true,
          deviceType: true,
          city: true,
          country: true,
        },
      },
    },
  });
}
