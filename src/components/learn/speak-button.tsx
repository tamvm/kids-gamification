"use client";

export function SpeakButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      aria-label="Read the question aloud"
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sky-100 text-2xl"
      onClick={() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-AU";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }}
    >
      🔊
    </button>
  );
}
