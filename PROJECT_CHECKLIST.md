# PeacePath Development Checklist

**Last Updated**: 2025-01-15  
**Current Phase**: Phase 1 Complete → Phase 2 Ready  
**Priority System**: 🔴 High | 🟡 Medium | 🟢 Low  

## 🔴 Critical Issues (Fix Before New Features)

### 1. NativeWind Styling System
- [ ] **Debug NativeWind compilation issues**
  - Issue: Styles disappear after initial render
  - Current: Using inline styles as workaround
  - Impact: Inconsistent styling across app
  - Files: `app/auth/login.tsx`, `global.css`, `tailwind.config.js`
  - **Estimated Time**: 2-3 hours

- [ ] **Convert inline styles back to NativeWind**
  - Once NativeWind is working, remove inline styles
  - Ensure consistent design system
  - Test on both iOS and Android
  - **Estimated Time**: 1-2 hours

- [ ] **Alternative: Switch to alternative styling**
  - If NativeWind can't be fixed, consider alternatives
  - Options: Styled Components, Tamagui, or plain StyleSheet
  - **Estimated Time**: 4-6 hours

### 2. Enhanced Authentication UX
- [ ] **Improve phone number validation**
  - Better error messages for invalid formats
  - Country code detection and formatting
  - Real-time validation feedback
  - File: `app/auth/login.tsx`
  - **Estimated Time**: 2 hours

- [ ] **Add loading states and better error handling**
  - Loading indicators during auth operations
  - Better error messages for common Firebase errors
  - Retry mechanisms for failed operations
  - **Estimated Time**: 1-2 hours

## 🔴 Phase 2: Contact Sync & Matching (Next Major Feature)

### 1. Contact Permissions & Access
- [ ] **Request contacts permission**
  - Add permission primer screen
  - Handle permission denied gracefully
  - Store permission status in state
  - **Estimated Time**: 2-3 hours

- [ ] **Implement contact reading**
  - Use expo-contacts to read device contacts
  - Handle large contact lists efficiently
  - Add loading states for contact sync
  - **Estimated Time**: 3-4 hours

### 2. Contact Normalization & Matching
- [ ] **Phone number normalization**
  - Use libphonenumber-js for E.164 conversion
  - Handle international numbers properly
  - Cache normalized numbers locally
  - **Estimated Time**: 2-3 hours

- [ ] **Firestore contact matching system**
  - Create Cloud Function for secure matching
  - Query registered users by phone hash
  - Implement batch processing for large lists
  - **Estimated Time**: 4-5 hours

- [ ] **Known users storage**
  - Store matched contacts in Firestore
  - Create efficient data structure
  - Handle updates and deletions
  - **Estimated Time**: 2-3 hours

### 3. Contact Sync UI
- [ ] **Contact sync screen**
  - Show sync progress
  - Display found matches
  - Handle sync errors gracefully
  - **Estimated Time**: 3-4 hours

- [ ] **Contact management UI**
  - List known users
  - Search and filter functionality
  - Manual add/remove options
  - **Estimated Time**: 4-5 hours

## 🟡 Phase 3: Swipe Classification UI (After Contact Sync)

### 1. Swipe Interface
- [ ] **Implement react-native-deck-swiper**
  - Set up card stack component
  - Configure swipe gestures and animations
  - Add haptic feedback
  - **Estimated Time**: 4-5 hours

- [ ] **Design contact cards**
  - Show contact name and avatar
  - Add swipe direction indicators
  - Implement card animations
  - **Estimated Time**: 3-4 hours

### 2. Relationship Classification
- [ ] **Implement swipe actions**
  - Left swipe: Block contact
  - Right swipe: Mark as neutral
  - Store decisions in Firestore
  - **Estimated Time**: 2-3 hours

- [ ] **Add undo functionality**
  - Snackbar with undo option
  - Revert last swipe decision
  - Update Firestore accordingly
  - **Estimated Time**: 2 hours

### 3. Relationship Management
- [ ] **Create relationship management screens**
  - Blocked contacts list
  - Neutral contacts list
  - Edit/delete relationships
  - **Estimated Time**: 4-5 hours

- [ ] **Add relationship status indicators**
  - Visual indicators for blocked/neutral
  - Bulk actions for multiple contacts
  - Search and filter capabilities
  - **Estimated Time**: 3-4 hours

## 🟡 Phase 4: Location & Proximity System (Major Feature)

### 1. Location Services
- [ ] **Request location permissions**
  - Permission primer screen
  - Handle background location
  - Respect user privacy settings
  - **Estimated Time**: 2-3 hours

- [ ] **Implement background location tracking**
  - Use expo-location with proper intervals
  - Battery optimization strategies
  - Location accuracy configuration
  - **Estimated Time**: 4-6 hours

### 2. Proximity Detection
- [ ] **Implement GeoFireX integration**
  - Set up geospatial queries
  - Efficient proximity calculations
  - Real-time location updates
  - **Estimated Time**: 5-6 hours

- [ ] **Proximity alert system**
  - Detect when blocked contacts are nearby
  - Trigger local push notifications
  - Include detour suggestions
  - **Estimated Time**: 4-5 hours

### 3. Push Notifications
- [ ] **Set up Expo push notifications**
  - Configure push tokens
  - Handle notification permissions
  - Test on both iOS and Android
  - **Estimated Time**: 3-4 hours

- [ ] **Implement notification handling**
  - Foreground and background notifications
  - Deep linking from notifications
  - Notification action buttons
  - **Estimated Time**: 3-4 hours

## 🟢 Settings & Privacy Controls (Polish Features)

### 1. Settings Screen
- [ ] **Location tracking controls**
  - On/Off toggle
  - Tracking interval selection
  - Battery usage information
  - **Estimated Time**: 2-3 hours

- [ ] **Privacy settings**
  - Data export functionality
  - Account deletion option
  - Privacy policy display
  - **Estimated Time**: 3-4 hours

### 2. Data Management
- [ ] **Export user data**
  - Generate JSON export
  - Email data to user
  - GDPR compliance
  - **Estimated Time**: 2-3 hours

- [ ] **Account deletion**
  - 7-day grace period
  - Complete data removal
  - Confirmation workflows
  - **Estimated Time**: 3-4 hours

## 🟢 Testing & Quality Assurance

### 1. Unit Testing Expansion
- [ ] **Add component tests**
  - Login screen tests
  - Home screen tests
  - Navigation tests
  - **Estimated Time**: 4-5 hours

- [ ] **Service layer tests**
  - Contact sync service tests
  - Location service tests
  - Notification service tests
  - **Estimated Time**: 4-5 hours

### 2. E2E Testing
- [ ] **Set up Playwright E2E tests**
  - Configure test environment
  - Write critical path tests
  - Authentication flow tests
  - **Estimated Time**: 6-8 hours

- [ ] **Integration tests**
  - Firebase integration tests
  - Contact sync flow tests
  - Location tracking tests
  - **Estimated Time**: 4-6 hours

### 3. Performance Testing
- [ ] **Performance optimization**
  - Bundle size analysis
  - Memory usage profiling
  - Battery impact testing
  - **Estimated Time**: 3-4 hours

- [ ] **Accessibility testing**
  - Screen reader compatibility
  - Touch target sizing
  - Color contrast validation
  - **Estimated Time**: 2-3 hours

## 🟢 Documentation & Maintenance

### 1. Code Documentation
- [ ] **API documentation**
  - Document all service methods
  - Add JSDoc comments
  - Generate API docs
  - **Estimated Time**: 2-3 hours

- [ ] **Component documentation**
  - Document component props
  - Add usage examples
  - Create component library
  - **Estimated Time**: 3-4 hours

### 2. User Documentation
- [ ] **User guide**
  - App usage instructions
  - Privacy explanations
  - Troubleshooting guide
  - **Estimated Time**: 2-3 hours

- [ ] **Developer setup guide**
  - Environment setup instructions
  - Build and deployment guide
  - Contribution guidelines
  - **Estimated Time**: 1-2 hours

## 🔴 Technical Debt & Improvements

### 1. Code Quality
- [ ] **Add React error boundaries**
  - Catch and handle React errors
  - Graceful error recovery
  - Error reporting integration
  - **Estimated Time**: 2-3 hours

- [ ] **Improve TypeScript coverage**
  - Add stricter TypeScript config
  - Fix any type issues
  - Add type definitions
  - **Estimated Time**: 2-3 hours

### 2. Performance Optimizations
- [ ] **Optimize re-renders**
  - Add React.memo where needed
  - Optimize useEffect dependencies
  - Minimize state updates
  - **Estimated Time**: 2-3 hours

- [ ] **Bundle optimization**
  - Tree shaking improvements
  - Code splitting strategies
  - Asset optimization
  - **Estimated Time**: 2-3 hours

## Timeline Estimates

### Next 2 Weeks (Phase 2 Focus)
1. **Week 1**: Fix NativeWind issues + Contact permissions & reading
2. **Week 2**: Contact normalization + Firestore matching system

### Next 4 Weeks (Phase 3 Addition)
3. **Week 3**: Contact sync UI + Swipe interface setup
4. **Week 4**: Swipe classification + Relationship management

### Next 8 Weeks (Phase 4 Addition)
5. **Week 5-6**: Location services + GeoFireX integration
6. **Week 7-8**: Proximity alerts + Push notifications

### Ongoing (Throughout Development)
- Testing expansion
- Code quality improvements
- Documentation updates
- Performance optimization

## Development Priorities

### Immediate (This Week)
1. 🔴 Fix NativeWind styling issues
2. 🔴 Enhance phone validation UX
3. 🔴 Start contact permissions implementation

### Short Term (Next 2 Weeks)
1. 🔴 Complete contact sync & matching system
2. 🟡 Add error boundaries and better error handling
3. 🟡 Expand unit test coverage

### Medium Term (Next 4 Weeks)
1. 🟡 Implement swipe classification UI
2. 🟡 Build relationship management system
3. 🟡 Set up E2E testing framework

### Long Term (Next 8 Weeks)
1. 🟡 Location services and proximity detection
2. 🟢 Settings and privacy controls
3. 🟢 Performance optimization and polish

---

**Note**: This checklist should be updated as tasks are completed and new requirements emerge. Estimates are based on single developer working part-time. Adjust timelines based on team size and availability.