import { useState, useRef, useEffect } from "react";
import aiAssistantIcon from "../assets/ai_assistant.svg";
import { sendChatMessage } from "../services/aiService";
import { useTranslation } from "react-i18next";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation("ai");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      // Only inject the welcome message once when chat starts empty
      if (prev.length === 0) {
        return [{ role: "ai", text: t("welcomeMessageAI") }];
      }

      // Optional: update the first AI welcome message when language changes
      const updated = [...prev];
      if (updated[0]?.role === "ai") {
        updated[0] = {
          ...updated[0],
          text: t("welcomeMessageAI"),
        };
      }
      return updated;
    });
  }, [t, i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage, true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: response.message,
        },
      ]);
    } catch (error) {
      console.error("Failed to get AI response:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: t(
            "errorMessage",
            "Sorry, I encountered an error. Please try again! ☕"
          ),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 w-[380px] h-[550px] bg-chat-bg backdrop-blur-[20px] border-none rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_16px_64px_rgba(0,0,0,0.3)] flex flex-col z-[1000] ${
          isOpen ? "" : "hidden"
        }`}
      >
        <div className="px-6 py-5 bg-gradient-to-br from-[#1b4332]/60 to-[#2d6a4f]/40 border-b border-[#82a584]/10 rounded-t-[20px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center p-1">
              <img
                src={aiAssistantIcon}
                alt="AI Assistant"
                className="w-full h-full object-contain translate-y-[1px]"
              />
            </div>
            <div>
              <h3 className="m-0 text-lg font-semibold text-[#d8f3dc]">
                {t("aiTitle","AI Assistant")}
              </h3>
              <span className="flex items-center gap-1.5 text-xs text-[#95d5b2]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                Online
              </span>
            </div>
          </div>
          <button
            className="bg-transparent border-none text-[#82a584] text-2xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#82a584]/15"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {message.role === "ai" && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center flex-shrink-0 p-0.5">
                  <img
                    src={aiAssistantIcon}
                    alt="AI"
                    className="w-full h-full object-contain translate-y-[1px]"
                  />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3.5 rounded-2xl leading-relaxed ${
                  message.role === "ai"
                    ? "bg-chat-message/40 text-[#d8f3dc] border border-[#82a584]/10"
                    : "bg-gradient-to-br from-[#2d6a4f] to-[#40916c] text-white"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] flex items-center justify-center flex-shrink-0 p-0.5">
                <img
                  src={aiAssistantIcon}
                  alt="AI"
                  className="w-full h-full object-contain translate-y-[1px]"
                />
              </div>
              <div className="max-w-[75%] px-4 py-3.5 rounded-2xl leading-relaxed bg-chat-message/40 text-[#d8f3dc] border border-[#82a584]/10">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-[#82a584] rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-[#82a584] rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-[#82a584] rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="p-4 px-6 border-t border-[#82a584]/10 bg-gradient-to-br from-[#1b4332]/60 to-[#2d6a4f]/40 rounded-b-[20px] flex gap-3"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder={t("typeYourMessage", "Type your message...")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-black/30 border border-[#82a584]/15 rounded-xl text-[#d8f3dc] placeholder:text-white focus:outline-none focus:border-[#82a584]"
          />
          <button
            type="submit"
            className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#2d6a4f] to-[#40916c] border-none text-white cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!inputValue.trim() || isLoading}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>

      <button
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] border-none cursor-pointer flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.3),0_8px_32px_rgba(27,67,50,0.4)] z-[1000] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),0_12px_40px_rgba(27,67,50,0.5)] active:scale-105 animate-[slideIn_0.5s_ease-out] p-0.5 ${
          isOpen ? "hidden" : ""
        }`}
        onClick={toggleChat}
        aria-label="Open AI chat"
      >
        <span className="absolute inset-0 rounded-full bg-[#82a584]/40 animate-[pulse_2s_ease-out_infinite]"></span>
        <img
          src={aiAssistantIcon}
          alt="AI Assistant"
          className="w-full h-full relative z-[2] object-contain translate-y-[1px]"
        />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full flex items-center justify-center text-sm shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-[bounce_2s_ease-in-out_infinite]">
          💬
        </div>
      </button>
    </>
  );
}