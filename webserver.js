/**
 * PDF Generation Web Server
 * @version 2.0.12
 * @author skitsanos (@skitsanos)
 *
 */

var uuid = require('node-uuid');
var fs = require('fs');
var server = require('webserver').create();

String.prototype.replaceAll = function (f, r)
{
	return this.replace(new RegExp(f, 'g'), r);
};

String.prototype.startsWith = function (str)
{
	return (this.indexOf(str) === 0);
};

Array.prototype.exists = function (x)
{
	for (var i = 0; i < this.length; i++)
	{
		if (this[i] == x) return true;
	}
	return false;
};

// start a server on port 8080 and register a request listener
server.listen(4000, function (request, response)
{
	var allowedContentTypes = [
		'application/json',
		'text/html',
		'text/plain'
	];

	var renderOptions = {
		pageSize: 'A4',
		orientation: 'portrait',
		margin: {left: '2.5cm', right: '2.5cm', top: '2.5cm', bottom: '1cm'},
		header: {height: '0.9cm', content: ''},
		footer: {height: '0.9cm', content: '<div style="text-align:center;"><small>%%pageNumber/%%totalPages</small></div>'}
	};

	var fileName = uuid.v4() + '.pdf';
	var filePath = fs.absolute('./temp_files/' + fileName);

	switch (request.method)
	{
		case 'GET':
			response.write('Skitsanos PDF Rendering API. POST Method only please');
			response.close();
			break;

		case 'POST':
			console.log('POST (' + request.headers['Content-Type'] + ')');
			console.log(JSON.stringify(request.headers));

			if (request.headers['Content-Type'] == undefined || request.headers['Content-Length'] == undefined)
			{
				console.log('ERR 500 - Content-Length or Content-Type is missing');
				response.statusCode = 500;
				response.write('Content-Length header is missing');
				response.close();
				break;
			}

			var contentType = request.headers['Content-Type'].indexOf(';') ? request.headers['Content-Type'].split(';')[0] : request.headers['Content-Type'];

			if (!allowedContentTypes.exists(contentType))
			{
				console.log('ERR 415 - Content-Type is incorrect: ' + contentType);
				response.statusCode = 415;
				response.write('Content-Type is not supported');
				response.close();
				break;
			}

			if (request.headers['Content-Type'].startsWith('application/json'))
			{
				console.log('\tgot application/json');

				var jsonConfig = JSON.parse(request.post);

				renderOptions.content = jsonConfig.content;
				renderOptions.orientation = jsonConfig.orientation != undefined ? jsonConfig.orientation : 'portrait';
				renderOptions.pageSize = jsonConfig.pageSize != undefined ? jsonConfig.pageSize : 'A4';
				renderOptions.margin = jsonConfig.margin != undefined ? jsonConfig.margin : {left: '2.5cm', right: '2.5cm', top: '2.5cm', bottom: '1cm'};
				renderOptions.header = jsonConfig.header != undefined ? jsonConfig.header : {height: '0.9cm', content: ''};
				renderOptions.footer = jsonConfig.footer != undefined ? jsonConfig.footer : {height: '0.9cm', content: '<div style="text-align:center;"><small>%%pageNumber/%%totalPages</small></div>'};
				console.log('\tparsed JSON object');
				//console.log(JSON.stringify(renderOptions));
			}
			else
			{
				renderOptions.content = request.post;
			}

			//write temp html file on disk
			try
			{
				console.log('-- Writing HTML ...');
				fs.write(filePath + '.html', renderOptions.content, 'w');
				console.log('\t' + renderOptions.content.length + ' bytes in file');
			} catch (e)
			{
				console.log(e);

				response.statusCode = 500;
				response.write(JSON.stringify(e));
				response.close();
			}

			var page = new WebPage();
			page.paperSize = {
				format: renderOptions.pageSize,
				orientation: renderOptions.orientation,
				margin: renderOptions.margin,
				header: {
					height: renderOptions.header.height,
					contents: phantom.callback(function (pageNum, numPages)
					{
						if (renderOptions.header.content == '' || renderOptions.header.content == null || renderOptions.header.content == undefined)
						{
							return '';
						}
						else
						{
							var headerContent = renderOptions.header.content.replaceAll('%%pageNumber', pageNum);
							headerContent = headerContent.replaceAll('%%totalPages', numPages);
							return headerContent;
						}
					})
				},
				footer: {
					height: renderOptions.footer.height,
					contents: phantom.callback(function (pageNum, numPages)
					{
						if (renderOptions.footer.content == '' || renderOptions.footer.content == null || renderOptions.footer.content == undefined)
						{
							return '';
						}
						else
						{
							var footerContent = renderOptions.footer.content.replaceAll('%%pageNumber', pageNum);
							footerContent = footerContent.replaceAll('%%totalPages', numPages);
							return footerContent;
						}
					})
				}
			};

			//open temp html file and render it
			page.open('file://' + filePath + '.html', function (status)
			{
				console.log('Rendering HTML into PDF...');
				page.render(filePath);
				fs.remove(filePath + '.html');
				page.close();
				console.log('-- done: Page closed.');

				console.log('-- redirecting to http://pdfapi.skitsanos.com/get/' + fileName);
				response.writeHead(302, {'Location': 'http://pdfapi.skitsanos.com/get/' + fileName});
				response.close();
				console.log('OK')
			});
			break;
	}
});

console.log('PhantomJS PDF API Web Server.');