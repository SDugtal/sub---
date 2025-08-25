# SageSensei Chat

An AI-powered chatbot application built with React, TypeScript, Hasura GraphQL, Nhost, n8n, and OpenRouter. The project demonstrates secure authentication, real-time messaging, role-based access controls, and automated AI workflows with enterprise-grade security.

![Chat Application](https://img.shields.io/badge/Status-Active-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Nhost](https://img.shields.io/badge/Nhost-Backend-purple)
![n8n](https://img.shields.io/badge/n8n-Workflow-orange)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-red)

## 🎥 Demo

https://github.com/user-attachments/assets/ed4077b6-ec2f-419d-8cf1-a885e0da7475

## ✨ Features

- 🔐 **Authentication**: Email sign-in/sign-up using Nhost Auth with role-based access
- 💬 **Real-time Chat**: Chats and messages managed via Hasura GraphQL queries, mutations, and subscriptions
- 🛡️ **Security**: Row-Level Security (RLS) ensures users only access their own chats and messages
- ⚡ **AI Integration**: Hasura Actions trigger n8n workflows that call OpenRouter LLMs, then store responses in the database
- 🖥️ **Frontend**: Responsive chat interface with chat list, message view, and smooth multi-turn conversations
- 🔄 **Workflow Automation**: All external API calls are handled securely by n8n, never directly from the frontend
- **Theme Support**: Beautiful dark and light mode themes
- **Optimistic Updates**: Instant UI feedback for better user experience
- **Type-Safe**: Full TypeScript support throughout the application

## 🏗️ Architecture

```
Frontend (React + TypeScript)
        ⬇️ GraphQL
Hasura (Queries, Mutations, Subscriptions, Actions)
        ⬇️ Webhook
n8n Workflow → OpenRouter API
        ⬆️ GraphQL
Database (Chats & Messages with RLS)
```

### Data Flow
1. **User sends message** → React app calls GraphQL mutation
2. **Message stored** → Hasura saves to PostgreSQL with RLS
3. **Action triggered** → Hasura Action calls n8n webhook
4. **AI processing** → n8n workflow calls OpenRouter API
5. **Response stored** → n8n stores AI response back via GraphQL
6. **Real-time update** → All clients receive updates via subscriptions

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client with caching and real-time subscriptions
- **Lucide React** - Beautiful, customizable icons

### Backend & Infrastructure
- **Nhost** - Backend-as-a-Service platform
- **Hasura GraphQL Engine** - Auto-generated GraphQL API with Actions
- **PostgreSQL** - Reliable relational database with Row-Level Security (RLS)
- **n8n** - Workflow automation platform for AI integrations
- **OpenRouter** - AI model access layer (free models available)
- **WebSocket Subscriptions** - Real-time data synchronization

### Authentication & Security
- **Nhost Auth** - Complete authentication system with role-based access
- **JWT Tokens** - Secure session management
- **Row-Level Security (RLS)** - Database-level access controls
- **Email Verification** - Account security



## 🤖 AI Integration & Workflow Automation

The application uses a sophisticated, secure AI integration architecture that never exposes API keys to the frontend:

### Architecture Flow
1. **User sends message** → Stored in database via GraphQL mutation
2. **Hasura Action triggered** → Calls n8n webhook with message context
3. **n8n Workflow processes** → Securely calls OpenRouter API with user message
4. **AI generates response** → OpenRouter returns AI response to n8n
5. **Response stored** → n8n stores bot response back to database via GraphQL
6. **Real-time update** → All clients receive new message via GraphQL subscription

### Security Benefits
- **No API Key Exposure**: OpenRouter API keys never touch the frontend
- **Centralized AI Logic**: All AI processing handled by n8n workflows
- **Audit Trail**: Complete workflow logs in n8n
- **Rate Limiting**: Built-in request throttling
- **Error Handling**: Robust retry and fallback mechanisms


## 🎨 Theme System

The application supports both dark and light themes using React Context and Tailwind CSS:

- **Light Theme**: Clean, professional appearance with warm colors
- **Dark Theme**: Eye-friendly dark interface for low-light environments
- **Persistent**: Theme preference saved to localStorage
- **Smooth Transitions**: Animated theme switching


## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```



**Built with ❤️ using React, TypeScript, and Nhost**
