// Copyright 2023 Jesse Stricker.
// SPDX-License-Identifier: Apache-2.0

import katex from "katex";

document.addEventListener("DOMContentLoaded", () => {
  // declare elements
  const texCodeElement = document.getElementById(
    "tex-code",
  ) as HTMLTextAreaElement;
  const useDisplayModeElement = document.getElementById(
    "use-display-mode",
  ) as HTMLInputElement;
  const previewElement = document.getElementById("preview")!;
  const outputElement = document.getElementById("output")!;

  // setup events, process initial state
  texCodeElement.addEventListener("input", onInputChanged);
  useDisplayModeElement.addEventListener("input", onInputChanged);
  onInputChanged();

  function onInputChanged() {
    const texCode = texCodeElement.value;
    const useDisplayMode = useDisplayModeElement.checked;

    // clear shown error
    showError(null);

    // render TeX code into preview element
    const options: katex.Options = {
      strict: true,
      displayMode: useDisplayMode,
    };
    try {
      katex.render(texCode, previewElement, options);
    } catch (error) {
      if (error instanceof katex.ParseError) {
        showError(error.message);
        return;
      } else {
        throw error;
      }
    }
    updateShownMathMLCode();
  }

  function updateShownMathMLCode() {
    const mathElement = previewElement.querySelector("math");
    if (!mathElement) {
      outputElement.textContent = "\n";
      return;
    }

    // adjust the shown math element
    const shownMathElement = mathElement.cloneNode(true) as MathMLElement;
    shownMathElement.removeAttribute("xmlns");
    const shownMathElementContent = shownMathElement.querySelector(
      "semantics > :first-child",
    );
    shownMathElement.replaceChildren(shownMathElementContent!);

    outputElement.textContent = shownMathElement.outerHTML;
  }

  function showError(message: string | null) {
    if (!message) {
      // clear error
      texCodeElement.classList.remove("is-invalid");
      previewElement.replaceChildren();
      return;
    }

    // show error
    texCodeElement.classList.add("is-invalid");

    const messageElement = document.createElement("span");
    messageElement.classList.add("text-danger-emphasis");
    messageElement.classList.add("fw-semibold");
    messageElement.textContent = message;
    previewElement.replaceChildren(messageElement);
  }
});
