
// MIT License
// Copyright (c) 2025 Dario Cangialosi
// see LICENSE.txt file in the root directory of this source tree

document.addEventListener("DOMContentLoaded", player_initialize)

function player_initialize() {
    var links = document.querySelectorAll("a[href]")
    const linksFilterCriterion = link =>
        ["mp3", "mp4", "webm", "3gp", "ogg", "opus", "m4a", "wav", "mid", "xm"].some(
            file_extension => link.href.endsWith(`.${file_extension}`)
        )
    links = Array.from(links).filter(linksFilterCriterion)
    for (var link_index in links) {
        link_index = parseInt(link_index)
        var link = links[link_index]

        link.classList.add("playable_link")

        // feature : link title
        var link_title = link.innerText

        // remove file extension from link title
        // and add it in parentheses at the end of link title
        // e.g. "song.mp3" -> "song (mp3)."
        // e.g. "video.mp4" -> "video (mp4)."

        // if link title has file extension
        // e.g. "song.mp3" -> "song"
        // e.g. "video.mp4" -> "video"
        // find last dot in link title
        // and check if it is a file extension dot

        // if last dot is at position -2 or less from end
        // and at position -7 or more from end
        // then it is a file extension dot
        // e.g. "song.mp3" -> last dot is at position -4 from end
        // e.g. "video.mp4" -> last dot is at position -4 from end

        // if link title has file extension
        const file_extension_dot_index = link_title.lastIndexOf(".") // last dot
        var is_file_extension_dot = file_extension_dot_index >= 0
        const last_dot_position = file_extension_dot_index - link_title.length // position of last dot
        is_file_extension_dot &&= (last_dot_position <= -2 && last_dot_position >= -7) // not last character
        // if link title has file extension
        // remove file extension from link title
        // and add it in parentheses at the end of link title
        // e.g. "song.mp3" -> "song (mp3)."
        // e.g. "video.mp4" -> "video (mp4)."
        if (is_file_extension_dot) {
            const file_name = link_title.slice(0, file_extension_dot_index)
            const file_extension = link_title.slice(file_extension_dot_index + 1)
            link_title = file_name
            link_title += " (" + file_extension + ")."
        }
        link.innerText = link_title

        // feature : link number
        const link_number = (link_index + 1).toString().padStart(3, " ") + "." // 3 digits
        const link_number_span = document.createElement("span")
        link_number_span.classList.add("link_numbering")
        // replace space with non-breaking space
        link_number_span.innerHTML = link_number.replaceAll(" ", "&nbsp;")
        link_number_span.style.fontFamily = "monospace" // monospace font
        // prepend link number to link
        link.prepend(link_number_span)

        // if ends with mp4 or webm
        if (link.href.endsWith(".mp4") || link.href.endsWith(".webm")) {
            const button = document.createElement("button")
            button.innerText = "video"
            button.onclick = event => { location.assign(event.target.parentElement.href); return false }
            link.prepend(button)
        }

        // download link
        const download_link = document.createElement("a")
        download_link.download = ""
        download_link.classList.add("download_link")
        download_link.innerText = "⬇copy"
        download_link.href = link.href
        link.after(download_link)

        link.next_link = links[link_index + 1]
        link.onclick = player_link_click

        function player_link_click(event) { link_play(event.target); return !player_intercept.checked }
    }
    if (links.length >= 1) {
        player_feature.style.display = "block"
        first_link_in_playlist = links[0]
        var first_link_to_play = first_link_in_playlist
        // custom first link in location.hash
        if (location.hash.startsWith("#")) {
            var hash = location.hash.slice(1)
            hash = decodeURIComponent(hash)

            // default keyword to filter by
            var first_link_override = undefined
            if (hash.startsWith("JSON:")) {
                hash = hash.slice(5)
                // if hash is a JSON string
                try {
                    // parse JSON string
                    var hash_json = JSON.parse(hash)
                    // if JSON string has keyword property
                    if (typeof hash_json.keyword != "undefined") {
                        first_link_override = links.filter(link => link.href.includes(hash_json.keyword))[0]
                    }
                    // if JSON string has after property
                    if (typeof hash_json.after != "undefined") {
                        after.value = hash_json.after
                    }
                } catch (error) {
                    console.error(hash, error)
                }
            }
            if (typeof first_link_override != "undefined") {
                first_link_to_play = first_link_override
            }
        }
        link_play(first_link_to_play, false)
    }
}
function json_link() {
    // custom link in location.hash
    var json_data = { keyword: current_link.href, after: after.value }
    var URI = '#' + 'JSON:' + JSON.stringify(json_data)
    link_to_current_playable.href = encodeURI(URI)
}
function link_play(link, player_play = true) {
    if (typeof link == "undefined") {
        console.error("No playable link found.")
        return
    }
    // if link is A element
    if (typeof link == "object" && link.tagName != "A") {
        // if link is not an A element, error out
        //console.error("Expected an A element, but got:", link)
        //console.dir(link)
        if (link.parentElement.tagName == "A") {
            // if link is a child of an A element, use the parent A element
            link = link.parentElement
        } else {
            // if link is not an A element, return
            console.error("No playable link found in parent A element.")
            console.dir(link)
            return
        }
    }
    if (typeof link.href == "undefined") {
        console.error("No playable 'link.href' found.")
        console.dir(link)
        return
    }
    if (typeof current_link != "undefined")
        current_link.classList.remove("current_link")
    current_link = link
    current_link.classList.add("current_link")
    playing.innerText = link.innerText
    player.src = link.href.replaceAll(" ", "%20")
    // JSON link with data
    json_link()
    // play media in media player
    if (player_play) player.play()
}
player.onended =
    event =>
        link_play({
            repeat: current_link,
            next: current_link.next_link,
            playlist: current_link.next_link || first_link_in_playlist,
        }[after.value])

// download links display css class and localStorage
function download_links_display(shown) {
    // save download links display state
    localStorage.download_links_display = shown
    // add or remove class to hide download links ( CSS class )
    const verb = shown ? "remove" : "add"
    document.body.classList[verb]("download_links_hide")
}

// when page loads

// if download links checkbox exists
if (typeof player_download_links_shown != "undefined") {
    // download links checkbox oninput , when changed
    player_download_links_shown.oninput = function () {
        const shown = this.checked
        download_links_display(shown)
    }
    // download links checkbox onload , when page loads
    let shown = player_download_links_shown.checked
    // if download links display state is saved
    if (localStorage.getItem("download_links_display") != null) {
        // get saved download links display state
        shown = localStorage.download_links_display == "true"
    }
    // set download links display state
    player_download_links_shown.checked = shown
    // download links display css class and localStorage
    download_links_display(shown)
}

// download links display onload
// default download links display state
let shown = true
// if download links display state is saved
if (localStorage.getItem("download_links_display") != null) {
    // get saved download links display state
    shown = localStorage.download_links_display == "true"
}
// download links display css class and localStorage
download_links_display(shown)

function ask_for_showing_download_links() {
    const shown = confirm("Show download links?")
    if (typeof player_download_links_shown != "undefined") {
        player_download_links_shown.checked = shown
    }
    download_links_display(shown)
}
