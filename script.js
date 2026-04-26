//elements
var save = document.querySelector("#save")
var bodytext = document.querySelector("#bodytext")
var options = document.querySelector("#options")
var line = document.querySelector("#line")
var tools = document.querySelector("#tools")
var optcon = document.querySelector("#optionContainer")
var optionbg = document.querySelector("#optionbg")

var format = document.querySelectorAll(".format")
var [bold, italic, underline] = format

//instances
let boldInstances = new Set()
let italicInstances = new Set()
let underlineInstances = new Set()

//is formatting open?
let open = false

//event listeners
save.addEventListener("click", (e) => {
    document.cookie = bodytext.innerHTML

    save.style.backgroundColor = "rgb(212, 254, 164)"
    bodytext.style.backgroundColor = "rgb(236, 255, 231)"
    bodytext.style.borderColor = "rgb(212, 254, 164)"
    setTimeout(() => {
        save.style.backgroundColor = "rgb(254, 239, 164)"
        bodytext.style.backgroundColor = "rgb(255, 249, 231)"
        bodytext.style.borderColor = "rgb(254, 239, 164)"},
    400)
})

//show tools
options.addEventListener("mouseover", (e) => {
    optionbg.style.backgroundColor = "rgb(254, 239, 164)"
    optionbg.style.height = "80px"
    tools.style.top = "-20px"
    tools.style.opacity = "1"

    tools.style.visibility = "visible"

    format.forEach((el)=>{
        el.style.color = "rgb(241, 205, 24)"
        el.style.backgroundColor = "rgb(255, 249, 231)"
    })
    
    //check if selected already has instances
    if(document.getSelection().direction != "none"){
        if(bodytext.innerHTML != getPlainText(bodytext.innerHTML)){
            let [start, end] = formatRange()
            const selected = new Set([...Array(end - start).keys()].map(i => i + start))

            if(selected.isSubsetOf(boldInstances)){
                bold.style.backgroundColor = "rgb(241, 205, 24)"
                bold.style.color = "rgb(255, 249, 231)"
            }
            if(selected.isSubsetOf(italicInstances)){
                italic.style.backgroundColor = "rgb(241, 205, 24)"
                italic.style.color = "rgb(255, 249, 231)"
            }
            if(selected.isSubsetOf(underlineInstances)){
                underline.style.backgroundColor = "rgb(241, 205, 24)"
                underline.style.color = "rgb(255, 249, 231)"
            }
        }
    }

    optcon.style.pointerEvents = "auto"
    bold.style.pointerEvents = "auto"
    italic.style.pointerEvents = "auto"
    underline.style.pointerEvents = "auto"
    open = true
})

optcon.addEventListener("mouseout", (e) => {
    if(!open || optcon.contains(e.relatedTarget)) return

    optionbg.style.backgroundColor = "transparent"
    optionbg.style.height = "20px"
    tools.style.top = "-40px"

    //wait for animation to work
    setTimeout(()=>{tools.style.visiblity = "hidden";tools.style.opacity = "0"}, 100)

    optcon.style.pointerEvents = "none"
    bold.style.pointerEvents = "none"
    italic.style.pointerEvents = "none"
    underline.style.pointerEvents = "none"
    open = false
})

//append formatting to instances
bold.addEventListener("click", (e) => {
    if(document.getSelection().direction == "none") return

    let [start, end] = formatRange()

    let selectedInstances = new Set([...Array(end - start).keys()].map(x => x + start))
    let beforeFormatting = [boldInstances, italicInstances, underlineInstances]
    boldInstances = boldInstances.symmetricDifference(selectedInstances)
    console.log(boldInstances)

    expandFormatArea(...beforeFormatting)

    loadEffects()
})

italic.addEventListener("click", (e) => {
    if(document.getSelection().direction == "none") return

    let [start, end] = formatRange()

    let selectedInstances = new Set([...Array(end - start).keys()].map(x => x + start))
    let beforeFormatting = [boldInstances, italicInstances, underlineInstances]
    italicInstances = italicInstances.symmetricDifference(selectedInstances)

    expandFormatArea(...beforeFormatting)

    loadEffects()
})

underline.addEventListener("click", (e) => {
    if(document.getSelection().direction == "none") return

    let [start, end] = formatRange()
    
    let selectedInstances = new Set([...Array(end - start).keys()].map(x => x + start))
    let beforeFormatting = [boldInstances, italicInstances, underlineInstances]
    underlineInstances = underlineInstances.symmetricDifference(selectedInstances)

    expandFormatArea(...beforeFormatting)

    loadEffects()
})

//pageload
bodytext.innerHTML = document.cookie

//apply formatting to bodytext
function loadEffects(){
    let text = getPlainText(bodytext.innerHTML)
    const plainText = text

    //how much formatting was inserted
    let previous = 0

    for(i = 0; i < plainText.length; i++){
        if(boldInstances.has(i)){
            text = text.slice(0,previous+i) + "<b>" + plainText.charAt(i) + 
            "</b>" + text.slice(previous+i+1)
            previous += 3
        }
        if(italicInstances.has(i)){
            text = text.slice(0,previous+i) + "<i>" + plainText.charAt(i) + 
            "</i>" + text.slice(previous+i+1)
            previous += 3
        }
        if(underlineInstances.has(i)){
            text = text.slice(0,previous+i) + "<u>" + plainText.charAt(i) + 
            "</u>" + text.slice(previous+i+1)
            previous += 3
        }

        text = text.slice(0,previous+i) + `<p id="t${i}">` + plainText.charAt(i) + 
        "</p>" + text.slice(previous+i+1)
        previous += 14 + i.toString().length

        if(boldInstances.has(i)){
            previous += 4
        }
        if(italicInstances.has(i)){
            previous += 4
        }
        if(underlineInstances.has(i)){
            previous += 4
        }
    }

    bodytext.innerHTML = text
}

//extract plain text without formatting
function getPlainText(text){
    text = text.replaceAll("<b>", "")
    text = text.replaceAll("</b>", "")
    text = text.replaceAll("<i>", "")
    text = text.replaceAll("</i>", "")
    text = text.replaceAll("<u>", "")
    text = text.replaceAll("</u>", "")
    while(text.indexOf("</p>") >= 0){
        i = parseInt(text.slice(text.indexOf('<p id="t' + 8), text.indexOf(">") - 1))
        text = text.replace(`<p id="t${i}">`, "")
        text = text.replace("</p>", "")
        i++
    }
    return text
}

//return selected text to format
function formatRange(){
    let start, end
    let sel = window.getSelection()
    if(bodytext.innerHTML == getPlainText(bodytext.innerHTML)){
        start = (sel.direction == "forward")
                ? sel.anchorOffset
                : sel.focusOffset
        end = (sel.direction == "forward")
                ? sel.focusOffset
                : sel.anchorOffset
    }
    else{
        start = parseInt(((sel.direction == "forward")
                        ? sel.anchorNode
                        : sel.focusNode)
                        .parentElement.id.slice(1))
        end = parseInt(((sel.direction == "forward")
                        ? sel.focusNode
                        : sel.anchorNode)
                        .parentElement.id.slice(1)) + 1
    }

    return [start, end]
}

//TODO: load formatting from cookies
//TODO: support new lines

//handle text written within formatting area
function expandFormatArea(boldBefore, italicBefore, underlineBefore){
    text = bodytext.innerHTML
    let i = 0
    while(text.indexOf(`<p id="t${i}">`) >= 0){
        const j0 = text.indexOf(`<p id="t${i}">`) + 10 + i.toString().length
        let j = text.indexOf("</p>", j0)

        //if content inside was modified
        if(j - j0 > 1){
            //temps: instances before modified here
            //befores: instances before modified elsewhere
            const boldTemp = new Set([...boldInstances].sort())
            const italicTemp = new Set([...italicInstances].sort())
            const underlineTemp = new Set([...underlineInstances].sort())

            let start = document.getSelection().anchorOffset
            //TODO: fix to support backward selection

            boldTemp.forEach((t)=>{
                //if selection start includes this and this isn't supposed to be modified,
                //and formatting for its sibiling element was done directly prior to this
                if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                (i <= t && t < i + start) &&
                !boldBefore.has(i)){
                    boldInstances.delete(t)
                }
                else if(t > i){
                    boldInstances.delete(t)
                }
            })
            //add newly formatted indexes excluding intrinsic unselected ones
            if(boldTemp.has(i)){
                for(k = 0; k < j - j0; k++){
                    if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                    (k < start) &&
                    !boldBefore.has(i)){
                        continue
                    }
                    boldInstances.add(i + k)
                }
            }
            //pushes back existing instances
            boldTemp.forEach((t)=>{
                if(t > i){
                    boldInstances.add(t + (j - j0 - 1))
                }
            })

            italicTemp.forEach((t)=>{
                //if selection start includes this and this isn't supposed to be modified,
                //and formatting for its sibiling element was done directly prior to this
                if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                (i <= t && t < i + start) &&
                !italicBefore.has(i)){
                    italicInstances.delete(t)
                }
                else if(t > i){
                    italicInstances.delete(t)
                }
            })
            //add newly formatted indexes excluding intrinsic unselected ones
            if(italicTemp.has(i)){
                for(k = 0; k < j - j0; k++){
                    if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                    (k < start) &&
                    !italicBefore.has(i)){
                        continue
                    }
                    italicInstances.add(i + k)
                }
            }
            //pushes back existing instances
            italicTemp.forEach((t)=>{
                if(t > i){
                    italicInstances.add(t + (j - j0 - 1))
                }
            })

            underlineTemp.forEach((t)=>{
                //if selection start includes this and this isn't supposed to be modified,
                //and formatting for its sibiling element was done directly prior to this
                if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                (i <= t && t < i + start) &&
                !underlineBefore.has(i)){
                    underlineInstances.delete(t)
                }
                else if(t > i){
                    underlineInstances.delete(t)
                }
            })
            //add newly formatted indexes excluding intrinsic unselected ones
            if(underlineTemp.has(i)){
                for(k = 0; k < j - j0; k++){
                    if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                    (k < start) &&
                    !underlineBefore.has(i)){
                        continue
                    }
                    underlineInstances.add(i + k)
                }
            }
            //pushes back existing instances
            underlineTemp.forEach((t)=>{
                if(t > i){
                    underlineInstances.add(t + (j - j0 - 1))
                }
            })
        }
        i++
    }
}

//handle text removed within formatting area
function shrinkFormatArea(boldBefore, italicBefore, underlineBefore){
    text = bodytext.innerHTML
    let maxp
    while(text.indexOf("<p id=t") > 0){
        wherep = text.indexOf("<p id=t")
        maxp = parseInt(text.slice(wherep + 8, text.indexOf(">", text.indexOf(wherep+8)) - 1))
    }
    let i = 0
    while(i <= maxp){
        if(text.indexOf(`<p id="t${i}">`) < 0){
            const boldTemp = new Set([...boldInstances])
            const italicTemp = new Set([...italicInstances])
            const underlineTemp = new Set([...underlineInstances])

            boldTemp.forEach((t)=>{
                if(t > i){
                    boldInstances.delete(t)
                    boldInstances.add(t-1)
                }
            })
        }
        i++
    }
}