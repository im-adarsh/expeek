import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

function Viewer() {
  const [excalidrawData, setExcalidrawData] = useState(null);

  useEffect(() => {
    // Signal to the content script that the iframe is ready
    window.parent.postMessage("expeek:ready", "*");

    function onMessage(e) {
      if (e.data && e.data.type === "expeek:load") {
        setExcalidrawData(e.data.data);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!excalidrawData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: "sans-serif", color: "#666" }}>
        Loading…
      </div>
    );
  }

  return (
    <Excalidraw
      initialData={{
        elements: excalidrawData.elements || [],
        appState: {
          ...(excalidrawData.appState || {}),
          viewModeEnabled: true,
        },
        files: excalidrawData.files || null,
      }}
      viewModeEnabled={true}
      zenModeEnabled={true}
    />
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<Viewer />);
