import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function TestQR() {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState({
    darkColor: '#000000',
    lightColor: '#FFFFFF',
    size: 300,
    margin: 4,
    errorCorrectionLevel: 'M'
  });

  // Fungsi update settings yang sederhana
  const handleSettingChange = (key, value) => {
    console.log(`Updating ${key}:`, value);
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Colors</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>QR Color: </label>
            <input
              type="color"
              value={settings.darkColor}
              onChange={(e) => handleSettingChange('darkColor', e.target.value)}
              style={{ width: '100px', height: '40px' }}
            />
          </div>
          <div>
            <label>Background: </label>
            <input
              type="color"
              value={settings.lightColor}
              onChange={(e) => handleSettingChange('lightColor', e.target.value)}
              style={{ width: '100px', height: '40px' }}
            />
          </div>
        </div>

        <div>
          <h3>Adjustments</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Size: {settings.size}px</label>
            <input
              type="range"
              min="100"
              max="500"
              value={settings.size}
              onChange={(e) => handleSettingChange('size', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Margin: {settings.margin}</label>
            <input
              type="range"
              min="0"
              max="10"
              value={settings.margin}
              onChange={(e) => handleSettingChange('margin', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <QRCodeSVG
          value={text || 'https://example.com'}
          size={settings.size}
          bgColor={settings.lightColor}
          fgColor={settings.darkColor}
          level={settings.errorCorrectionLevel}
          includeMargin={true}
          margin={settings.margin}
        />
      </div>
    </div>
  );
}

export default TestQR;
