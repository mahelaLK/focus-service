import React from 'react'
import FocusPicker from './pages/FocusPicker'
import ErrorScreen from './components/ErrorScreen'

const App = () => {

  const params   = new URLSearchParams(window.location.search);
  const domain   = params.get('d');
  const filename = params.get('f');
  const width    = parseInt(params.get('w'));
  const height   = parseInt(params.get('h'));
  const callback = params.get('callback');

  const missing = [];
  if (!domain)         missing.push('d (domain)');
  if (!filename)       missing.push('f (filename)');
  if (!width || isNaN(width))   missing.push('w (width)');
  if (!height || isNaN(height)) missing.push('h (height)');
  if (!callback)       missing.push('callback');

  if (missing.length > 0) {
    return (
      <ErrorScreen
        title="Missing URL Parameters"
        message={`Required parameters missing: ${missing.join(', ')}`}
        example="?d=primestone.com.fj&f=3-175004601416.jpg&w=300&h=600&callback=https://primestone.com.fj/api/receive-thumbnail"
      />
    );
  }

  return (
    <FocusPicker
      domain={domain}
      filename={filename}
      width={width}
      height={height}
      callback={callback}
    />
  )
}

export default App