# Paperlane

> A calm, local-first Markdown editor with live preview and export.

Paperlane is a small, browser-based studio for writing and reading Markdown without an account, installation, or cloud sync. Open it on a computer or in a modern browser on Android or iOS, write or import a Markdown file, then read it in a polished live preview or export it for offline reading.

## Why Paperlane?

Many Markdown apps put accounts, workspaces, sync, and subscriptions between you and a simple document. Paperlane takes the other path: a focused tool that works immediately.

- No sign-up and no account
- No server or cloud sync
- Your working documents stay in your browser
- Open Markdown files from your computer or mobile device
- Read Markdown as rich, formatted text
- Export to Markdown, print-ready PDF, or EPUB eBook

It is useful when you want a quick, pleasant way to read a `.md` file online, write a note without installing anything, or turn Markdown into an ebook or PDF that can be read offline in the reader of your choice.

## Features

- Split-screen Markdown editor and live rendered preview on desktop
- Purpose-built mobile experience with a file drawer and editor/preview switcher
- Local autosave using browser storage
- Import `.md`, `.markdown`, and plain-text files
- Markdown, PDF, and EPUB export
- Separate typeface choices for writing and reading
- Familiar Markdown formatting shortcuts and toolbar actions

## Use it

Paperlane has no build step or dependencies to install.

1. Download or clone this repository.
2. Open `index.html` in a modern desktop browser, or open the hosted app in a modern Android or iOS browser.
3. Start writing, or choose **Open markdown** to load an existing file.

Your documents are saved locally in that browser. To move a document elsewhere, export it as Markdown, PDF, or EPUB.

### Export formats

- **Markdown** downloads the original source file.
- **PDF** opens your browser's print dialog, where you can select **Save as PDF**.
- **EPUB** creates a lightweight eBook file that can be opened with compatible ebook readers.

## Privacy and data

Paperlane is intentionally local-first. It does not require sign-in and does not send your documents to an application server. Autosaved documents live in the browser's local storage, so clearing browser site data will remove them. Keep exports of anything important.

## Technology

Paperlane is a simple static web app built with HTML, CSS, and vanilla JavaScript. It uses [Marked](https://marked.js.org/) to render Markdown and [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize the rendered HTML.

## License

Paperlane is released under the [MIT License](LICENSE).
