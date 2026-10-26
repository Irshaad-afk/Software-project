# Software Engineering Diagrams

## Context-level Data Flow Diagram

```mermaid
flowchart LR
    Citizen[Citizen] -->|City query and observations| PG((PowerGuard))
    PG -->|Hazard context and preparedness| Citizen
    API[Open-Meteo] -->|Weather forecasts| PG
    PG -->|Auth and reports| Data[(Supabase)]
    Mod[Moderator] -->|Report moderation| PG
```

## Use Case Diagram (UML-style)

```mermaid
flowchart LR
    Citizen((Citizen)) --> View[View weather risk]
    Citizen --> Ready[Complete preparedness checklist]
    Citizen --> SignIn[Sign in]
    Citizen --> Report[Submit local observation]
    Citizen --> Restore[Mark own power restored]
    Moderator((Moderator)) --> Review[Review observations]
```

## Class Diagram

```mermaid
classDiagram
    class WeatherService {+searchCities(term) +loadWeather(city)}
    class RiskEngine {+analyzeForecast(forecast) +riskLabel(score)}
    class AuthAdapter {+signIn() +signUp() +signOut()}
    class CommunityAdapter {+listReports() +addReport() +markRestored()}
    class ModeratorUI {+loadReports() +reviewReport()}
    WeatherService --> RiskEngine
    CommunityAdapter --> AuthAdapter
    ModeratorUI --> CommunityAdapter
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant OpenMeteo as Open-Meteo
    participant Supabase
    User->>Browser: Choose city
    Browser->>OpenMeteo: Request hourly forecast
    OpenMeteo-->>Browser: Weather measurements
    Browser->>Browser: Calculate hazard index
    Browser-->>User: Show score and readiness checklist
    User->>Browser: Submit observation (signed in)
    Browser->>Supabase: INSERT with user session
    Supabase-->>Browser: RLS checked result
```

## Activity Diagram

```mermaid
flowchart TD
    Start([Open PowerGuard]) --> City[Choose city]
    City --> Forecast{Live forecast available?}
    Forecast -->|Yes| Live[Show live weather index]
    Forecast -->|No| Sample[Show SAMPLE fallback label]
    Live --> Prepare[Review readiness steps]
    Sample --> Prepare
    Prepare --> Report{Signed in and observing outage?}
    Report -->|Yes| Send[Submit unverified observation]
    Report -->|No| End([Finish])
    Send --> End
```

These editable diagrams are conceptual representations for coursework and
should be reviewed against the live implementation before submission.
