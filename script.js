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

//variables
let boldInstances = new Set()
let italicInstances = new Set()
let underlineInstances = new Set()

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

    setTimeout(()=>{tools.style.visiblity = "hidden";tools.style.opacity = "0"}, 100)

    optcon.style.pointerEvents = "none"
    bold.style.pointerEvents = "none"
    italic.style.pointerEvents = "none"
    underline.style.pointerEvents = "none"
    open = false
})

bold.addEventListener("click", (e) => {
    if(document.getSelection().direction == "none") return

    let [start, end] = formatRange()

    let selectedInstances = new Set([...Array(end - start).keys()].map(x => x + start))
    let beforeFormatting = [boldInstances, italicInstances, underlineInstances]
    boldInstances = boldInstances.symmetricDifference(selectedInstances)

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

//internal functions
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

function getPlainText(text){
    text = text.replaceAll("<b>", "")
    text = text.replaceAll("</b>", "")
    text = text.replaceAll("<i>", "")
    text = text.replaceAll("</i>", "")
    text = text.replaceAll("<u>", "")
    text = text.replaceAll("</u>", "")
    let i = 0
    while(text.indexOf(`<p id="t${i}">`) >= 0){
        text = text.replace(`<p id="t${i}">`, "")
        i++
    }
    text = text.replaceAll("</p>", "")
    return text
}

function formatRange(){
    let start, end
    let sel = window.getSelection()
    if(bodytext.innerHTML == getPlainText(bodytext.innerHTML)){
        if(sel.direction == "forward"){
        start = (sel.direction == "forward")
                ? sel.anchorOffset
                : sel.focusOffset + 1
        end = (sel.direction == "forward")
                ? sel.focusOffset
                : sel.anchorOffset
        }
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

function expandFormatArea(boldBefore, italicBefore, underlineBefore){
    text = bodytext.innerHTML
    let i = 0
    //understand this and add comments
    //new lines, and deleting stuff doesn't work
    //btw backward selection still isn't made
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

            boldTemp.forEach((t)=>{
                if(document.getSelection().anchorNode.parentElement.id == `t${i}` &&
                (i <= t && t < i + document.getSelection().anchorOffset) &&
                !boldBefore.has(i)){
                    boldInstances.delete(t)
                }
                else if(t > i){
                    boldInstances.delete(t)
                }
                console.log(boldInstances)
            })
            console.log
            boldTemp.forEach((t)=>{
                if(t > i){
                    boldInstances.add(t + (j - j0 - 1))
                    console.log(boldInstances)
                }
            })
            if(!boldBefore.has(i) && boldTemp.has(i)){
                boldInstances.add(i + j - j0 - 1)
            }
            else if(boldTemp.has(i)){
                for(k = 1; k < j - j0; k++){
                    boldInstances.add(i + k)
                    console.log(boldInstances)
                }
            }

            italicTemp.forEach((t)=>{
                if(t > i){
                    italicInstances.delete(t)
                }
                if(t == i && !italicBefore.has(i)){
                    italicInstances.delete(t)
                }
            })
            italicTemp.forEach((t)=>{
                if(t > i){
                    italicInstances.add(t + (j - j0 - 1))
                }
            })
            if(italicTemp.has(i)){
                for(k = 1; k < j - j0 + 1; k++){
                    italicInstances.add(i + k)
                }
            }

            underlineTemp.forEach((t)=>{
                if(t > i){
                    underlineInstances.delete(t)
                }
                if(t == i && !underlineBefore.has(i)){
                    underlineInstances.delete(t)
                }
            })
            underlineTemp.forEach((t)=>{
                if(t > i){
                    underlineInstances.add(t + (j - j0 - 1))
                }
            })
            if(underlineTemp.has(i)){
                for(k = 1; k < j - j0 + 1; k++){
                    underlineInstances.add(i + k)
                }
            }
        }
        i++
    }
}