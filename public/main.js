let tabsArr = []
let windowsArr = []
let webviewArr = []
let websessionArr = []
// let persistenceArr = {}
let isContinue = true

// listens for onExtensionClick events
ext.runtime.onExtensionClick.addListener(async () => {
    console.log('Extension Clicked')

    // prevent continue if not yet done all codes on this function
    if (!isContinue) {
        return
    }

    isContinue = false

    const darkMode = await ext.windows.getPlatformDarkMode() ? 1 : 0 // get dark mode
    const tabTitle = generateName() // generate tab and window name

    // create tab
    const tab = await ext.tabs.create({
        text: tabTitle,
        icon: getWinIcon(darkMode),
    })
    
    // create window
    const win = await ext.windows.create({
        title: tabTitle,
        icon: getWinIcon(darkMode),
    })

    // push in array
    tabsArr.push(tab)
    windowsArr.push(win)

    // create the websession
    const myWebsession = await ext.websessions.create({ 
        partition: win.title,
        persistent: true,
        global: false,
        cache: true
    })

    websessionArr.push(myWebsession)

    // persistenceArr[win.id] = Math.random().toString(36).substring(2) // set to have unique persistent name
    const winSize = await ext.windows.getSize(win.id) // get window size

    // create webviews
    const webviewOne = await ext.webviews.create({
        window: win,
        websession: myWebsession,
        bounds: { x: 0, y: 0, width: winSize.width, height: winSize.height },
        // bounds: { x: 0, y: 0, width: winSize.width - 15, height: winSize.height - 40 },
        autoResize: { width: true, height: true },
    })
    
    await generateWebviewURL(webviewOne.id, win.title, darkMode) // load webview
    ext.webviews.focus(webviewOne.id) // focus on webview
    webviewArr.push(webviewOne)

    isContinue = true
})

// listen for tab click event
ext.tabs.onClicked.addListener(async (_event, tab) => {
    if (tab && tab.id) {
        console.log('Tab '+ tab.text +' Clicked')

        await ext.windows.restore(tab.id) // un-minimize the window
        await ext.windows.focus(tab.id) // bring window to front and focus it
    }
}) 

// listen for click events on the tab's close button
ext.tabs.onClickedClose.addListener((_event, tab) => {
    console.log('Tab Closed Clicked')
    removeTabWindow(_event)
})

// listen for window close events
ext.windows.onClosed.addListener((_event, tab) => {
    console.log('Window Closed Clicked')
    removeTabWindow(_event)
})

// listen on dark mode update
ext.windows.onUpdatedDarkMode.addListener((_event, mode) => {
    console.log('Update Theme Mode')

    if (webviewArr.length == 0) {
        return;
    }
    
    const darkMode = mode.enabled ? 1 : 0;
    
    // reset loadURL
    webviewArr.forEach(async (webviewOne, index) => {
        const win = windowsArr[index]
        
        // update window
        ext.windows.update(win.id, {
            icon: getWinIcon(darkMode)
        })
        
        // update tabs
        ext.tabs.update(win.id, {
            icon: getWinIcon(darkMode)
        })

        await generateWebviewURL(webviewOne.id, win.title, darkMode)
    })
})

// load webview URL
generateWebviewURL = async (id, name, darkMode) => {
    const persistenceName = name.replaceAll(' ', '').replaceAll('#', '')
    const url = `./index.html?mode=${darkMode}&name=${persistenceName}`
    
    await ext.webviews.loadURL(id, url)

    // add EXT link in HELP menu
    setTimeout(async () => {
        await ext.webviews.executeJavaScript(id, `
            var elems = document.querySelectorAll('.tlui-help-menu > button');
            
            var a = document.createElement('a');
            a.href = 'https://ext.store/';
            /* a.target = "_blank"; */
            a.title = 'View EXT Store';
            a.className = 'tlui-button tlui-button__normal tlui-menu__button';
            
            var text = document.createTextNode('View EXT Store');
            a.appendChild(text);

            elems[0].onclick = (e) => {
                var grpElem = document.querySelectorAll('.tlui-menu__group');
                grpElem[0].appendChild(a);
            }
        `);
    }, 500)
}

// generate tab and window title
generateName = () => {
    let currNum = 1;
    let arr = []

    tabsArr.forEach((value) => {
        const num = parseInt(value.text.split("#")[1])
        arr.push(num)
    })

    while(arr.indexOf(currNum) > -1) {
        currNum++;
    }
        
    return 'TLDraw - #'+currNum
}

// remove tab, window, webview and session base on id
removeTabWindow = async (tab) => {
    // remove tab, window, webview and session
    if (tab && tab.id) {
        await ext.tabs.remove(tab.id)
        await ext.windows.remove(tab.id)
        await ext.webviews.remove(tab.id)
        await ext.websessions.remove(tab.id)
    }

    // remove from array
    tabsArr = tabsArr.filter((value) => {
        return tab.id !== value.id
    })

    windowsArr = windowsArr.filter((value) => {
        return tab.id !== value.id
    })

    webviewArr = webviewArr.filter((value) => {
        return tab.id !== value.id
    })

    websessionArr = websessionArr.filter((value) => {
        return tab.id !== value.id
    })
}

// get icon
getWinIcon = (darkMode) => {
    return darkMode == 1 ? 'icon-dark.png' : 'icon.png'
}