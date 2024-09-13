import { useState, useCallback } from "react";
import _ from "lodash";
import "./App.css";
import spinner from "./assets/6-dots-scale-middle.svg";

function App() {
  const [text, setText] = useState<string>("");
  const [thinking, setThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<string>("");

  const fetchSuggestions = async (input: string) => {
    try {
      console.log("suggestion time for ", input);
      setThinking(true);
      setSuggestions("");
      const response = await fetch("http://localhost:8080/completion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          n_predict: 10,
        }),
      });
      console.log(response);
      const suggestions = await response.json();
      console.log(suggestions);
      setSuggestions(suggestions.content);
      setThinking(false);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const callback = useCallback(_.debounce(fetchSuggestions, 500), []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setText(value);
    if (
      value.endsWith(".") ||
      value.endsWith("?") ||
      value.endsWith("!") ||
      value.endsWith(",")
    ) {
      callback(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault(); // Prevent default newline behavior if necessary
      callback(text);
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <h1>AI Prompt Inversion Editor</h1>
      <p style={{ textAlign: "justify" }}>
        Type like usual. When you pause at the end of a sentence or hit
        CMD+Enter, the AI will prompt you with a continuation.
      </p>
      <p style={{ textAlign: "justify" }}>
        Instead of the AI finishing your sentence, which would require it to
        know what you're thinking, it can prompt you with just enough words to
        help you over the "what do I write next" hurdle.
      </p>
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Start typing..."
        style={{
          width: "100%",
          height: "50vh",
          fontSize: "16px",
          padding: "10px",
        }}
      />
      <div style={{ marginTop: "10px", fontSize: "18px" }}>
        <p>
          <strong>Prompt:&nbsp;&nbsp;</strong>
          {thinking && <img style={{ paddingLeft: "10px" }} src={spinner} />}
          <em>{suggestions}</em>
        </p>
        <p style={{ fontSize: "15px", fontWeight: "lighter" }}>
          Hit CMD+Enter again for another suggestion.
        </p>
      </div>
    </div>
  );
}

export default App;
