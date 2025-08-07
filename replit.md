# NovaDownloader - Media Downloader Application

## Overview

NovaDownloader is a modern, Web3-styled media downloader application that allows users to download videos and audio from various platforms like YouTube, TikTok, Instagram, and Facebook. The application features a sleek, futuristic design with glass morphism effects and gradient animations, built as a full-stack web application with real-time download progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite**: Fast build tool and development server for optimal developer experience
- **Wouter**: Lightweight routing library for client-side navigation
- **TanStack Query**: Powerful data fetching and caching library for API state management
- **shadcn/ui + Radix UI**: Component library built on Radix primitives for consistent, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens for the Nova theme
- **Framer Motion**: Animation library for smooth UI transitions and effects

### Backend Architecture
- **Express.js**: Node.js web framework serving as the REST API server
- **TypeScript**: Type-safe server-side development
- **ytdl-core**: Core library for YouTube video downloading functionality
- **In-Memory Storage**: Simple memory-based storage for download tracking during development
- **File System Operations**: Direct file handling for download processing and serving

### Design System
- **Nova Theme**: Custom Web3-inspired design with purple, cyan, and pink gradients
- **Glass Morphism**: Semi-transparent UI elements with backdrop blur effects
- **Space Theme**: Dark color scheme with cosmic-inspired visual elements
- **Responsive Design**: Mobile-first approach with adaptive layouts

### API Structure
- **RESTful Endpoints**: Clean REST API for validation, downloads, and status checking
- **Real-time Progress**: Download progress tracking through polling mechanisms
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Request Validation**: Schema-based validation using Zod for type-safe API contracts

### State Management
- **React Query**: Server state management with caching and background updates
- **Local Component State**: React hooks for UI state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

## External Dependencies

### Database & Storage
- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **PostgreSQL**: Relational database for persistent data storage (configured but using in-memory storage currently)
- **Neon Database**: Serverless PostgreSQL hosting solution

### Media Processing
- **ytdl-core**: YouTube video information extraction and download
- **File System (fs)**: Node.js native module for file operations

### UI & Styling
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework
- **Inter Font**: Modern sans-serif font family
- **Lucide Icons**: Consistent icon library
- **React Icons**: Additional icon sets for platform logos

### Development Tools
- **Replit Integration**: Development environment integration with Replit-specific plugins
- **Vite Plugins**: Development experience enhancements including error overlays
- **ESBuild**: Fast JavaScript bundler for production builds

### External Services
- **YouTube**: Primary media platform for content downloading
- **Future Platform Support**: Architecture prepared for TikTok, Instagram, Facebook integration