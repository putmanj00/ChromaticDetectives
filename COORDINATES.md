# Chromatic Detectives GPS Coordinates Reference

All coordinates verified via Google Maps / location databases.

## Stage Locations

| Stage | Title | Location | Coordinates | Radius |
|-------|-------|----------|-------------|--------|
| 01 | THE ORIGIN | **Home** | 39.101500, -84.512000 | 50m |
| 02 | THE HIVE | **Sleepy Bee Cafe** | 39.153625, -84.430003 | GPS trigger |
| 03 | GOEBEL TUNING | **Covington Core** (Radio) | 39.084286, -84.520661 | GPS trigger |
| 04 | MINERAL SEQUENCE | **Dimitridon Studios** | 39.083115, -84.509834 | GPS trigger |
| 05 | HIEROPHANY | **Hierophany & Hedge** | 39.083691, -84.510898 | 30m |
| 06 | GOLDEN GELATO | **Golden Gelato, Covington** | 39.082998, -84.512689 | 30m |
| 07 | THE LANDING | **Roebling Bridge** | 39.151265, -84.446414 | 50m |
| 08 | GALLERY SEARCH | **Cincinnati Art Museum** | 39.114476, -84.496819 | 100m |
| 09 | PAINTED VOID | **Art Museum** (AMOR cipher) | 39.1145, -84.4968 | 100m |
| 10 | SYNDICATE FOG | **The Landing** (Fog Protocol) | 39.1515, -84.4460 | GPS trigger |
| 11 | APOTHECARIUM | **Airbnb, Newport** | 39.090516, -84.491840 | 50m |
| 12 | MASTER BUILDER | **Art of the Brick** | 39.100209, -84.513475 | 75m |
| 13 | FUNGAL GLOW | **Krohn Conservatory** | 39.114968, -84.490175 | GPS trigger |
| 14 | GLITCH TRACKER | **Over-the-Rhine** | 39.1100, -84.5150 | 15m |
| 15 | PROTOCOL OMEGA | **Nicola's Ristorante** | 39.112136, -84.510632 | 30m |

## Notes

**Note:** The Stage 01 coordinate is a placeholder; set it to the player's home location in `lib/stages.ts`.

**Suggested field tests:**
- Field test GPS accuracy at 2-3 locations (recommended: Sleepy Bee, Art Museum, Nicola's)
- Adjust unlock radiuses if needed based on real-world testing

**Unlock Types:**
- `gps` - Proximity-based unlock (must be within radius)
- `scan` - AR scanning (simulated in MVP)
- `puzzle` - Interactive puzzle (radio frequency, coordinates)
- `time` - Time-locked

**Distance Reference:**
- 15m = Very close (tight radius for urban areas)
- 30m = Close (good for storefronts)
- 50m = Medium (good for buildings/blocks)
- 75-100m = Wide (good for museums/large venues)
