# Car Rental Backend

Production-ready Spring Boot backend for a Car Rental Platform with JWT authentication, refresh tokens, and role-based access control.

## 🚀 Quick Start

```bash
# Start backend
docker-compose up -d

# Wait 15 seconds for startup
sleep 15

# Test all features
./test-all-features.sh
```

**Default Admin Credentials:**
- Email: `admin@admin.com`
- Password: `Admin@123456`

## ✨ Features

### Authentication & Security
- ✅ JWT Authentication with **15-minute** access tokens
- ✅ **3-day** refresh tokens with database storage
- ✅ Token refresh endpoint for seamless user experience
- ✅ Logout with token revocation
- ✅ Rate limiting and brute-force protection with Redis
- ✅ Role-based access control (USER/ADMIN)
- ✅ Default admin user auto-created on startup

### Business Logic
- ✅ Automatic discount system (7+ days = 20% off, 6th booking = 10% off)
- ✅ Popular car detection (10+ bookings = POPULAR status + 10% price increase)
- ✅ Dynamic booking management with automatic rescheduling
- ✅ Penalty system for late returns
- ✅ Fixed booking conflict detection (consecutive dates work correctly)

### Car Visibility Rules
- ✅ **Regular Users**: See AVAILABLE, BOOKED, and their own RENTED cars
- ✅ **Admin**: Sees ALL cars regardless of status
- ✅ RENTED cars hidden from other users for privacy

### Real-time Features
- ✅ WebSocket notifications for bookings, payments, and penalties
- ✅ Real-time booking status updates

## 🔧 Tech Stack

- Java 17
- Spring Boot 3.5.14
- PostgreSQL (database)
- Redis (caching & rate limiting)
- JWT (authentication)
- WebSocket (real-time notifications)
- Docker & Docker Compose

## 📚 Documentation

| File | Description |
|------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | Quick start guide |
| **[API_MIGRATION_GUIDE.md](API_MIGRATION_GUIDE.md)** | ⚠️ API changes & frontend migration |
| **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** | Frontend integration guide |
| **[UPDATED_FEATURES.md](UPDATED_FEATURES.md)** | Complete feature documentation |
| **[CHANGELOG.md](CHANGELOG.md)** | All changes made (2026-05-04) |
| **[JWT_CONFIGURATION.md](JWT_CONFIGURATION.md)** | JWT token details |
| **[DATABASE_CLEANUP.md](DATABASE_CLEANUP.md)** | Database management |

## 🚨 Breaking Changes (2026-05-04)

### Authentication Response Format Changed

**Before:**
```json
{
  "token": "eyJhbGc..."
}
```

**After:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "dd15ccb9..."
}
```

**Action Required:** Update frontend to use new format. See [API_MIGRATION_GUIDE.md](API_MIGRATION_GUIDE.md)

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns access + refresh tokens)
- `POST /api/auth/refresh` - ⭐ NEW: Refresh access token
- `POST /api/auth/logout` - ⭐ NEW: Logout (revoke refresh token)

### Cars
- `GET /api/cars` - Get all cars (filtered by role)
- `GET /api/cars/{id}` - Get car by ID
- `GET /api/cars/available?startDate=&endDate=` - Get available cars
- `POST /api/cars` - Create car (ADMIN)
- `PUT /api/cars/{id}` - Update car (ADMIN)
- `DELETE /api/cars/{id}` - Delete car (ADMIN)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (ADMIN)
- `PUT /api/categories/{id}` - Update category (ADMIN)
- `DELETE /api/categories/{id}` - Delete category (ADMIN)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `PUT /api/bookings/{id}/start` - ⭐ NEW: Start rental (ADMIN)
- `PUT /api/bookings/{id}/complete` - Complete booking (ADMIN)
- `DELETE /api/bookings/{id}` - Cancel booking

### Penalties
- `GET /api/penalties/my` - Get user penalties
- `GET /api/penalties` - Get all penalties (ADMIN)
- `PUT /api/penalties/{id}/pay` - Pay penalty
- `PUT /api/penalties/{id}/waive` - Waive penalty (ADMIN)

### Admin
- `GET /api/admin/bookings` - Get all bookings

## 🔐 JWT Token System

| Token Type | Duration | Purpose |
|------------|----------|---------|
| Access Token | 15 minutes | API requests |
| Refresh Token | 3 days | Refresh access tokens |

**Token Refresh Flow:**
1. Login → Receive both tokens
2. Access token expires (15 min) → Call `/api/auth/refresh`
3. Receive new access token → Continue using API
4. Refresh token expires (3 days) → Login again

## 🗄️ Database Schema

- **users** - User accounts with roles
- **categories** - Car categories
- **cars** - Car inventory with pricing
- **bookings** - Rental bookings
- **payments** - Payment records
- **penalties** - Late return penalties
- **refresh_tokens** - ⭐ NEW: Refresh token storage

## 🧪 Testing

### Run Complete Test Suite

```bash
./test-all-features.sh
```

**Tests cover:**
- ✅ Admin login with default credentials
- ✅ User registration
- ✅ Car creation and visibility
- ✅ Booking flow (consecutive dates work)
- ✅ Car visibility rules (role-based)
- ✅ Access token refresh
- ✅ Logout and token revocation

### Manual Testing with curl

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin@123456"}'

# 2. Get cars (copy accessToken from step 1)
curl -X GET http://localhost:8080/api/cars \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Refresh token
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## 🐛 Common Issues

### "Invalid compact JWT string"
**Cause:** Token not sent correctly  
**Fix:** Use `Authorization: Bearer ${accessToken}` format

### "Access Denied"
**Cause:** Regular user accessing admin endpoint  
**Fix:** Check user role before calling admin endpoints

### Token expired after 15 minutes
**Cause:** Access token expired  
**Fix:** Call `/api/auth/refresh` to get new access token

See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for detailed solutions.

## 🔒 Security

- JWT-based authentication with short-lived access tokens
- Refresh tokens stored in database for revocation
- Password encryption with BCrypt
- Rate limiting (5 failed login attempts = 15 min block)
- Role-based access control
- Input validation
- CORS configuration

## 🚀 Deployment

### Local Development

```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Run application
./gradlew bootRun
```

### Production Deployment

```bash
# Build
./gradlew build

# Start all services
docker-compose up -d
```

### Production Checklist

- [ ] Change `jwt.secret` in `application.properties`
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up Redis password
- [ ] Enable database SSL
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups

## 🗑️ Database Management

### Clean Database

```bash
# Option 1: Complete reset (recommended)
docker-compose down -v
docker-compose up -d

# Option 2: Clear data only
docker exec -it car-rental-postgres psql -U postgres -d car_rental_db
TRUNCATE TABLE penalties, payments, bookings, cars, categories, users, refresh_tokens CASCADE;
\q
```

See [DATABASE_CLEANUP.md](DATABASE_CLEANUP.md) for more options.

## 📊 Business Logic

### Discount System
1. **7+ Days Discount**: 20% off for rentals longer than 7 days
2. **Loyalty Discount**: 10% off on 6th booking (if user has 5+ completed bookings without late returns)

### Popular Car System
- Car becomes POPULAR after 10 consecutive bookings
- Price automatically increases by 10%

### Penalty System
- Late returns trigger automatic penalty calculation
- Penalty = (days late × (daily price + 30,000))
- Future bookings automatically rescheduled

### Car Visibility
- **Regular Users**: See AVAILABLE, BOOKED, and their RENTED cars
- **Admin**: Sees ALL cars (INSPECTION, DAMAGED, PENALTY, etc.)

## 🔄 WebSocket

Connect to `/ws` for real-time notifications:
- Booking confirmations
- Payment updates
- Penalty notifications

## 📈 What's New (2026-05-04)

### Added
- ✅ Refresh token system (3 days)
- ✅ Token refresh endpoint
- ✅ Logout endpoint with token revocation
- ✅ Default admin user auto-creation
- ✅ Car visibility filtering by role
- ✅ Start rental endpoint

### Changed
- ✅ Access token duration: 24 hours → 15 minutes
- ✅ Authentication response format (added `refreshToken`)
- ✅ Car visibility rules (role-based filtering)

### Fixed
- ✅ Booking conflict detection (consecutive dates now work)
- ✅ Multiple bookings for same car (different dates)
- ✅ Car retrieval (all cars visible with proper filtering)

## 🎯 Next Steps

1. **Update Frontend** - Migrate to new token format
2. **Production Security** - Change secrets and passwords
3. **Monitoring** - Set up logging and alerts
4. **Token Cleanup** - Add scheduled job for expired tokens

## 📞 Support

**Issues?**
1. Check logs: `docker logs car-rental-app --tail 100`
2. Read documentation: [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
3. Test with curl: See manual testing section above
4. Review migration guide: [API_MIGRATION_GUIDE.md](API_MIGRATION_GUIDE.md)

## ✅ Verification

Backend is working correctly if:
- ✅ Admin user auto-created on startup
- ✅ Login returns `accessToken` and `refreshToken`
- ✅ Access token expires after 15 minutes
- ✅ Refresh token works for 3 days
- ✅ Logout revokes refresh token
- ✅ Regular users see filtered cars
- ✅ Admin sees all cars
- ✅ All 13 tests pass

---

**Status:** ✅ Production Ready  
**Last Updated:** 2026-05-04  
**Version:** 2.0.0
