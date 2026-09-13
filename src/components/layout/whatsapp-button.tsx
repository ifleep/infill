import { WhatsappLogo } from "@phosphor-icons/react/ssr";

// Placeholder business number — replace with INFiLLPK's real WhatsApp Business number.
const WHATSAPP_NUMBER = "923000000000";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Hi INFiLLPK, I have a question about "
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with INFiLLPK on WhatsApp"
      className="focus-ring fixed bottom-5 right-5 z-60 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsappLogo size={26} weight="fill" />
    </a>
  );
}
