let tabsArr = []
let windowsArr = []
let webviewArr = []

// listens for onExtensionClick events
ext.runtime.onExtensionClick.addListener(async () => {
    console.log('Extension Clicked')
    
    // generate tab and window name
    const tabTitle = generateName()

    // create tab
    const tab = await ext.tabs.create({
        text: tabTitle
    })
    
    // create window
    const win = await ext.windows.create({
        title: tabTitle,
    })

    // push in array
    tabsArr.push(tab)
    windowsArr.push(win)

    // generate webview
    generateWebview(win, 1, true)
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

ext.windows.onUpdatedDarkMode.addListener((_event, mode) => {
    console.log('Update Theme Mode')

    if (tabsArr.length == 0 || webviewArr == 0) {
        return;
    }

    // remove all webview
    // change this start
    webviewArr.forEach((webview) => {
        ext.webviews.remove(webview.id)
    })
    webviewArr = []
    // change this end

    // regenerate webview
    windowsArr.forEach(async (win) => {
        generateWebview(win, mode.enabled ? 1 : 0)
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
    const url = `./app/index.html?mode=${darkMode}&name=${win.title.replaceAll(' ', '').replaceAll('#', '')}-${win.id}`
    await ext.webviews.loadURL(webviewOne.id, url)

    // focus on webview
    if (focus) {
        ext.webviews.focus(webviewOne.id)
    }

    webviewArr.push(webviewOne)
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
    // remove tab
    if (tab && tab.id) {
        await ext.tabs.remove(tab.id)
    }
    
    // remove window
    if (tab && tab.id) {
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