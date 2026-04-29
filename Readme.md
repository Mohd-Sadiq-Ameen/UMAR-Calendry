📅 Calendry2.0 – Multi‑Tenant Appointment Booking & Calendar Platform
Calendry2.0 is a production‑ready, multi‑tenant web application that solves the problem of secure data isolation for service providers (teachers, doctors, salons, consultants) and their customers. It combines a beautiful calendar, real‑time Zoom meeting creation, provider dashboards, customer explore pages, and full analytics – all while ensuring every user sees only their own data.

🚀 The Problem It Solves
Most scheduling apps either:

Leak data between providers (everyone sees everyone else’s appointments).

Require complex permissions or expensive enterprise plans.

Force customers to create accounts before booking.

Calendry2.0 fixes this by:

Implementing row‑level security – every event, booking, and analytics query is filtered by the logged‑in provider’s ID (provider_id).

Offering a customer‑friendly explore page – no login required to browse and book sessions.

Giving providers a dedicated dashboard to manage their profile, services, Zoom meetings, and upcoming appointments.

Providing real‑time analytics (time distribution, daily breakdown, utilization) – also filtered per provider.

✨ Key Features
For Providers (Professionals)
Secure Dashboard – manage profile, service details, pricing, and availability.

Zoom Integration – create Zoom meetings (mock links without API or real links with API keys).

Calendar Views – month, week, day views showing only your own events.

Appointments List – view upcoming bookings from customers.

Analytics Dashboard – see total events, meeting vs task hours, weekly breakdown, and utilization rate – all private.

Role‑based access – providers are redirected to /calendar/dashboard, customers to /calendar.

For Customers
Explore Page – browse all registered providers, filter by service type and city, compare prices.

Instant Booking – select date/time, enter name and email, and receive a Zoom link immediately.

No Account Needed – book as a guest (no registration required).

Session confirmation – booking details and Zoom link are shown right after booking.

General
Multi‑tenant data isolation – each provider sees only their own data (events, analytics, appointments).

Full‑calendar functionality – create, edit, delete events (tasks/meetings) with drag‑and‑drop style views.

Responsive UI – works on desktop, tablet, and mobile.

Modern design – glassmorphism, gradients, smooth animations.

Test Payments (optional) – Razorpay integration ready (test mode).

Authentication – real user registration and login with password hashing (werkzeug).

🛠 Tech Stack
Layer	Technology
Frontend	React 18 + Vite, React Router, date-fns, Recharts, Lucide React
Backend	Flask, Flask‑CORS, SQLite, Werkzeug (password hashing)
Payments	Razorpay (test mode – optional)
Calendar	Custom built (no external API) using date-fns
Zoom	Mock links by default – real Zoom API optional
Styling	Pure CSS (no Tailwind) with design variables