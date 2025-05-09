import * as htmlToImage from 'html-to-image'

export const Utils = {
  // Util to capture a div and screenshot it to clipboard/file
  screenshotElementById: async (elementId, action, characterName) => {
    const isMobileOrSafari = Utils.isMobileOrSafari()
    const repeatLoadBlob = async () => {
      const minDataLength = 1200000
      const maxAttempts = isMobileOrSafari ? 9 : 3
      const scale = 1.5
      const w = 1068 * scale
      const h = 856 * scale

      const options = {
        pixelRatio: 1,
        height: h,
        canvasHeight: h,
        width: w,
        canvasWidth: w,
        skipAutoScale: true,
        style: {
          zoom: scale,
        },
        skipFonts: true, // TODO: remove once html-to-image gets patched (c.f. https://github.com/bubkoo/html-to-image/issues/508)?
      }

      let i = 0
      let blob

      while (i < maxAttempts) {
        i++
        blob = await htmlToImage.toBlob(document.getElementById(elementId), options)

        if (blob.size > minDataLength) {
          break
        }
      }

      if (isMobileOrSafari) {
        // Render again
        blob = await htmlToImage.toBlob(document.getElementById(elementId), options)
      }

      return blob
    }

    function handleBlob(blob) {
      const prefix = characterName || 'Hsr-optimizer'
      const date = new Date().toLocaleDateString(currentLocale()).replace(/[^apm\d]+/gi, '-')
      const time = new Date().toLocaleTimeString(currentLocale()).replace(/[^apm\d]+/gi, '-')
      const filename = `${prefix}_${date}_${time}.png`

      if (action == 'clipboard') {
        if (isMobileOrSafari) {
          const file = new File([blob], filename, { type: 'image/png' })
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: '',
              text: '',
            })
          } else {
            Message.error('Unable to save screenshot to clipboard, try the download button to the right')
            // 'Unable to save screenshot to clipboard, try the download button to the right'
          }
        } else {
          try {
            const data = [new window.ClipboardItem({ [blob.type]: blob })]
            navigator.clipboard.write(data).then(() => {
              Message.success(i18next.t('charactersTab:ScreenshotMessages.ScreenshotSuccess'))// 'Copied screenshot to clipboard'
            })
          } catch (e) {
            console.error(e)
            Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
            // 'Unable to save screenshot to clipboard, try the download button to the right'
          }
        }
      }

      if (action == 'download') {
        const fileUrl = window.URL.createObjectURL(blob)
        const anchorElement = document.createElement('a')
        anchorElement.href = fileUrl
        anchorElement.download = filename
        anchorElement.style.display = 'none'
        document.body.appendChild(anchorElement)
        anchorElement.click()
        anchorElement.remove()
        window.URL.revokeObjectURL(fileUrl)
        Message.success(i18next.t('charactersTab:ScreenshotMessages.DownloadSuccess')) // 'Downloaded screenshot'
      }
    }

    return new Promise((resolve) => {
      repeatLoadBlob().then((blob) => {
        handleBlob(blob)
        resolve()
      })
    })
  },
}