// SPDX-License-Identifier: GPL-3.0-or-later
//
// popper's tests, with ERT: popups shown and hidden by popper-toggle and
// popper-cycle, as popper.el 0.4.8 does it. `make test` runs them in
// e8 --batch, as CI does.

import { ertDeftest, should, shouldEqual } from "ert";
import "popper";

/** Keys that type `text`, one character at a time, for executeKbdMacro. */
const typed = (text: string) => Array.from(text, (c) => (c === " " ? "SPC" : c)).join(" ");

/** Runs a command by M-x, answering its prompt with `answer` if given. */
function mx(command: string, answer?: string): void {
  e8.executeKbdMacro(`M-x ${typed(command)} RET${answer === undefined ? "" : ` ${typed(answer)} RET`}`);
}

/** The buffers in the frame's windows, in order. */
const shown = () => e8.windowList().map((w) => e8.windowBuffer(w) ?? "");

/**
 * Shows *Messages* with M-x display-buffer. E8 makes *Messages* when it is
 * shown, where Emacs's message makes it again once killed, and
 * display-buffer, as Emacs's, wants a buffer that exists.
 */
function showMessages(): void {
  e8.getBufferCreate("*Messages*");
  mx("display-buffer", "*Messages*");
}

/**
 * Starts afresh: one window on *scratch*, no *Messages* or *Help* from an
 * earlier test (killed, so popper sees new buffers), and popper-mode turned
 * on by M-x with `references` as popper-reference-buffers.
 */
function setup(references: e8.Value): void {
  if (e8.variable("popper-mode") === true) mx("popper-mode");
  e8.call("switch-to-buffer", "*scratch*");
  e8.call("delete-other-windows");
  for (const name of ["*Messages*", "*Help*"]) if (e8.getBuffer(name) !== undefined) e8.call("kill-buffer", name);
  e8.setVariable("popper-reference-buffers", references);
  mx("popper-mode");
  shouldEqual(e8.variable("popper-mode"), true, "popper-mode is on");
}

ertDeftest("popper-toggle-hides-and-shows-the-last-popup", () => {
  setup(["\\*Messages\\*$"]);
  e8.message("hello");
  showMessages();
  shouldEqual(shown(), ["*scratch*", "*Messages*"]);
  const line = e8.withCurrentBuffer("*Messages*", () => e8.formatModeLine(e8.variable("mode-line-format")));
  should(line.startsWith(" POP"), `a popup's mode line says POP: ${JSON.stringify(line)}`);
  mx("popper-toggle");
  shouldEqual(shown(), ["*scratch*"]);
  mx("popper-toggle");
  shouldEqual(shown(), ["*scratch*", "*Messages*"]);
  for (let i = 0; i < 3; i++) mx("popper-toggle");
  shouldEqual(shown(), ["*scratch*"]);
});

ertDeftest("popper-cycle-goes-through-the-popups-and-modes-name-them-too", () => {
  setup(["\\*Messages\\*$", "help-mode"]);
  e8.message("hello");
  showMessages();
  mx("popper-toggle");
  e8.executeKbdMacro(`C-h v ${typed("fill-column")} RET`);
  should(shown().includes("*Help*"), JSON.stringify(shown()));
  mx("popper-cycle");
  shouldEqual(shown(), ["*scratch*", "*Messages*"]);
  mx("popper-cycle");
  shouldEqual(shown(), ["*scratch*", "*Help*"]);
});

ertDeftest("popper-popups-with-hide-are-kept-from-showing", () => {
  setup([["\\*Messages\\*$", "hide"]]);
  e8.message("hello");
  showMessages();
  shouldEqual(shown(), ["*scratch*"]);
  mx("popper-toggle");
  shouldEqual(shown(), ["*scratch*", "*Messages*"]);
});
