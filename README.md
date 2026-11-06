# e8-popper

Popups for [E8](https://github.com/e8-editor/e8): buffers you name, such as `*Messages*`, help or a REPL, become popups that one key hides and shows again, the last one first, and another key cycles through. A port of [popper](https://github.com/karthink/popper) 0.4.8.

## Installing

In `~/.config/e8/init.ts`:

```ts
e8.usePackage("e8-editor/e8-popper");
e8.setVariable("popper-reference-buffers", ["\\*Messages\\*$", "help-mode", "compilation-mode"]);
e8.call("popper-mode");
e8.defineKey("global-map", "C-`", "popper-toggle");
e8.defineKey("global-map", "M-`", "popper-cycle");
```

E8 installs it at its newest version tag into `repos/` beside `init.ts`, records the commit in `e8-lock.json`, and requires it. `M-x package-vc-upgrade` brings it up to date. Pin a version with `{ rev: "v0.1.0" }`. It needs E8 0.3.1 or newer.

Popper binds no keys of its own: pick yours, as above.

## Using it

With `popper-mode` on:

- `popper-toggle`: hide the popup shown last, or show the one hidden last. With `C-u`, show the next popup beside the open one; with `C-u C-u`, hide them all, or show all of the group when none is open.
- `popper-cycle`, `popper-cycle-backwards`: hide the open popup and show the next (or the one before).
- `popper-toggle-type`: make the current buffer a popup, or a popup a regular buffer.
- `popper-kill-latest-popup`: kill the popup shown last and take its window away.

Variables:

- `popper-reference-buffers`: what is a popup. Each entry is a regexp a buffer's name matches, a major mode (a name ending in `-mode`), or a function of the buffer's name. An entry `[entry, "hide"]` makes those buffers popups that do not show when they open, until `popper-toggle` brings them up.
- `popper-group-function`: how popups are grouped, so that toggling and cycling only see the current group's. `null` for one group; `"popper-group-by-project"` or `"popper-group-by-directory"`.
- `popper-mode-line`: what a popup's mode line starts with, ` POP` by default, and `popper-mode-line-position`, where it goes; `null` for nothing.
- `popper-display-control`: `true` (the default) for popper to show popups itself, `null` to leave it to `display-buffer`.
- `popper-open-popup-hook`: run in a popup's buffer when popper shows it.

## Differences from popper.el

- E8 has no `display-buffer-alist` or side windows, so a popup shows where `pop-to-buffer` puts it, not in a window along the bottom of the frame, and `popper-window-height` and `popper-display-function` are not there.
- `popper-echo.el` (`popper-echo-mode` and `popper-tab-line-mode`), which list the popups, is not ported.
- Popups are ordered by when popper saw each shown, as E8 keeps no `buffer-display-time`.
- Of the grouping functions, only `popper-group-by-project` and `popper-group-by-directory` are there.

## Credit

This is a port to E8 of [popper](https://github.com/karthink/popper) 0.4.8, by Karthik Chikmagalur, copyright the Free Software Foundation, and distributed in GNU ELPA, under the GNU General Public License version 3 or later. It is not the upstream authors' work as published, and they do not endorse it: report problems with the port here, not upstream.

## Developing

With an E8 on your PATH (a [release](https://github.com/e8-editor/e8/releases), or built from source) and TypeScript 5.8 or newer:

```bash
make test
make types
```

The tests in `test/popper-tests.ts` turn `popper-mode` on and check which buffers the frame's windows show as popups are displayed, toggled and cycled, that a popup's mode line starts with ` POP`, and that popups marked `"hide"` stay hidden until toggled.

## Licence

GPL-3.0-or-later: see `LICENSE`.
