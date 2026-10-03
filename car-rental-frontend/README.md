# Car Rental Frontend

Modern React application for car rental platform with real-time notifications and booking management.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **date-fns** - Date utilities
- **STOMP/WebSocket** - Real-time updates

## 📁 Project Structure

```
car-rental-frontend/
├── src/
│   ├── assets/          # Images and static files
│   ├── components/      # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Loader.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── CarCard.jsx
│   │   ├── BookingCard.jsx
│   │   ├── PenaltyCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── CarsPage.jsx
│   │   ├── CarDetailPage.jsx
│   │   ├── BookingsPage.jsx
│   │   ├── PenaltiesPage.jsx
│   │   └── NotificationsPage.jsx
│   ├── services/        # API services
│   │   ├── api.js
│   │   ├── apiService.js
│   │   └── websocket.js
│   ├── store/           # State management
│   │   ├── authStore.js
│   │   └── notificationStore.js
│   ├── hooks/           # Custom hooks
│   │   └── useWebSocket.js
│   ├── utils/           # Utility functions
│   │   ├── helpers.js
│   │   └── validation.js
│   ├── constants/       # Constants
│   │   ├── config.js
│   │   └── statuses.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Public assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Backend API URL

Edit `src/constants/config.js`:

```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
export const WS_BASE_URL = 'http://localhost:8080/ws';
```

## 📱 Features

### User Features
- ✅ User registration and authentication
- ✅ Browse and filter cars
- ✅ View car details
- ✅ Book cars with date selection
- ✅ View booking history
- ✅ Cancel bookings
- ✅ View and pay penalties
- ✅ Real-time notifications
- ✅ Automatic discount calculation

### Admin Features (TODO)
- Manage cars (CRUD)
- Manage categories
- View all bookings
- Manage penalties
- Dashboard with statistics

## 🎨 Pages

### Public Pages
- **Home** (`/`) - Landing page with featured cars
- **Cars** (`/cars`) - All cars with filters
- **Car Detail** (`/cars/:id`) - Car details and booking form
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration

### Protected Pages
- **My Bookings** (`/bookings`) - User's bookings
- **My Penalties** (`/penalties`) - User's penalties
- **Notifications** (`/notifications`) - Real-time notifications

## 🔐 Authentication

The app uses JWT token authentication:
- Token is stored in localStorage
- Automatically added to all API requests
- Redirects to login on 401 errors
- Protected routes require authentication

## 💰 Business Logic

### Discounts
1. **Duration Discount**: 20% off for rentals > 7 days
2. **Loyalty Discount**: 10% off for 6th booking (if no late returns)
3. Discounts can be combined (up to 28% total)

### Penalties
- Formula: `(days late × daily price × 1.5)`
- Users cannot book until penalties are paid
- Late returns affect loyalty discount eligibility

### Popular Cars
- Cars with 10+ consecutive bookings become "Popular"
- Price increases by 10%
- Special badge displayed

## 🔔 Real-time Notifications

WebSocket notifications for:
- Booking confirmed
- Booking cancelled
- Penalty applied
- Booking rescheduled
- Payment received
- Penalty paid

## 🎯 Next Steps

1. Create admin dashboard pages
2. Add car image upload functionality
3. Add payment integration
4. Add booking calendar view
5. Add user profile page
6. Add search autocomplete
7. Add car comparison feature
8. Add reviews and ratings
9. Add mobile responsive menu
10. Add loading skeletons

## 📝 Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=http://localhost:8080/ws
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

MIT
