import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../ui/Button";

interface VariantPreviewProps {
  htmlContent: string;
  cssContent: string;
  title: string;
  frameClassName?: string;
  onVariantClick?: () => void;
}

export function VariantPreview({
  htmlContent,
  cssContent,
  title,
  frameClassName,
  onVariantClick
}: VariantPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const srcDoc = useMemo(
    () => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: white; color: #111827; }
          button, a, input, select, textarea, [role="button"] { cursor: pointer; }
          ${cssContent}
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `,
    [cssContent, htmlContent]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onVariantClick) {
      return undefined;
    }

    let removeListener: (() => void) | undefined;

    const bindClickListener = () => {
      removeListener?.();

      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        return;
      }

      const handleClick = () => {
        onVariantClick();
      };

      iframeDocument.addEventListener("click", handleClick);
      removeListener = () => iframeDocument.removeEventListener("click", handleClick);
    };

    bindClickListener();
    iframe.addEventListener("load", bindClickListener);

    return () => {
      removeListener?.();
      iframe.removeEventListener("load", bindClickListener);
    };
  }, [onVariantClick, srcDoc]);

  return (
    <>
      <div className="variant-preview">
        <div className="variant-header">
          <h3>{title}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(true)}>
            Enlarge view
          </Button>
        </div>
        <iframe
          ref={iframeRef}
          title={title}
          className={frameClassName ?? "variant-frame"}
          sandbox="allow-same-origin"
          srcDoc={srcDoc}
        />
      </div>
      {isExpanded ? (
        <div className="modal-backdrop" onClick={() => setIsExpanded(false)} role="presentation">
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{title}</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                Close
              </Button>
            </div>
            <iframe
              title={`${title} expanded`}
              className="variant-frame variant-frame-expanded"
              sandbox="allow-same-origin"
              srcDoc={srcDoc}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
