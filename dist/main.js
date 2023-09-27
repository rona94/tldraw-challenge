let tabsArr = []
let windowsArr = []
let webviewArr = []
let persistenceArr = {}
let isContinue = true

// listens for onExtensionClick events
ext.runtime.onExtensionClick.addListener(async () => {
    console.log('Extension Clicked')

    // prevent continue if not yet done all codes on this function
    if (!isContinue) {
        return
    }

    isContinue = false

    // get dark mode
    const darkMode = await ext.windows.getPlatformDarkMode() ? 1 : 0
    
    // generate tab and window name
    const tabTitle = generateName()

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

    // set to have unique persistent name
    persistenceArr[win.id] = Math.random().toString(36).substring(2)

    // generate webview
    const webviewOne = await generateWebview(win, darkMode, true)
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

    if (tabsArr.length == 0 || webviewArr == 0) {
        return;
    }

    // regenerate webview
    const windowIds = []
    const darkMode = mode.enabled ? 1 : 0;
    windowsArr.forEach((win, index) => {
        windowIds.push(win.id)

        const webviewOne = generateWebview(win, darkMode)

        ext.webviews.remove(webviewArr[index].id) // remove old webview
        webviewArr[index] = webviewOne // replace new webview in array
    })

    // update window
    ext.windows.update(windowIds, {
        icon: getWinIcon(darkMode)
    })
    
    // update tabs
    ext.tabs.update(windowIds, {
        icon: getWinIcon(darkMode)
    })
})

// generate webview
generateWebview = async (win, darkMode = 1, focus = false) => {
    const winSize = await ext.windows.getSize(win.id)

    const webviewOne = await ext.webviews.create({
        window: win,
        bounds: { x: 0, y: 0, width: winSize.width - 15, height: winSize.height - 35 },
        autoResize: { width: true, height: true },
    })

    // load webview
    const persistenceName = win.title.replaceAll(' ', '').replaceAll('#', '') +'-'+ win.id +'-'+ persistenceArr[win.id]
    const url = `./app/index.html?mode=${darkMode}&name=${persistenceName}`
    ext.webviews.loadURL(webviewOne.id, url)

    // focus on webview
    if (focus) {
        ext.webviews.focus(webviewOne.id)
    }

    return webviewOne
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

// remove tab and window base on id
removeTabWindow = async (tab) => {
    // remove tab and window
    if (tab && tab.id) {
        await ext.tabs.remove(tab.id)
        await ext.windows.remove(tab.id)
    }

    // remove from array
    tabsArr = tabsArr.filter((value) => {
        return tab.id !== value.id
    })

    windowsArr = windowsArr.filter((value) => {
        return tab.id !== value.id
    })
}

// get icon
getWinIcon = (darkMode) => {
    return darkMode == 1 ? 'icon-dark.png' : 'icon.png'
}