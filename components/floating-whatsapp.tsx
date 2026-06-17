import { MessageCircle } from "lucide-react";
import { getWhatsAppOrderNumber } from "@/lib/env";

export function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${getWhatsAppOrderNumber()}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact RF Telecom LB on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <MessageCircle size={26} />
    </a>
  );
}
