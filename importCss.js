function importCss(filename,as) {
    var obj = {}
    function getStyleSheet(unique_title) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (sheet.title == unique_title) {
                return sheet.rules;
            }
        }
    }
    function uniqueid() {
        var idstr = String.fromCharCode(Math.floor((Math.random() * 25) + 65));
        do {
            var ascicode = Math.floor((Math.random() * 42) + 48);
            if (ascicode < 58 || ascicode > 64) {
                idstr += String.fromCharCode(ascicode);
            }
        } while (idstr.length < 32);
        return (idstr);
    }
    function sanitizeStyleRules(text, temp) {
        const result = text.match(/{([^}]+)}/g)
            .map(res => res.replace(/{|}/g, ''))[0]
        const ruleArray = result.split(";")
        var styleArray = ruleArray.filter(v => {
            let t = v.replace(/\s/g, '').length
            if (t.length !== 1) {
                return t
            }
        })
        styleArray.forEach(styleArr => {
            [property, value] = styleArr.split(":")
            property=property.replace(/"/g,"").trim()
            value=value.replace(/"/g,"").trim()
            temp[property] = value
        })
    }
    return fetch(filename.toString().trim()).then(res => {
        return res.text().then(data => {
            var textCss = data
            var style = document.createElement("style")
            style.innerHTML = textCss
            var unique_id = uniqueid()
            style.title = unique_id
            var fontIndex = 0
            var ruleIndex = 0
            var keyIndex = 0
            var supportIndex = 0
            var mediaIndex = 0

            document.head.append(style)
            var styleRawArray = [...getStyleSheet(unique_id)]
            style.remove()
            styleRawArray.forEach(v => {
                var tempObj = {}
                if (v.type === 3) {
                    tempObj[v.href] = v.cssText.replace(/"/g,"'")
                    if (!obj["@import"]) {
                        obj["@import"] = []
                        obj["@import"].push(tempObj)
                    } else {
                        obj["@import"].push(tempObj)
                    }
                }
                else if (v.type === 4) {
                    let text = ""
                    var cssRule = [...v.cssRules]
                    cssRule.forEach(v => {
                        var tempMedia = {}
                        text = v.cssText
                        sanitizeStyleRules(text, tempMedia)
                        if (v.selectorText in tempObj) {
                            tempObj[`${v.selectorText}_${mediaIndex}`] = tempMedia
                            mediaIndex++
                        } else {
                            tempObj[v.selectorText] = tempMedia
                        }

                    })


                    if (`@media ${v.media[0]}` in obj) {
                        obj[`@media ${v.media[0]}_${mediaIndex}`] = tempObj
                        mediaIndex++
                    } else {
                        obj[`@media ${v.media[0]}`] = tempObj
                    }
                }
                else if (v.type === 7) {
                    var keyArray = v
                    for (const key in keyArray) {
                        if (!isNaN(parseInt(key))) {
                            var tempMedia = {}
                            var cssRule = keyArray[key]
                            text = cssRule.cssText
                            sanitizeStyleRules(text, tempMedia)

                            if (cssRule.keyText in tempObj) {
                                tempObj[`${cssRule.keyText}_${keyIndex}`] = tempMedia
                                keyIndex++
                            } else {
                                tempObj[cssRule.keyText] = tempMedia
                            }
                        }
                    }
                    if (`@keyframes ${v.name}` in obj) {
                        obj[`@keyframes ${v.name}_${keyIndex}`] = tempObj
                        keyIndex++
                    } else {
                        obj[`@keyframes ${v.name}`] = tempObj
                    }

                }
                else if (v.type === 12) {
                    let text = ""
                    var cssRule = [...v.cssRules]
                    cssRule.forEach(v => {
                        var tempMedia = {}
                        text = v.cssText
                        sanitizeStyleRules(text, tempMedia)

                        if (v.selectorText in tempObj) {
                            tempObj[`${v.selectorText}_${supportIndex}`] = tempMedia
                            supportIndex++
                        } else {
                            tempObj[v.selectorText] = tempMedia
                        }

                    })

                    if (`@supports ${v.conditionText}` in obj) {
                        obj[`@supports ${v.conditionText}_${supportIndex}`] = tempObj
                        supportIndex++
                    } else {
                        obj[`@supports ${v.conditionText}`] = tempObj
                    }
                }
                else {
                    var text = v.cssText
                    sanitizeStyleRules(text, tempObj)
                    if (v.type === 1) {
                        if (v.selectorText in obj) {
                            obj[`${v.selectorText}_${ruleIndex}`] = tempObj
                            ruleIndex++
                        } else {
                            obj[`${v.selectorText}`] = tempObj
                        }
                    }
                    if (v.type === 5) {
                        if ("@font-face" in obj) {
                            obj[`@font-face_${fontIndex}`] = tempObj
                            fontIndex++
                        } else {
                            obj["@font-face"] = tempObj
                        }
                    }

                }
            })
            if(as === "json"){
                return JSON.stringify(obj)
            }
            return obj
        }).catch(err => {
            console.log(err)
        })
    })
}
