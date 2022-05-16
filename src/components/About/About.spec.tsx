import { byRole, byText } from "testing-library-selector";
import { copy } from "../../copy";
import { renderPage } from "../../testHelpers/rtl";
import { About } from "./About";
import React from "react";
import userEvent from "@testing-library/user-event";

const pageModel = {
  welcome: {
    h1: byRole("heading", { name: copy.welcome.h1 }),
    heading: byText(copy.welcome.heading),
    body: byText(copy.welcome.body),
    loadCharacterButton: byRole("button", {
      name: copy.welcome.loadCharacterButton,
    }),
  },
  loading: {
    body: byText(copy.loading.body),
  },
  error: {
    header: byText(copy.error.heading),
    body: byText(copy.error.body),
    button: byRole(copy.error.tryAgainButton),
  },
  about: {
    characterCard: {
      name: byText("Morty"),
    },
  },
};

describe("About Page", () => {
  it("renders the greeting", () => {
    renderPage(<About />);

    const { welcome } = pageModel;

    expect(welcome.h1.get()).toBeInTheDocument();
    expect(welcome.heading.get()).toBeInTheDocument();
  });

  describe("when a character fails to load", () => {
    it("should render a loading spinner, then transition to the error screen", async () => {
      renderPage(<About />, {
        providerOverrides: {
          services: {
            service: {
              getCharacter: async () => {
                throw new Error("ah");
              },
            },
          },
        },
      });

      const {
        loading: { body },
        welcome: { loadCharacterButton },
        error: { header },
      } = pageModel;

      userEvent.click(loadCharacterButton.get());
      expect(await body.find()).toBeInTheDocument();

      expect(await header.find()).toBeInTheDocument();
    });

    describe("when a character keeps failing to load", () => {
      it.todo("should allow the user to try again, without limits");
    });

    describe("when a character loads on another try", () => {
      it.todo("should allow the user to try again, with success");
    });
  });

  describe("when a character loads", () => {
    it("should show the character", async () => {
      renderPage(<About />);

      const {
        about: {
          characterCard: { name },
        },
        welcome: { loadCharacterButton },
      } = pageModel;

      userEvent.click(loadCharacterButton.get());

      expect(await name.find()).toBeInTheDocument();
    });
  });
});
