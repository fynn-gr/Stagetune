'use strict'

import { app, protocol, BrowserWindow, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import {Howl, Howler} from 'howler';
const path = require('path')
const fs = require('fs')
//const utils = require('./utils')

const isDevelopment = process.env.NODE_ENV !== 'production'
const LOG = console.log
const os = process.platform
const settings = {
  "paths": [
      "/Volumes/T7/Files extern/Alte Schule/Messias/Messias Musik",
      "/Volumes/T7/Files extern/Alte Schule/Memes"
  ],
  "lastPlaylist": "/Volumes/T7/Files extern/Alte Schule/Messias/Messias Musik/MessiasPlaylist.json",
  "loop": false
}
var playlistPath = settings.lastPlaylist
const menuTemplate = [
  //app menu
  {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  //playlist
  {
    label: 'Playlist',
    submenu: [
      { label: 'New Playlist', accelerator: 'Command+N' },
      { label: 'Open', accelerator: 'Command+O'},
      { label: 'Save', accelerator: 'Command+S' },
      { label: 'Save as', accelerator: 'Command+Shift+S' },
    ]
  },
  //view
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  //window
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' },
    ]
  },
]
const menu = Menu.buildFromTemplate(menuTemplate)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  //load  html or dev server page
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    //if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

//init finished
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  //utils.getFiles(settings.paths)
  Menu.setApplicationMenu(menu)
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
