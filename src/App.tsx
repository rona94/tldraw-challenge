import React from 'react';
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import './App.css'

interface App {
  mode: boolean
}

function App() {
  const path = window.location.search.substring(1).split('&')
  let arrs:any = {};

  path.forEach((value) => {
    const val = value.split('=')
    arrs = {
      ...arrs,
      [val[0]]: val[1]
    }
  })

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        onMount={editor => {
          editor.setDarkMode(arrs.mode == 1 || false)
        }}
        persistenceKey={arrs.name || ""}
      />
		</div>
  );
}

export default App;