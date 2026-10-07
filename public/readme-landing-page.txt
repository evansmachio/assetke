KID Landing Page

Files
- landing.html: responsive, standalone marketing landing page for KID Asset Management System.

Install in your existing Express project
1. Copy landing.html into your project's public folder.
2. Start your development server.
3. Open http://localhost:5000/landing.html (replace 5000 if your server uses a different port).

The sign-in buttons point to /login.html. The page has no external libraries or image dependencies.
To show this page at the root URL, update the existing Express route that serves public/index.html to serve landing.html instead. Keep your dashboard available on its current route.
