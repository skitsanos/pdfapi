# PDF API Web Server

> **⚠️ Archived Project**: This project is no longer maintained. PhantomJS has been deprecated since 2018. For modern HTML-to-PDF conversion, consider using [Puppeteer](https://pptr.dev/) or [Playwright](https://playwright.dev/).

A lightweight REST API server for generating PDF documents from HTML content, built on PhantomJS.

## Overview

PDF API accepts HTML content via HTTP POST requests and renders it into downloadable PDF documents using PhantomJS's WebKit rendering engine.

## Requirements

- [PhantomJS](http://phantomjs.org/)
- [Nginx](http://nginx.com/)

## Supported Content Types

| Content Type | Description |
|--------------|-------------|
| `text/plain` | Raw HTML as plain text |
| `text/html` | Standard HTML content |
| `application/json` | HTML with page configuration options |

## Usage

### Basic Request

Send HTML content directly:

```bash
curl -X POST -H "Content-Type: text/html" \
  -d "<h1>Hello World</h1>" \
  http://your-server/api
```

### Advanced Request with Configuration

For custom page formatting, use JSON:

```json
{
  "content": "<h1>Your HTML content</h1>",
  "pageSize": "A4",
  "orientation": "portrait",
  "margin": {
    "left": "2.5cm",
    "right": "2.5cm",
    "top": "2.5cm",
    "bottom": "1cm"
  },
  "header": {
    "height": "0.9cm",
    "content": ""
  },
  "footer": {
    "height": "0.9cm",
    "content": "<div style=\"text-align:center;\"><small>Page %%pageNumber of %%totalPages</small></div>"
  }
}
```

### Dynamic Variables

Use these placeholders in headers and footers:

- `%%pageNumber` - Current page number
- `%%totalPages` - Total number of pages

## Server Configuration

### Nginx Setup

Add this rule to serve generated PDFs:

```nginx
location /get {
    alias /path/to/temp_files;
}
```

### Automatic Cleanup

Remove generated files older than 10 minutes via cron:

```bash
*/10 * * * * find /path/to/temp_files/ -mmin +10 -exec rm {} \;
```

## License

MIT

## Author

[@skitsanos](https://github.com/skitsanos)
