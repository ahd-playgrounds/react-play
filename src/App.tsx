import React from "react";
import "./App.css";
import { Providers } from "./components/Providers";
import { About, About2 } from "./components/About/About";

function App() {
  return (
    <div className="App">
      <Providers
        services={{
          service: {
            getCharacter(id?: string) {
              return fetch("https://rickandmortyapi.com/api/character/2").then(
                (d) => d.json()
              );
            },
          },
        }}
      >
        <About />
        {/*<About2 />*/}
      </Providers>
    </div>
  );
}

export default App;
