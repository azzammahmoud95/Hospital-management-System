import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // Example HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NestJS HTML Response</title>
        </head>
        <body>
          <h1>Hello World!</h1>
          <p>This is an example HTML response from NestJS.</p>
        </body>
      </html>
    `;

    return htmlContent;
  }
}
