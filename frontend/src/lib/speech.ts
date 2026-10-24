/**
 * Web Speech API helper for natural pronunciation of vocabulary terms
 */
export function playPronunciation(
  text: string,
  preferredLang: "en-US" | "en-GB" = "en-US"
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Speech Synthesis is not supported in this browser.");
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any currently playing audio

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferredLang;
      utterance.rate = 0.88; // Slightly slower, clear pacing for academic learners
      utterance.pitch = 1.0;

      // Try selecting an English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(preferredLang.toLowerCase()) ||
            v.lang.toLowerCase().startsWith("en")
        );
        if (targetVoice) {
          utterance.voice = targetVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Audio playback error:", err);
      resolve();
    }
  });
}
