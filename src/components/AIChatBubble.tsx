import { useState } from "react";
import styles from "../style/aiChatBubble.module.css";

export default function AIChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', text: string }>>([
        { role: 'ai', text: 'Hi! I\'m your Brew Buddy AI assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState("");

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setMessages([...messages, { role: 'user', text: inputValue }]);
            setInputValue("");

            // Simulate AI response (replace with actual API call)
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    text: 'Thanks for your message! This is a placeholder response. Connect me to your AI backend to get real responses.'
                }]);
            }, 1000);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.aiAvatar}>🤖</div>
                        <div className={styles.headerText}>
                            <h3>AI Assistant</h3>
                            <span className={styles.status}>
                                <span className={styles.statusDot}></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={toggleChat}
                        aria-label="Close chat"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.messagesContainer}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`${styles.message} ${styles[message.role]}`}
                        >
                            {message.role === 'ai' && (
                                <div className={styles.messageAvatar}>🤖</div>
                            )}
                            <div className={styles.messageBubble}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                </div>

                <form className={styles.inputContainer} onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={styles.input}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!inputValue.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                    </button>
                </form>
            </div>

            {/* Floating Bubble Button */}
            <button
                className={`${styles.chatBubble} ${isOpen ? styles.hidden : ''}`}
                onClick={toggleChat}
                aria-label="Open AI chat"
            >
                <div className={styles.bubbleIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <circle cx="9" cy="10" r="1" fill="currentColor"/>
                        <circle cx="12" cy="10" r="1" fill="currentColor"/>
                        <circle cx="15" cy="10" r="1" fill="currentColor"/>
                    </svg>
                </div>
                <div className={styles.bubblePulse}></div>
                <div className={styles.bubbleNotification}>💬</div>
            </button>
        </>
    );
}
