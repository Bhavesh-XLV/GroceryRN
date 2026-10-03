# GroceryRN

A Grocery & Food Ordering mobile application built with React Native CLI and TypeScript.

The application demonstrates authentication, secure token storage, automatic token refresh, product browsing, search, filtering, sorting, cart management, favorites, local orders, offline support, and dark mode.

## Tech Stack

- React Native CLI
- TypeScript
- Redux Toolkit
- RTK Query
- Axios
- React Navigation
- React Native Keychain
- AsyncStorage
- NetInfo
- Jest
- React Native Testing Library
- DummyJSON API

## Features

### Authentication

- Login using DummyJSON authentication API
- Secure access token and refresh token storage using React Native Keychain
- Session restoration on app launch
- Automatic token refresh on `401`
- Failed requests are retried after token refresh
- Concurrent `401` requests share a single refresh request
- Logout support

### Product Listing

- Product listing with pagination
- Infinite scroll
- Pull-to-refresh
- Debounced product search
- Category filtering
- Price sorting
- Rating sorting
- Title sorting
- Favorite products
- Add products to cart
- Quantity management
- Loading, empty, and error states

### Product Details

- Product image
- Product title
- Price
- Discount
- Rating
- Description
- Quantity selection
- Add to cart
- Favorite/unfavorite product

### Cart

- Add/remove products
- Increase/decrease quantity
- Persistent cart
- Subtotal calculation
- Discount calculation
- Tax calculation
- Final total calculation
- `SAVE10` coupon support
- Money calculations using integer cents to avoid floating-point issues

### Orders

- Place orders locally
- Persistent order history
- Order date
- Order items
- Order total
- Order status

### Favorites

- Add/remove favorites
- Persistent favorites
- Favorites available offline

### Offline Support

- Network connectivity detection using NetInfo
- Offline status banner
- Product data cached locally
- Cached products available when offline
- Search against cached products
- Category filtering against cached products
- Sorting against cached products
- Product details available from cached data
- DummyJSON write operations are treated as simulated operations

### Theme

- Light mode
- Dark mode
- Persistent theme preference

## Architecture

The project follows a modular architecture with clear separation between UI, API, state management, storage, hooks, and business logic.

```text
src/
├── api/
│   ├── apiSlice.ts
│   ├── authApi.ts
│   ├── authRefresh.ts
│   └── client.ts
├── components/
│   ├── CommonHeader.tsx
│   └── OfflineBanner.tsx
├── constants/
│   ├── config.ts
│   └── theme.ts
├── hooks/
│   ├── useAppTheme.ts
│   ├── useDebounce.ts
│   └── useNetworkStatus.ts
├── navigation/
│   ├── AppNavigator.tsx
│   └── BottomTabNavigator.tsx
├── screens/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── favorites/
│   ├── orders/
│   └── profile/
├── services/
├── storage/
│   ├── cartStorage.ts
│   ├── orderStorage.ts
│   ├── productStorage.ts
│   └── secureStorage.ts
├── store/
│   ├── appSlice.ts
│   ├── authSlice.ts
│   ├── cartSlice.ts
│   ├── favoriteSlice.ts
│   ├── orderSlice.ts
│   └── themeSlice.ts
├── types/
└── utils/
    └── cartCalculations.ts

__tests__/
App.tsx
.env.example
package.json
```

## Architecture Decisions

### Redux Toolkit

Redux Toolkit is used for client-side application state such as authentication, cart, favorites, orders, and theme.

### RTK Query

RTK Query is used for server/API state such as products, categories, search results, and product details.

This keeps server state separate from local application state.

### Axios

Axios is used for authentication requests and centralized API handling.

Request and response interceptors handle Bearer token injection, `401` responses, token refresh, and failed request retry.

A shared refresh promise ensures that multiple simultaneous `401` requests do not trigger multiple refresh API calls.

### React Native Keychain

React Native Keychain is used for access and refresh tokens because authentication tokens should not be stored in plain AsyncStorage.

### AsyncStorage

AsyncStorage is used for non-sensitive local application data such as cart, favorites, orders, product cache, and theme preference.

### Business Logic

Business logic such as cart calculations is kept outside UI components.

Money calculations use integer cents to avoid JavaScript floating-point precision issues.

## State Management

| Data | Technology |
| --- | --- |
| Server/API state | RTK Query |
| Authentication state | Redux Toolkit |
| Cart | Redux Toolkit + AsyncStorage |
| Favorites | Redux Toolkit + AsyncStorage |
| Orders | Redux Toolkit + AsyncStorage |
| Theme | Redux Toolkit + AsyncStorage |
| Authentication tokens | React Native Keychain |
| Product offline cache | AsyncStorage |

## API

The application uses the DummyJSON API.

### Base URL

```text
https://dummyjson.com
```

### Authentication

```text
POST /auth/login
GET  /auth/me
POST /auth/refresh
```

### Products

```text
GET /products
GET /products/search
GET /products/categories
GET /products/category/:category
GET /products/:id
```

### Cart

```text
POST /carts/add
```

Cart writes are simulated because DummyJSON does not persist mutations.

## Environment Variables

Create a `.env` file in the project root:

```env
API_BASE_URL=https://dummyjson.com
```

A `.env.example` file is included in the repository.

The `.env` file is excluded from Git.

## Demo Credentials

```text
Username: emilys
Password: emilyspass
```

## Installation

```bash
git clone <repository-url>
cd GroceryRN
yarn install
```

For iOS:

```bash
cd ios
pod install
cd ..
```

## Run the Application

Start Metro:

```bash
yarn start
```

Run Android:

```bash
yarn android
```

Run iOS:

```bash
yarn ios
```

## Testing

The project includes unit and screen-level tests covering authentication, token storage, token refresh, Redux slices, cart calculations, cart, favorites, orders, theme, product storage, order storage, API configuration, debounce logic, theme hooks, product details, profile screen, and login screen.

Run tests:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test --coverage
```

### Test Results

```text
Test Suites: 22 passed, 22 total
Tests:       128 passed, 128 total
Snapshots:   0 total
```

### Coverage

```text
Statements: 90.70%
Branches:   71.77%
Functions:  88.65%
Lines:      90.97%
```

The current test suite contains 128 passing tests with 90.7% statement coverage.

## Production Build

### Android APK

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

Generated APK:

```text
android/app/build/outputs/apk/release/app-release.apk
```

### Android App Bundle

```bash
cd android
./gradlew bundleRelease
```

Generated AAB:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Offline Architecture

Product data fetched from the API is persisted locally.

```text
DummyJSON API
      ↓
  RTK Query
      ↓
 Product List
      ↓
 Product Cache
      ↓
 AsyncStorage
```

When the device goes offline:

```text
Network unavailable
       ↓
Load cached products
       ↓
Search / Category / Sort locally
       ↓
Display cached products
```

Previously fetched products remain available without an internet connection.

Offline-supported product operations include search, category filtering, sorting, product details, favorites, and cart management.

## Authentication Flow

```text
Login
  ↓
Access Token + Refresh Token
  ↓
React Native Keychain
  ↓
API Request
  ↓
401?
 ├── No → Continue
 │
 └── Yes
      ↓
   Refresh Token
      ↓
   Store New Token
      ↓
   Retry Original Request
```

Concurrent `401` requests are handled using a shared refresh promise so multiple failed requests do not trigger multiple refresh API calls.

If token refresh fails, the authentication session is cleared and the user can log in again.

## Performance

The product list uses React Native `FlatList` with pagination and incremental rendering.

Performance considerations include pagination, virtualized list rendering, debounced search, local product cache, efficient Redux selectors, and avoiding unnecessary list updates.

Performance testing was performed using the React Native performance monitor with 50+ products.

Observed performance:

```text
UI FPS:         60
Dropped Frames: 7
Stutters:       0
```

## Security

- Authentication tokens are stored using React Native Keychain.
- Sensitive authentication tokens are not stored in AsyncStorage.
- AsyncStorage is used only for non-sensitive application data.
- `.env` is excluded from Git.
- `.env.example` is provided as a configuration reference.
- Access tokens are attached through the centralized API client.
- Refresh tokens are used only for token renewal.

## Trade-offs

### AsyncStorage Instead of a Database

AsyncStorage is used for local application data instead of introducing a database because the required local data is relatively small.

A database would be more appropriate for a significantly larger offline dataset.

### Product Caching

Product caching uses AsyncStorage to keep the implementation simple and avoid unnecessary database complexity.

### Server State vs Local State

RTK Query handles server state while Redux Toolkit handles local application state.

This avoids mixing API cache data with local business state.

### DummyJSON Mutations

DummyJSON does not persist mutations, so cart, favorites, and orders are intentionally managed locally where persistence is required.

### Category Cache

Product data is cached locally, but the category list itself is not separately persisted.

Categories can still be derived from cached product data while offline.

### Avoiding Unnecessary Abstractions

The implementation keeps the architecture focused on the assignment requirements without introducing unnecessary layers or libraries.

## Known Limitations

- DummyJSON does not persist POST, PUT, or DELETE operations.
- Category data is not separately cached for offline use.
- Offline functionality is limited to product data that has previously been fetched and cached.
- The application does not use a real payment gateway because the assignment uses DummyJSON.
- Product mutations are simulated because the backend does not provide persistent mutation storage.

## What I Would Improve With More Time

- Add biometric authentication when the application resumes.
- Add local notifications when an order is marked as delivered.
- Add deeper offline synchronization for pending mutations.
- Add image caching and further list optimization if the dataset grows significantly.
- Add end-to-end testing for critical flows such as login, checkout, and logout.
- Add CI/CD with automated testing and release builds.
- Add a more advanced API retry and error recovery strategy.
- Cache additional API data such as categories for a more complete offline experience.

## Bonus

### Dark Mode

Implemented bonus feature:

- Light mode
- Dark mode
- Persistent theme preference
- Theme applied across the application

## Project Goals

This project focuses on:

- Clean architecture
- Type safety
- Secure authentication
- Reliable token refresh
- Offline-first product experience
- Local persistence
- Performance
- Testability
- Maintainable React Native code
- Clear separation of server and local state
