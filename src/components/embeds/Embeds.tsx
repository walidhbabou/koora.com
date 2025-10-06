import React from "react";

// Instagram Embed using react-instagram-embed
export const InstagramEmbed: React.FC<{ url: string }> = ({ url }) => {
  // Extract post shortcode from URL
  const match = url.match(/instagram\.com\/(?:p|tv|reel)\/([\w-]+)/);
  const shortcode = match ? match[1] : null;
  if (!shortcode) {
    return (
      <div className="generic-embed error">
        <p>لا يمكن عرض منشور إنستغرام</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="embed-link">مشاهدة على إنستغرام</a>
      </div>
    );
  }
  // Official Instagram embed HTML
  return (
    <div className="embed-container" style={{ margin: '20px 0', textAlign: 'center' }}>
      <iframe
        src={`https://www.instagram.com/p/${shortcode}/embed`}
        width="400"
        height="480"
        frameBorder="0"
        scrolling="no"
        allowTransparency={true}
        allow="encrypted-media"
        style={{ borderRadius: 8, maxWidth: '100%' }}
        title="Instagram Post"
      ></iframe>
      <div className="embed-caption">
        <a href={url} target="_blank" rel="noopener noreferrer" className="embed-link">مشاهدة على إنستغرام</a>
      </div>
    </div>
  );
};

// Twitter/X Embed
function normalizeTwitterUrl(url: string): string {
  return url.replace("https://x.com", "https://twitter.com");
}

export const XEmbed: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => {
  const normalizedUrl = normalizeTwitterUrl(url);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as Window & { twttr?: { widgets?: { load?: () => void } } };
    if (!document.getElementById("twitter-wjs")) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        if (win.twttr && win.twttr.widgets && typeof win.twttr.widgets.load === "function") {
          win.twttr.widgets.load();
        }
      };
      document.body.appendChild(script);
    } else if (win.twttr && win.twttr.widgets && typeof win.twttr.widgets.load === "function") {
      win.twttr.widgets.load();
    }
  }, [normalizedUrl]);

  return (
    <div style={{ margin: "20px 0", maxWidth: "550px", marginLeft: "auto", marginRight: "auto" }}>
      <blockquote key={normalizedUrl} className="twitter-tweet" data-theme="light">
        <a href={normalizedUrl} aria-label="مشاهدة التغريدة على تويتر">رابط التغريدة</a>
      </blockquote>
      {caption && (
        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "8px", color: "#666" }}>
          {caption}
        </p>
      )}
    </div>
  );
};