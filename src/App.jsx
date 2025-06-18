import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import './App.css';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
}

function App() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [settings, setSettings] = useState({
    darkColor: '#000000',
    lightColor: '#FFFFFF',
    size: 300,
    margin: 4,
    errorCorrectionLevel: 'M'
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [logo, setLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [shape, setShape] = useState('square'); // 'square' | 'rounded' | 'circle'
  const qrRef = useRef();
  const year = new Date().getFullYear();

  const handleSettingChange = (key, value) => {
    console.log(`Updating ${key}:`, value);
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    } else {
      setLogo(null);
      setLogoUrl('');
    }
  };

  // Tambahkan handler untuk shape
  const handleShapeChange = (e) => {
    setShape(e.target.value);
  };

  const downloadQR = () => {
    const canvas = document.createElement("canvas");
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = settings.size;
      canvas.height = settings.size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = settings.lightColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Terapkan shape pada hasil download
      if (shape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(settings.size / 2, settings.size / 2, settings.size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
      } else if (shape === 'rounded') {
        const radius = 16;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(settings.size - radius, 0);
        ctx.quadraticCurveTo(settings.size, 0, settings.size, radius);
        ctx.lineTo(settings.size, settings.size - radius);
        ctx.quadraticCurveTo(settings.size, settings.size, settings.size - radius, settings.size);
        ctx.lineTo(radius, settings.size);
        ctx.quadraticCurveTo(0, settings.size, 0, settings.size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();
      }
      ctx.drawImage(img, 0, 0);
      // Jika ada logo, gambar di tengah
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = settings.size * 0.2;
          const x = (settings.size - logoSize) / 2;
          const y = (settings.size - logoSize) / 2;
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          ctx.restore && ctx.restore();
          const a = document.createElement("a");
          a.download = "qr-code.png";
          a.href = canvas.toDataURL("image/png");
          a.click();
        };
        logoImg.src = logoUrl;
      } else {
        ctx.restore && ctx.restore();
        const a = document.createElement("a");
        a.download = "qr-code.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const generateQRCode = async () => {
    if (!text) {
      showToast('Please enter a URL', 'error');
      return;
    }

    setLoading(true);
    try {
      const options = {
        errorCorrectionLevel: settings.errorCorrectionLevel,
        margin: settings.margin,
        color: {
          dark: settings.darkColor,
          light: settings.lightColor
        },
        width: settings.size
      };

      const qrDataUrl = await QRCode.toDataURL(text, options);
      setQrCode(qrDataUrl);
      showToast('QR Code generated successfully!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (text) {
      generateQRCode();
    }
  }, [settings, text]);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/favicon.svg" alt="Favicon Logo" className="logo" style={{ width: 40, height: 40 }} />
            <span className="brand-name">QR Code Pro</span>
          </div>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-to-use" className="nav-link">How to Use</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h1>Create Professional QR Codes</h1>
          <p className="hero-description">Generate high-quality QR codes for your business, personal use, or marketing campaigns.</p>
        </section>

        <div className="container">
          <div className="input-group">
            <label htmlFor="qr-input" className="input-label">Enter your text or URL</label>
            <input 
              id="qr-input"
              type="text" 
              placeholder="https://your-website.com" 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="text-input"
            />
          </div>

          <div className="options">
            <div className="color-picker-group">
              <h3 className="options-title">Customize Colors</h3>
              <div className="color-picker">
                <label htmlFor="qr-color">QR Color</label>
                <input 
                  id="qr-color"
                  type="color" 
                  value={settings.darkColor}
                  onChange={(e) => handleSettingChange('darkColor', e.target.value)}
                  style={{ width: '100px', height: '40px', cursor: 'pointer', opacity: 1 }}
                />
                <span className="color-value">{settings.darkColor}</span>
              </div>
              <div className="color-picker">
                <label htmlFor="bg-color">Background Color</label>
                <input 
                  id="bg-color"
                  type="color" 
                  value={settings.lightColor}
                  onChange={(e) => handleSettingChange('lightColor', e.target.value)}
                  style={{ width: '100px', height: '40px', cursor: 'pointer', opacity: 1 }}
                />
                <span className="color-value">{settings.lightColor}</span>
              </div>
            </div>

            <div className="controls-group">
              <h3 className="options-title">Adjust Settings</h3>
              <div className="size-slider">
                <label htmlFor="size-range">Size: {settings.size}x{settings.size}px</label>
                <input 
                  id="size-range"
                  type="range" 
                  min="100" 
                  max="500" 
                  step="10"
                  value={settings.size} 
                  onChange={(e) => handleSettingChange('size', Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
              <div className="margin-slider">
                <label htmlFor="margin-range">Margin: {settings.margin} blocks</label>
                <input 
                  id="margin-range"
                  type="range" 
                  min="0" 
                  max="10" 
                  value={settings.margin}
                  onChange={(e) => handleSettingChange('margin', Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
              <div className="error-correction">
                <label>Error Correction Level</label>
                <select 
                  value={settings.errorCorrectionLevel}
                  onChange={(e) => handleSettingChange('errorCorrectionLevel', e.target.value)}
                  className="select-input"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
              <div className="logo-upload" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <label htmlFor="logo-input" className="upload-label" style={{ fontWeight: 500, marginBottom: 4 }}>
                  Upload Logo (optional)
                </label>
                <input 
                  id="logo-input"
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="file-input"
                  style={{ padding: 0, border: 'none', background: 'none' }}
                />
                {logoUrl && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={logoUrl} alt="Logo Preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain', background: '#fff', border: '1px solid #eee', boxShadow: '0 1px 4px #0001' }} />
                    <span style={{ fontSize: 13, color: '#555' }}>{logo?.name}</span>
                    <button type="button" onClick={() => { setLogo(null); setLogoUrl(''); }} style={{ marginLeft: 8, background: '#eee', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  </div>
                )}
              </div>
              <div className="shape-selector" style={{ marginTop: 16 }}>
                <label htmlFor="shape-select" className="options-title" style={{ display: 'block', marginBottom: 8 }}>
                  QR Code Shape
                </label>
                <select 
                  id="shape-select"
                  value={shape}
                  onChange={handleShapeChange}
                  className="select-input"
                  style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h3 className="preview-title">Preview</h3>
            <div className="qr-preview-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div className="qr-container" ref={qrRef} style={{ 
                position: 'relative', 
                display: 'inline-block', 
                background: '#fff', 
                padding: 16, 
                borderRadius: shape === 'rounded' ? '16px' : shape === 'circle' ? '50%' : '0',
                boxShadow: '0 2px 12px #0002', 
                marginBottom: 8,
                overflow: 'hidden'
              }}>
                <QRCodeSVG
                  value={text || 'https://example.com'}
                  size={settings.size}
                  bgColor={settings.lightColor}
                  fgColor={settings.darkColor}
                  level={settings.errorCorrectionLevel}
                  includeMargin={true}
                  margin={settings.margin}
                  style={{ 
                    borderRadius: shape === 'rounded' ? '16px' : shape === 'circle' ? '50%' : '0',
                    overflow: 'hidden'
                  }}
                />
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: settings.size * 0.2,
                      height: settings.size * 0.2,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      borderRadius: '12px',
                      objectFit: 'contain',
                      background: '#fff',
                      boxShadow: '0 1px 6px #0002',
                      border: '2px solid #eee',
                      zIndex: 2
                    }}
                  />
                )}
              </div>
              <button 
                className="download-btn"
                onClick={downloadQR}
                disabled={!text}
                style={{ marginTop: 0, zIndex: 1 }}
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>

        <section id="features" className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Generation</h3>
              <p>Create QR codes instantly with real-time preview</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Customizable</h3>
              <p>Personalize colors and size to match your brand</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>High Quality</h3>
              <p>Download high-resolution QR codes in PNG format</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Error Correction</h3>
              <p>Choose error correction levels for better reliability</p>
            </div>
          </div>
        </section>

        <section id="how-to-use" className="how-to-use-section">
          <h2>How to Use</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Enter Content</h3>
              <p>Type or paste your text, URL, or data in the input field</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Customize</h3>
              <p>Adjust colors, size, and error correction level as needed</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Download</h3>
              <p>Click the download button to save your QR code</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About QR Code Pro</h3>
            <p>A professional QR code generator for all your needs. Create customized QR codes quickly and easily.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-to-use" className="footer-link">How to Use</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <a href="mailto:josinbahaswan@gmail.com" className="footer-link">josinbahaswan@gmail.com</a>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="https://github.com/JosinBahaswan" className="social-link">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {year} QR Code Pro. All rights reserved.</p>
        </div>
      </footer>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

export default App;
