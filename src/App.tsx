import React, { useState, useEffect } from 'react';
import { Tldraw, getDefaultColorTheme } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import './App.css'

interface App {
  mode: boolean
}

function App() {
  const [oldKey, setOldKey] = useState('')
  const [settings, setSettings] = useState({mode: null, name: null})

  const onLoad = () => {
    const path = window.location.search.substring(1).split('&')
    let arrs:any = {};

    path.forEach((value) => {
      const val = value.split('=')
      arrs = {
        ...arrs,
        [val[0]]: val[1]
      }
    })

    setSettings(arrs)
  }

  const handleKeyDown = (e:any) => {
    const newKey = e.key
    
    if(newKey == 'Control') {
      setOldKey(newKey)
    }
    else if (oldKey != newKey && newKey == '/') { // do on ctrl + / click
      const darkMode = settings.mode == 1 ? 'dark' : 'light'

      // assign default theme mode in container class
      var container:any = document.querySelectorAll('.tl-container')
      container[0].classList.remove('tl-theme__light')
      container[0].classList.remove('tl-theme__dark')

      container[0].classList.add('tl-theme__'+darkMode)
      container[0].setAttribute('data-color-mode', darkMode)

      // assign default theme mode color
      var colorPaletteBtn = document.querySelectorAll('.tlui-layout__top__right .tlui-style-panel__section__common .tlui-button-grid button')
      var colorPalette:any = getDefaultColorTheme({ isDarkMode: settings.mode == 1 })

      for (let index = 0; index < colorPaletteBtn.length; index++) {
        const button: any = colorPaletteBtn[index];
        button.style.color = colorPalette[button.getAttribute('aria-label')].solid;
      }
    }
  }

  const handleKeyUp = () => {
    setOldKey('')
  }

  useEffect(() => {
    onLoad()
  }, [])

  useEffect(() => {
    if (settings.mode !== null || settings.name !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    }
  }, [settings])
  

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        onMount={editor => {
          editor.setDarkMode(settings.mode == 1 || false)
        }}
        persistenceKey={settings.name || ""}
      />
		</div>
  );
}

export default App;