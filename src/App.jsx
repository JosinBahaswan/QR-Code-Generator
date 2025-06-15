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
  const qrRef = useRef();
  const year = new Date().getFullYear();

  const handleSettingChange = (key, value) => {
    console.log(`Updating ${key}:`, value);
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
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
      ctx.drawImage(img, 0, 0);
      
      const a = document.createElement("a");
      a.download = "qr-code.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
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
            </div>
          </div>

          <div className="preview-section">
            <h3 className="preview-title">Preview</h3>
            <div className="qr-container" ref={qrRef}>
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
            <button 
              className="download-btn"
              onClick={downloadQR}
              disabled={!text}
            >
              Download QR Code
            </button>
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
