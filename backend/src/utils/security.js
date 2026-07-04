const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /\son\w+=(?:"[^"]*"|'[^']*')/gi;
const JAVASCRIPT_URL_REGEX = /javascript:/gi;

export const sanitizeMarkup = (value = "") =>
  value
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(EVENT_HANDLER_REGEX, "")
    .replace(JAVASCRIPT_URL_REGEX, "");

export const buildVariantDocument = ({ htmlContent, cssContent }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #ffffff;
          color: #111827;
        }
        ${sanitizeMarkup(cssContent)}
      </style>
    </head>
    <body>
      ${sanitizeMarkup(htmlContent)}
    </body>
  </html>
`;
