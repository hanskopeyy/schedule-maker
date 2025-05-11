import ReactDOM from 'react-dom/client'
import OverlayScrollbars from 'overlayscrollbars'

document.addEventListener('DOMContentLoaded', function () {
  const root = ReactDOM.createRoot(document.getElementById('root')!)

  OverlayScrollbars(document.body, {});
})