# QA and Verification Matrix

| Scenario | Expected result |
| --- | --- |
| Dashboard loads | Main nav, weather cards and preparedness actions render |
| Search city | User can switch location and load a forecast |
| Weather API outage | Sample state clearly labeled instead of pretending it is real |
| Hazard score | Remains within documented 0–100 index range |
| New registration | Email confirmation flow and session sign-in succeed |
| Logged-out report submission | Blocked with explanation |
| Signed-in report submission | Own report accepted; unverified status applied |
| Other user's private feedback | Not readable because of RLS |
| Reporter marks restored | Only own active observation is modified |
| Non-admin attempts moderation | Supabase RLS/update guard rejects write |
| Moderator reviews report | Admin can change review status without claiming utility authority |
| Responsive layout | Navigation and cards remain usable on narrow screens |

Run `npm test`, then perform live account/RLS checks with voluntarily created
**test** accounts. Never create fabricated active outage reports on public maps.
