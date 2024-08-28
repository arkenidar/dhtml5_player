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
    ["mp3", "mp4", "webm", "3gp", "ogg", "opus"]
);

document.addEventListener("DOMContentLoaded", () => {
    var links = document.querySelectorAll("a[href]")
    links = Array.from(links).filter(linksFilterCriterion)
    for (var link_index in links) {
        link_index = parseInt(link_index)
        var link = links[link_index]

        link.classList.add("playable_link")

        link.next_link = links[link_index + 1]
        link.onclick = event => { play(event.target); return !player_intercept.checked }
    }
    if (links.length >= 1) {
        player_feature.style.display = "block"
        play(links[0], true) //player.stop()
    }
})
function play(link, stop = false) {
    if (typeof link == "undefined") return
    if (typeof current_link != "undefined")
        current_link.classList.remove("current_link")
    current_link = link
    current_link.classList.add("current_link")
    playing.innerText = link.innerText
    player.src = link.href
    if (!stop) player.play()
}
player.onended = event => {
    if (after.value == "stop") return
    else if (after.value == "next")
        play(current_link.next_link)
    else if (after.value == "repeat")
        play(current_link)
}
