### PDF API Web Server


PDF Generation Web Served made on top of PahntomJS (http://phantomjs.org/). PhantomJS is a headless WebKit scriptable with a JavaScript API. It has fast and native support for various web standards: DOM handling, CSS selector, JSON, Canvas, and SVG.

#### Requirements
+ [PhantomJS](http://hantomjs.org/)
+ [Nginx](http://nginx.com/)

*pdfapi* accepts POST HTTP requests with HTML content and renders PDF document out of it. Only the follwoing Content Types are supported:
+ text/plain
+ text/html
+ application/json

Any other Content Type will be rejected by _pdfapi_ web server.

#### Page Formatting

_application/json_ was added to support more complex configuration, such like custom headers and footers. When you post  HTTP request, please make sure that the following JSON message is sent to _pdfapi_ REST API:

```javascript
    {
      content: 'your HTML content goes here',
      pageSize: 'A4',
      orientation: 'portrait',
      margin: {left: '2.5cm', right: '2.5cm', top: '2.5cm', bottom: '1cm'},
      header: {height: '0.9cm', content: ''},
      footer: {height: '0.9cm', content: '<div style="text-align:center;"><small>%%pageNumber/%%totalPages</small></div>'}
    }
```

Notice _%%pageNumber/%%totalPages_. You can use _%%pageNumber_ and/or _%%totalPages_ anywhere in the header or the footer content area and _pdfapi_ will turn them into numbers during the PDF rendering.

When _text/plain_ or _text/html_ Content Type is used, HTTP POST request body will be used as is considering that whole content is HTML to be rendered and default page formattting will be use (exactly as stated on JSON example above).

#### Serving generated PDFs back to user

To simplify PDF document serving and unload HTTP traffic from PDF Generator web server we simply redirect all /get/_filename_ calls to NGINX and for that we added the following rule:

```
location /get 
        {
                 alias /home/sites/_path_to_folder_with_pdfs/temp_files;
        }
```

#### Removing old generated files
In our case we need generated PDFs for a period like 10 minutes, after that we can safely remove them. This can be done via cron with this simple instruction:

```
*/10 * * * * find /home/sites/_path_to_folder_with_pdfs/temp_files/ -mmin +10 -exec rm {} \;
```


#### REST API
API documentation and details on REST API can be found on http://docs.pdfapi.apiary.io/
