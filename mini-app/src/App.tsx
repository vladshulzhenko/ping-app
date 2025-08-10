import { useEffect, useState } from "react";

// Use the global Telegram WebApp object
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        sendData: (data: string) => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        MainButton: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        onEvent: (
          eventType: string,
          eventHandler: (data?: any) => void
        ) => void;
        offEvent: (
          eventType: string,
          eventHandler: (data?: any) => void
        ) => void;
      };
    };
  }
}

function App() {
  const [isPinging, setIsPinging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Telegram Web App
    const initializeApp = async () => {
      try {
        // Check if Telegram WebApp is available
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;

          // Initialize the web app
          webApp.ready();

          // Expand the viewport to full height
          webApp.expand();

          // Disable closing confirmation initially
          webApp.disableClosingConfirmation();

          console.log("Telegram WebApp initialized");
          console.log("Init data:", webApp.initData);
          console.log("User info:", webApp.initDataUnsafe);

          setIsInitialized(true);
        } else {
          // For development/testing outside Telegram
          console.warn(
            "Telegram WebApp not available - running in development mode"
          );
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize Telegram Web App:", error);
        setStatusMessage("Failed to initialize app");
        setIsInitialized(true); // Still allow the app to work
      }
    };

    initializeApp();
  }, []);

  const handlePing = async () => {
    if (isPinging) return;

    setIsPinging(true);
    setStatusMessage("Sending ping...");

    try {
      // Prepare data to send to the bot
      const pingData = {
        action: "ping",
        timestamp: Date.now(),
        user: window.Telegram?.WebApp?.initDataUnsafe?.user || null,
      };

      // Check if we're in Telegram WebApp
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;

        // Send data to the bot without waiting for response
        webApp.sendData(JSON.stringify(pingData));

        // Show success message and reset state
        setTimeout(() => {
          setStatusMessage("Ping sent successfully! 🎉");
          setIsPinging(false);
        }, 800);
      } else {
        // For development/testing - simulate the process
        setStatusMessage("Sending to admin...");

        setTimeout(() => {
          setStatusMessage("Ping sent successfully! 🎉");
          setIsPinging(false);
        }, 1500);

        console.log("Would send ping data:", pingData);
      }
    } catch (error) {
      console.error("Error sending ping:", error);
      setStatusMessage("Failed to send ping. Please try again.");
      setIsPinging(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="ping-container">
        <h1 className="title">Loading...</h1>
        <p className="subtitle">Initializing Telegram Mini App</p>
      </div>
    );
  }

  return (
    <div className="ping-container">
      <h1 className="title">Ping Bot</h1>
      <p className="subtitle">
        Click the button below to send a ping notification to the admin
      </p>

      <button className="ping-button" onClick={handlePing} disabled={isPinging}>
        {isPinging ? "📤 Sending..." : "🔔 Ping Admin"}
      </button>

      {statusMessage && (
        <div
          className={`status-message ${
            statusMessage.includes("success") || statusMessage.includes("🎉")
              ? "status-success"
              : "status-error"
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export default App;
