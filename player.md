# player.js Documentation

A lightweight HTML5 media player that transforms anchor links into a playable playlist.

## Overview

`player.js` scans the DOM for links pointing to media files and converts them into an interactive playlist with audio/video playback controls.

## Supported File Formats

**Audio:** mp3, 3gp, ogg, opus, m4a, flac, wav, mid, xm

**Video:** mp4, webm

## How It Works

1. On `DOMContentLoaded`, the script finds all `<a>` elements with `href` attributes
2. Filters links that point to supported media file extensions
3. Enhances each link with:
   - A `playable_link` CSS class
   - A `data-media-type` attribute (`audio` or `video`)
   - Numbered prefix (e.g., `  1.`, `  2.`)
   - File extension displayed in parentheses (e.g., `song (mp3).`)
   - A download link button
   - For video files: a "video" button to open in browser

## Required HTML Elements

The script expects these elements to exist in the HTML:

| Element ID | Type | Purpose |
|------------|------|---------|
| `player_audio` | `<audio>` | Audio playback element |
| `player_video` | `<video>` | Video playback element |
| `player_feature` | any | Container shown when playlist exists |
| `player_intercept` | `<input type="checkbox">` | Controls link interception behavior |
| `playing` | any | Displays "now playing" text |
| `after` | `<select>` | Playback mode selector (repeat/next/playlist) |
| `link_to_current_playable` | `<a>` | Link to current track with state |
| `player_download_links_shown` | `<input type="checkbox">` | Toggle download links visibility |

## Functions

### `player_initialize()`
Main initialization function called on DOM ready. Sets up the playlist and event handlers.

### `link_play(link, player_play = true)`
Plays the specified link. Parameters:
- `link` - The anchor element to play
- `player_play` - Whether to auto-start playback (default: true)

### `on_media_end()`
Handler for when media finishes. Behavior depends on `after.value`:
- `repeat` - Replay current track
- `next` - Play next track (stops at end)
- `playlist` - Play next track, loop to start

### `json_link()`
Updates `link_to_current_playable` with a shareable URL containing the current track and playback settings.

### `download_links_display(shown)`
Shows or hides download links. State is persisted in `localStorage`.

### `ask_for_showing_download_links()`
Prompts the user to show/hide download links via `confirm()` dialog.

## URL Hash Feature

The player supports deep linking via URL hash with JSON payload:

```
#JSON:{"keyword":"song.mp3","after":"playlist"}
```

- `keyword` - Substring to match against link URLs (sets initial track)
- `after` - Playback mode to set

## CSS Classes

| Class | Applied To | Purpose |
|-------|------------|---------|
| `playable_link` | Links | Marks playable media links |
| `current_link` | Link | Currently playing track |
| `link_numbering` | Span | Track number prefix |
| `download_link` | Links | Download button |
| `download_links_hide` | Body | Hides download links when present |
| `notranslate` | Span | Prevents translation of file extensions |

## localStorage Keys

- `download_links_display` - Persists download links visibility preference (`"true"` or `"false"`)

## License

MIT License - Copyright (c) 2025 Dario Cangialosi
