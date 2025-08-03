# Khabeer Panel

A modern, responsive dashboard built with Next.js, TypeScript, Tailwind CSS, TanStack Query, and shadcn/ui.

## 🚀 Features

- **Modern UI**: Built with shadcn/ui components for a beautiful, accessible interface
- **TypeScript**: Full type safety throughout the application
- **TanStack Query**: Efficient data fetching and caching
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready**: Built-in support for dark/light themes
- **Real-time Updates**: Live data with optimistic updates
- **Performance Optimized**: Fast loading with Next.js App Router

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Yup validation
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd khabeer-panel
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific components
│   └── forms/            # Form components
└── lib/                  # Utility functions and configurations
    ├── providers.tsx     # TanStack Query provider
    ├── stores/           # Zustand stores
    ├── validations/      # Yup validation schemas
    └── utils.ts          # Utility functions
```

## 🎨 Components

### Dashboard Layout

- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- User profile dropdown
- Breadcrumb navigation
- Zustand state integration

### Dashboard Stats

- Key metrics cards
- Loading states
- Error handling
- Real-time data updates

### Recent Activity

- Activity feed with user avatars
- Time-based sorting
- Activity type indicators
- Infinite scroll ready

### Quick Actions

- Common task shortcuts
- Recent projects list
- System status indicators
- Interactive buttons
- Toast notification integration

### Forms

- React Hook Form with Yup validation
- Reusable form components
- Type-safe form handling
- Error handling and validation
- Project creation form example

### Notifications

- React Hot Toast integration
- Multiple notification types (success, error, info, warning)
- Auto-dismiss functionality
- Customizable styling and positioning
- Promise-based notifications
- Loading states

## 🔧 Configuration

### TanStack Query

The app is configured with TanStack Query for efficient data management:

- **Stale Time**: 1 minute (data considered fresh for 1 minute)
- **Refetch on Window Focus**: Disabled for better UX
- **DevTools**: Available in development mode

### shadcn/ui

Components are configured with:

- **Base Color**: Neutral
- **CSS Variables**: Automatically generated
- **Component Registry**: Easy to add new components

## 📱 Responsive Design

The dashboard is fully responsive with:

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Slide-out navigation menu

## 🎯 Key Features

### Data Management

- Efficient caching with TanStack Query
- Optimistic updates
- Error boundaries
- Loading states

### User Experience

- Smooth animations
- Hover effects
- Focus management
- Keyboard navigation

### Performance

- Code splitting
- Image optimization
- Font optimization
- Bundle analysis ready

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔮 Future Enhancements

- [ ] Authentication system
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] User management
- [ ] Project management
- [ ] File upload system
- [ ] API integration
- [ ] Dark mode toggle
- [ ] Internationalization
- [ ] PWA support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui
