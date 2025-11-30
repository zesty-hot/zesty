# Zesty

> The next-generation adult entertainment platform built for safety, connection, and community.

![Zesty Banner](https://raw.githubusercontent.com/zesty-hot/zesty/refs/heads/main/public/og-image.png)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Mobile-1199EE?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

</div>

## The initial problem 

The initial problem was that there was no safe and secure way to pay for adult entertainment services. This led to a lot of scams and fraud, which made it difficult for content creators to earn a living and for users to find safe and reliable services.

Exhibit A:

![Exhibit A](https://raw.githubusercontent.com/zesty-hot/zesty/refs/heads/main/.github/images/exhibit-a.jpg)

## 📖 Overview

Zesty is a comprehensive adult entertainment application designed to provide a safe and engaging environment for both content creators and users. It integrates advanced features like safe escrow payments, ID verification, and a reputation system to ensure security and trust within the community.

Zesty offers a seamless experience across web and mobile platforms via **Capacitor**.

## ✨ Features

### 🛡️ Safety & Trust
- **Escrow Payments**: Protects funds until services are verified, preventing scams.
- **ID Verification**: Mandatory verification to ensure all users are real and of age.
- **Reputation System**: Community-driven ratings and reviews to identify trusted members.
- **Direct Police Reporting**: Integrated safety tools for immediate assistance.

### 🎥 Content & Interaction
- **Live Streaming**: Real-time broadcasting with **LiveKit** integration for low-latency interaction.
- **VIP Subscriptions**: Exclusive content feed for subscribers (Images, Videos, Status updates).
- **Private Messaging**: Secure, real-time chat functionality.
- **Dating**: Matchmaking features to help users find partners.

### 🌏 Community & Services
- **Search Directory**: Find companions and services nearby with location-based search.
- **Events & Meetups**: Organize and join gatherings to socialize with the community.
- **Job Listings**: Dedicated section for industry-related job opportunities.
- **Studios**: Management tools for content studios and agencies.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Origin UI](https://origin-ui.com/)
- **State/Data**: React Server Components, Server Actions

### Backend
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Supabase Auth](https://supabase.com/auth)
- **Realtime**: [LiveKit](https://livekit.io/) (Streaming), WebSockets

### Mobile
- **Framework**: [Capacitor](https://capacitorjs.com/) (iOS & Android)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **PostgreSQL** database (local or cloud)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/zesty-hot/zesty.git
    cd zesty
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your environment variables.
    ```bash
    cp .env.example .env
    ```
    > Ensure you configure your `DATABASE_URL` and other API keys (Supabase, LiveKit, etc.).

4.  **Database Setup**
    Run Prisma migrations to set up your database schema.
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

5.  **Run the Application**
    Start the development server.
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
zesty/
├── app/                 # Next.js App Router pages and API routes
├── components/          # Reusable React components
├── lib/                 # Utility functions and shared logic
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── types/               # TypeScript type definitions
├── android/             # Capacitor Android project
└── ios/                 # Capacitor iOS project
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the ZNSL V1.0 License. See [LICENSE.md](LICENSE.md) for more information.

