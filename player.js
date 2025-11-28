
// MIT License
// Copyright (c) 2025 Dario Cangialosi
// see LICENSE.txt file in the root directory of this source tree

document.addEventListener("DOMContentLoaded", player_initialize)

function player_initialize() {
    var links = document.querySelectorAll("a[href]")
    const video_extensions = ["mp4", "webm"]
    const audio_extensions = ["mp3", "3gp", "ogg", "opus", "m4a", "flac", "wav", "mid", "xm"]
    const playable_extensions = audio_extensions.concat(video_extensions)
    const linksFilterCriterion = link =>
        playable_extensions.some(
            file_extension => link.href.endsWith(`.${file_extension}`)
        )
    links = Array.from(links).filter(linksFilterCriterion)
    for (var link_index in links) {
        link_index = parseInt(link_index)
        var link = links[link_index]

        link.classList.add("playable_link")

        // audio or video link
        if (audio_extensions.some(file_extension => link.href.endsWith(`.${file_extension}`))) {
            link.dataset.mediaType = "audio"
        }
        if (video_extensions.some(file_extension => link.href.endsWith(`.${file_extension}`))) {
            link.dataset.mediaType = "video"
        }

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
            // don't translate file extension
            link_title += "<span class='notranslate'>"
            link_title += " (" + file_extension + ")."
            link_title += "</span>"
        }
        link.innerHTML = link_title

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
        if (video_extensions.some(file_extension => link.href.endsWith(`.${file_extension}`))) {
            const button = document.createElement("button")
            button.innerText = "video"
            button.onclick = event => { location.assign(event.currentTarget.parentElement.href); return false }
            link.prepend(button)
        }

        // download link
        const download_link = document.createElement("a")
        download_link.download = ""
        download_link.classList.add("download_link")
        download_link.innerText = "⬇ copy"
        download_link.href = link.href
        link.after(download_link)

        link.next_link = links[link_index + 1]
        link.onclick = player_link_click

        function player_link_click(event) {
            const current_link_or_null = typeof current_link != "undefined" ? current_link : null;
            // if current link is the same as clicked link
            const same_link_clicked = this == current_link_or_null;
            const something_playing = !player_audio.paused || !player_video.paused
            if (same_link_clicked && something_playing) {
                // if same link clicked and media is playing, pause media
                player_audio.pause();
                player_video.pause();
            } else
                link_play(event.currentTarget);
            return !player_intercept.checked;
        }
    } // for link_index in links

    // initialize first link in playlist
    var first_link_overridden = false
    if (links.length >= 1) {
        player_feature.style.display = "block"
        window.first_link_in_playlist = links[0]
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
                first_link_overridden = true
            }
        }

        const autoplay_on_page_load = false
        if (autoplay_on_page_load || first_link_overridden) {
            // autoplay first link
            link_play(first_link_to_play, false)
        }
    }

    // when page loads

    player_video.onended = on_media_end
    player_audio.onended = on_media_end

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

} // player_initialize

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

    // is same link ?
    // if current_link is undefined, use null
    const current_link_or_null = typeof current_link != "undefined" ? current_link : null
    const same_link = link == current_link_or_null

    // same link const used to toggle play/pause on same link click .

    // if same link clicked and media is playing, pause media
    // else play media .

    // set current link to link
    current_link = link
    // add class to current link
    current_link.classList.add("current_link")
    // set now playing text to link text
    playing.innerText = link.innerText
    // set a "now-playing" document-title to link-title
    document.title = link.innerText

    // show audio or video player
    const media_type = link.dataset.mediaType
    // if media type is audio or video
    var player_active = null
    if (media_type == "audio") {
        // pause video player
        player_video.pause()
        // show audio player
        player_video.style.display = "none"
        player_audio.style.display = "block"
        // set active player to audio player
        player_active = player_audio
    } else if (media_type == "video") {
        // pause audio player
        player_audio.pause()
        // show video player
        player_audio.style.display = "none"
        player_video.style.display = "block"
        // set active player to video player
        player_active = player_video
    }

    // link href with spaces replaced by %20
    const link_href = link.href.replaceAll(" ", "%20")
    // is same media ?
    const same_media = player_active.src == link_href

    // if not same link or not same media
    if (!same_link || !same_media) {
        // set media source to link href
        player_active.src = link_href
    }
    // JSON link with data
    json_link()
    // play media in media player
    if (player_play) player_active.play()
}

// on audio/video media end, play next link
function on_media_end() {
    link_play({
        repeat: current_link,
        next: current_link.next_link,
        playlist: current_link.next_link || first_link_in_playlist,
    }[after.value])
}

// download links display css class and localStorage
function download_links_display(shown) {
    // save download links display state
    localStorage.download_links_display = shown
    // add or remove class to hide download links ( CSS class )
    const verb = shown ? "remove" : "add"
    document.body.classList[verb]("download_links_hide")
}

function ask_for_showing_download_links() {
    const shown = confirm("Show download links?")
    if (typeof player_download_links_shown != "undefined") {
        player_download_links_shown.checked = shown
    }
    download_links_display(shown)
}
