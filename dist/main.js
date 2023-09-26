let tabsArr = []
let tabTitle = "TLDraw"
let windowsArr = []

// listens for onExtensionClick events
ext.runtime.onExtensionClick.addListener(async () => {
    const tab = await ext.tabs.create({
        mutable: true, // we want to render the mute button
        muted: false // we want to start with sound ON
    })
    const tabNum = tab.id

    const win = await ext.windows.create({
        title: tabTitle + ' - #'+tabNum,
    })
    
    // update tab title
    ext.tabs.update(
        tab.id,
        { text: tabTitle + ' - #'+tabNum }
    )

    const windowOneSize = await ext.windows.getSize(win.id)

    tabsArr.push(tab)
    windowsArr.push(win)

    // create the webview
    webviewOne = await ext.webviews.create({
        window: win,
        bounds: { x: 0, y: 0, width: windowOneSize.width - 15, height: windowOneSize.height - 35 },
        autoResize: { width: true, height: true },
    })

    await ext.webviews.loadURL(webviewOne.id, './app/index.html')

    // focus on webview
    ext.webviews.focus(webviewOne.id)
})

// listen for tab click event
ext.tabs.onClicked.addListener(async (_event, tab) => {
    if (tab && tab.id) {
        await ext.windows.restore(tab.id) // un-minimize the window
        await ext.windows.focus(tab.id) // bring window to front and focus it
    }
}) 

// listen for click events on the tab's close button
ext.tabs.onClickedClose.addListener(async (_event, tab) => {
    removeTabWindow(tab)
})

// listen for window close events
ext.windows.onClosed.addListener(async (_event, tab) => {
    removeTabWindow(_event)
})

removeTabWindow = async (tab) => {
    // remove tab
    if (tab && tab.id) {
        console.log('di me')
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