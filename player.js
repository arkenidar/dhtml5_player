// filter with trick :
// any of the extensions with Array.prototype.some()
function anyArgumentsSome(itemToFilter, functionToApply, argumentsIterable) {
    return argumentsIterable.some(
        argument => functionToApply(itemToFilter, argument));
}
// filter by file extensions
const linksFilterCriterion = itemToFilter => anyArgumentsSome(
    itemToFilter,
    (link, fileExtension) => link.href.endsWith("." + fileExtension),
    ["mp3", "mp4", "webm", "3gp", "ogg", "opus", "m4a"]
);

document.addEventListener("DOMContentLoaded", () => {
    var links = document.querySelectorAll("a[href]")
    links = Array.from(links).filter(linksFilterCriterion)
    for (var link_index in links) {
        link_index = parseInt(link_index)
        var link = links[link_index]

        link.classList.add("playable_link")

        link.prepend(document.createTextNode(" " + (link_index + 1) + ". "))

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
        link.onclick = event => { play(event.target); return !player_intercept.checked }
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
        play(first_link_to_play, false)
    }
})
function json_link() {
    // custom link in location.hash
    var json_data = { keyword: current_link.href, after: after.value }
    var URI = '#' + 'JSON:' + JSON.stringify(json_data)
    link_to_current_playable.href = encodeURI(URI)
}
function play(link, player_play = true) {
    if (typeof link == "undefined") return
    if (typeof current_link != "undefined")
        current_link.classList.remove("current_link")
    current_link = link
    current_link.classList.add("current_link")
    playing.innerText = link.innerText
    player.src = link.href
    // JSON link with data
    json_link()
    // play media in media player
    if (player_play) player.play()
}
player.onended =
    event =>
        play({
            repeat: current_link,
            next: current_link.next_link,
            playlist: current_link.next_link || first_link_in_playlist,
        }[after.value])

// download links display logic
function download_links_display(shown) {
    // save download links display state
    localStorage.download_links_display = shown
    // add or remove class to hide download links
    const verb = shown ? "remove" : "add"
    document.body.classList[verb]("download_links_hide")
}

if (typeof player_download_links_shown != "undefined") {
    // download links checkbox oninput
    player_download_links_shown.oninput = function () {
        const shown = this.checked
        download_links_display(shown)
    }
    // download links checkbox onload
    if (localStorage.getItem("download_links_display") != null) {
        player_download_links_shown.checked = localStorage.download_links_display == "true"
    }
    download_links_display(player_download_links_shown.checked)
}

function ask_for_showing_download_links() {
    const shown = confirm("Show download links?")
    if (typeof player_download_links_shown != "undefined") {
        player_download_links_shown.checked = shown
    }
    download_links_display(shown)
}
