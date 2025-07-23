---
version: 1.0
project_type: "Web Application"
author: "User"
created_at: "2025-01-23"
workflow:
  git_enabled: true
  auto_commit: true
  test_before_commit: true
  generate_tests: true
  commit_style: detailed
  feature_branch: false
  create_github_immediately: true
  continuous_push: true
  auto_push_github: true
  generate_readme: true
  docker_enabled: true
  docker_compose: true
  docker_dev_config: true
  kubernetes_manifests: false
  cicd_workflows: false
---

## FEATURE: Train Search by Route and Date

[HIGH PRIORITY] Allow users to search for trains between two stations on a specific date. This is the core functionality that enables users to find available trains on their desired route.

- Input fields for departure and arrival stations (with autocomplete)
- Date picker for travel date
- Form validation to ensure all fields are filled
- Search button to trigger the API call

## FEATURE: TGV MAX Availability Checker

[HIGH PRIORITY] Check and display which trains have available TGV MAX seats. This is the main value proposition of the application for TGV MAX subscribers.

- Integration with SNCF API to fetch train data
- Identification of TGV MAX eligible trains
- Clear visual indication of availability status
- Real-time updates when possible

Dependencies: Train Search by Route and Date

## FEATURE: Search Results Filtering

[MEDIUM PRIORITY] Allow users to filter search results to find the most suitable trains quickly.

- Filter by departure time range
- Filter by journey duration
- Filter by number of connections
- Sort options (earliest, fastest, least connections)
- Persist filter preferences during session

Dependencies: Train Search by Route and Date

## FEATURE: Favorite Routes

[MEDIUM PRIORITY] Enable users to save frequently searched routes for quick access.

- Save route combinations (departure/arrival stations)
- Quick search from saved routes
- Local storage for persistence
- Manage saved routes (add/remove)

Dependencies: Train Search by Route and Date

## FEATURE: Train Details Display

[MEDIUM PRIORITY] Show comprehensive information about each train to help users make informed decisions.

- Journey duration
- Departure and arrival times
- Number of stops
- Train number and type
- Platform information when available
- Connection details if applicable

Dependencies: Train Search by Route and Date

## FEATURE: Availability Notifications

[LOW PRIORITY] Notify users when TGV MAX seats become available on their desired routes.

- Email or push notification preferences
- Watch specific trains or routes
- Notification frequency settings
- Unsubscribe options

Dependencies: TGV MAX Availability Checker, Favorite Routes

## EXAMPLES:

- `https://www.sncf-connect.com/`: Reference for UI/UX patterns and search functionality
- `https://www.tgvmax.fr/`: TGV MAX specific features and branding

## DOCUMENTATION:

- `https://ressources.data.sncf.com/explore/dataset/api-sncf/information/`: Main SNCF API documentation
- `https://www.data.gouv.fr/datasets/api-theorique-et-temps-reel-sncf/`: Alternative SNCF data source
- `https://numerique.sncf.com/startup/api/`: Developer API portal
- `https://nextjs.org/docs`: Next.js framework documentation
- `https://tailwindcss.com/docs`: Tailwind CSS documentation

## CONSTRAINTS:

- Must complete prototype within 1 week
- API rate limits must be respected
- Should work on mobile devices (responsive design)
- Must handle API failures gracefully (fallback to cached data or error messages)

## OTHER CONSIDERATIONS:

- This is a prototype, so focus on core functionality over polish
- Consider caching frequently searched routes to reduce API calls
- TGV MAX availability might not be directly available via API, may need creative solutions
- SNCF API requires authentication (API key)
- Consider implementing a simple backend proxy to hide API keys from frontend
- Use French language for UI as target users are French TGV MAX subscribers