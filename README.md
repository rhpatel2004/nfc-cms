# Universal NFC Content Management System (CMS)

A full-stack web application designed to bridge the physical and digital worlds using NFC technology. This project provides a user-friendly, no-code platform for creating and managing dynamic web content that is triggered by tapping a passive NFC sticker.

-----

## 🌟 Project Highlights

The Universal NFC CMS eliminates the need for hard-coding data onto NFC tags, allowing for real-time content updates and infinite reusability across diverse applications like retail, art galleries, and gyms.

### Key Features

  * **Admin Dashboard:** A centralized control panel to create, edit, and assign content to unique NFC tags.
  * **Dynamic Page Builder:** Create rich web pages using a no-code editor with a selection of pre-built components like hero sections, image grids, and sliders.
  * **Tag Management:** Easily register new NFC tags and automatically link them to unique, auto-generated URLs.
  * **Content Assignment:** A drag-and-drop interface for intuitively assigning your created pages to specific NFC tags.
  * **Real-time Analytics:** Track valuable user engagement data, including tap counts and geographical locations.
  * **Role-Based Access Control (RBAC):** A secure system to define different user permissions for administrators and editors.

-----

## 🛠️ Technology Stack

This project is built using a modern and scalable stack:

  * **Frontend:** [Next.js](https://nextjs.org/) (React)
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  * **Components:** [Shadcn UI](https://ui.shadcn.com/)
  * **Backend:** Next.js API Routes
  * **Database:** (To be implemented)

-----

## 🚀 Getting Started

Follow these steps to set up the project locally for development.

### Prerequisites

You'll need to have [Node.js](https://nodejs.org/en/) (v18.17.0 or higher) and npm installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/universal-nfc-cms.git
    cd universal-nfc-cms
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will now be running on `http://localhost:3000`.

-----

## 📁 File Structure

The project uses the Next.js App Router for a clean and scalable structure.

```
/universal-nfc-cms
├── app/                  // All application routes and pages
│   ├── (dashboard)/      // All authenticated dashboard pages
│   │   ├── layout.tsx    // Shared layout for the CMS
│   │   ├── dashboard/    // Dashboard overview
│   │   ├── pages/        // Page builder and management
│   │   ├── nfc-tags/     // NFC tag management
│   │   └── analytics/    // Analytics dashboard
│   ├── api/              // API routes for backend logic
│   └── globals.css       // Global styles
├── components/           // Reusable React components
│   ├── custom/           // Custom-built components (e.g., Sidebar)
│   └── ui/               // Shadcn UI components
├── public/               // Static assets
└── ...                   // Other configuration files
```

-----

## 🗺️ Roadmap & Future Plans

  * **Database Integration:** Implement a database (likely with Prisma) to store content pages, tag data, and analytics.
  * **Content Modules:** Expand the library of pre-built page components (e.g., forms, galleries).
  * **API Integrations:** Build a REST API for third-party systems to interact with the CMS.
