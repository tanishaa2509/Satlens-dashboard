export default function InfoBanner() {
  return (
    <div className="section" id="info-banner">
      <div className="info-banner">
        <span className="info-banner__icon">💡</span>
        <span className="info-banner__text">
          Choose input mode and select/upload images to begin detection
        </span>
      </div>

      <div className="instructions">
        <h4>📁 Directory Mode:</h4>
        <ul>
          <li>Set the scenes directory path in the sidebar</li>
          <li>
            Select Before (T1) and After (T2) images from dropdowns
          </li>
        </ul>

        <h4>📤 Upload Mode:</h4>
        <ul>
          <li>Upload Before and After images directly</li>
        </ul>

        <h4>🔆 RGB Enhancement:</h4>
        <ul>
          <li>
            Adjust <strong>lower/upper percentile</strong> sliders in sidebar to
            control contrast
          </li>
          <li>Default (2%–98%) works well for most images</li>
          <li>
            Lower values = more contrast, higher values = less contrast
          </li>
        </ul>
      </div>
    </div>
  );
}

