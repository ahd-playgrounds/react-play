import React from "react";
import "./App.css";
import { Providers } from "./components/Providers";
import { About } from "./components/About";

function App() {
  return (
    <div className="App">
      <Providers
        services={{
          service: {
            getCharacter(id?: string) {
              return Promise.resolve("hello");
            },
          },
        }}
      >
        <About />
      </Providers>
    </div>
  );
}

export default App;
