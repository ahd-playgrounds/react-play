import { useText } from "../../hooks/useText";
import React, { useEffect, useState } from "react";
import { useAboutPage } from "./useAboutPage";
import { ICharacter } from "../../services/rickAndMortyService";
import { useServices } from "../../hooks/useServices";

export function About2() {
  const welcome = useText("welcome");
  const services = useServices();
  const [loading, setLoading] = useState(false);
  const [canFetch, setCanFetch] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setCanFetch(false);

    if (canFetch) {
      services.service.getCharacter().then((d) => {
        setName(d.name);
        setLoading(false);
      });
    }
  }, [canFetch]);

  if (loading) return <p>loading...</p>;

  if (name) {
    return <p>hi {name}</p>;
  }

  return (
    <div>
      <h1>{welcome.h1}</h1>
      <button
        onClick={() => {
          setLoading(true);
          setCanFetch(true);
        }}
      >
        click
      </button>
    </div>
  );
}

export function About() {
  const welcome = useText("welcome");
  const [state, dispatch] = useAboutPage();

  console.log(state);

  if (state.error) {
    return <ErrorPage />;
  }

  if (state.loading) {
    return <Loading />;
  }

  if (state.character) {
    return <Character character={state.character} />;
  }

  return (
    <div>
      <h1>{welcome.h1}</h1>
      <h2>{welcome.heading}</h2>
      <button
        type="button"
        onClick={() => {
          dispatch({ event: "LOAD" });
        }}
      >
        {welcome.loadCharacterButton}
      </button>
    </div>
  );
}

function ErrorPage() {
  const { body, heading, tryAgainButton } = useText("error");
  return (
    <div>
      <h2>{heading}</h2>
      <p>{body}</p>
    </div>
  );
}

function Loading() {
  const { body } = useText("loading");
  return (
    <div>
      <p>{body}</p>
    </div>
  );
}

interface ICharacterPage {
  character: ICharacter;
}

function Character({ character }: ICharacterPage) {
  return <p>{character.name}</p>;
}
